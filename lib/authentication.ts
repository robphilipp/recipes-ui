import {compare} from "bcrypt"
import {Collection, MongoClient} from "mongodb";
import {RecipesUser} from "../components/users/RecipesUser";
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
 * @return A {@link Promise} holding the {@link RecipesUser} if authenticated; a
 * rejection otherwise
 */
export async function authenticate(credentials: Credentials): Promise<RecipesUser> {
    try {
        const client = await clientPromise
        const user = await usersCollection(client).findOne({email: credentials.email})
        if (user === null) {
            return Promise.reject(`Unable to retrieve information for user with email: ${credentials.email}`)
        }
        try {
            const authenticated = await compare(credentials.password, user.password)
            if (authenticated) {
                const role = await roleFor(user._id.toString())
                console.log(credentials, {...user, role})
                return {...user, role}
            } else {
                return Promise.reject('Invalid credentials')
            }
        } catch (e) {
            console.error(`Unable to validate credentials for ${credentials.email}`, e)
            return Promise.reject(`Unable to validate credentials for ${credentials.email}; error: ${e.message}`)
        }
    } catch (e) {
        console.error(`Unable to retrieve information for user with email: ${credentials.email}`, e)
        return Promise.reject(`Unable to retrieve information for user with email: ${credentials.email}; error: ${e.message}`)
    }
}

