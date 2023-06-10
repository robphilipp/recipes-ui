import {compare} from "bcrypt"
import {Collection, MongoClient} from "mongodb";
import {RecipesUser} from "../components/RecipesUser";
import clientPromise from "./mongodb";
import {Credentials} from "../pages/api/auth/[...nextauth]";

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

export async function authenticate(credentials: Credentials): Promise<RecipesUser> {
    try {
        const client = await clientPromise
        const user = await usersCollection(client).findOne({email: credentials.email})
        if (user === null) {
            return Promise.reject(`Unable to retrieve information for user with email: ${credentials.email}`)
        }
        console.log(credentials, user)
        try {
            const authenticated = await compare(credentials.password, user.password)
            if (authenticated) {
                return user
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

