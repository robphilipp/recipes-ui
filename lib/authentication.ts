import {compare} from "bcrypt"
import {Collection, MongoClient} from "mongodb";
import {emptyUser, RecipesUser} from "../components/users/RecipesUser";
import clientPromise from "./mongodb";
import {Credentials} from "../pages/api/auth/[...nextauth]";
import {roleFor} from "./roles";

if (process.env.mongoDatabase === undefined) {
    throw Error("mongoDatabase not specified in process.env")
}
if (process.env.usersCollection === undefined) {
    throw Error("usersCollection not specified in process.env")
}

const MONGO_DATABASE: string = process.env.mongoDatabase
const USERS_COLLECTION: string = process.env.usersCollection

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
    try {
        const client = await clientPromise
        const user = await usersCollection(client).findOne({email: credentials.email})
        if (user === null) {
            return Promise.reject(`Unable to retrieve information for user with email: ${credentials.email}`)
        }
        // if the user has been deleted, then they can't log in
        if (user.deletedOn === null || user.deletedOn as number > 0) {
            return Promise.reject(`No user exists with email of ${credentials.email}`)
        }
        // todo error message if the user's email hasn't been verified, which means that the user
        //      hasn't yet set up their password
        try {
            const authenticated = await compare(credentials.password, user.password)
            if (authenticated) {
                const role = await roleFor(user._id.toString())
                console.log(credentials, {...user, role})
                return {...user, id: user._id.toString(), role}
            }
            return emptyUser()
        } catch (e) {
            console.error(`Unable to validate credentials for ${credentials.email}`, e)
            return Promise.reject(`Unable to validate credentials for ${credentials.email}; error: ${e.message}`)
        }
    } catch (e) {
        console.error(`Unable to retrieve information for user with email: ${credentials.email}`, e)
        return Promise.reject(`Unable to retrieve information for user with email: ${credentials.email}; error: ${e.message}`)
    }
}

