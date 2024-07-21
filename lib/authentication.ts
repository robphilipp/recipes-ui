import {compare} from "bcryptjs"
import {Collection, MongoClient} from "mongodb";
import {emptyUser, RecipesUser} from "../components/users/RecipesUser";
import clientPromise, {updateMongoClient} from "./mongodb";
import {Credentials} from "../pages/api/auth/[...nextauth]";
import {roleFor} from "./roles";
import {Logger} from "tslog"

const logger = new Logger({name: "user-authenticate"})

if (process.env.mongoDatabase === undefined) {
    throw Error("mongoDatabase not specified in process.env")
}
if (process.env.usersCollection === undefined) {
    throw Error("usersCollection not specified in process.env")
}

const MONGO_DATABASE: string = process.env.mongoDatabase
const USERS_COLLECTION: string = process.env.usersCollection

logger.debug(`hosts: [${process.env.MONGODB_URI}]; db: ${MONGO_DATABASE}; collection: ${USERS_COLLECTION}`)

function usersCollection(client: MongoClient): Collection<RecipesUser> {
    return client.db(MONGO_DATABASE).collection(USERS_COLLECTION)
}

/**
 * Attempts to authenticate the user against the database, and if authenticated,
 * enriches the database user with their role.
 * @param credentials The credentials (username, password) to use for authenticating
 * @return A {@link Promise} holding the {@link RecipesUser} if authenticated; when
 * the credentials are incorrect, returns a promise holding an empty user; otherwise
 * returns a rejection
 */
export async function authenticate(credentials: Credentials): Promise<RecipesUser> {
    logger.debug(`Attempting to authenticate user; email: ${credentials.email}`)
    try {
        const client = await clientPromise
        logger.info(`Retrieved mongo client, attempting to retrieve user; email: ${credentials.email}`)
        const user = await usersCollection(client).findOne({email: credentials.email})
        if (user === null) {
            const message = `Unable to authenticate user; email: ${credentials.email}`
            logger.info(message)
            return emptyUser()
        }
        // if the user has been deleted, then they can't log in
        if (user.deletedOn === null || user.deletedOn as number > 0) {
            const message = `Unable to authenticate user; email: ${credentials.email}; timestamp: ${Date.now()}`
            logger.info(message)
            return emptyUser()
        }
        // todo error message if the user's email hasn't been verified, which means that the user
        //      hasn't yet set up their password
        try {
            logger.debug(`Evaluating credentials; email: ${credentials.email}`)
            const authenticated = await compare(credentials.password, user.password)
            if (authenticated) {
                const role = await roleFor(user._id.toString())
                logger.info(`User authenticated; email: ${credentials.email}; name: ${user.name}; role: ${role.name}`);
                return {...user, id: user._id.toString(), role}
            }
            logger.debug(`Invalid credentials for user; email: ${credentials.email}`);
            return emptyUser()
        } catch (e) {
            const message = `Unable to validate credentials for ${credentials.email}; error: ${e.message}`
            logger.error(message)
            return emptyUser()
        }
    } catch (e) {
        const message = `Unable to retrieve information for user; email: ${credentials.email}; error: ${e.message}`;
        logger.error(message)

        // attempt to reconnect
        updateMongoClient()

        // return Promise.reject(message)
        return emptyUser()
    }
}

