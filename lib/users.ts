import clientPromise from "./mongodb"
import {Collection, MongoClient} from "mongodb"
import {User} from "next-auth";

if (process.env.mongoDatabase === undefined) {
    throw Error("mongoDatabase not specified in process.env")
}
if (process.env.usersCollction === undefined) {
    throw Error("usersCollection not specified in process.env")
}

const MONGO_DATABASE: string = process.env.mongoDatabase
const USERS_COLLECTION: string = process.env.usersCollction

function usersCollection(client: MongoClient): Collection<User> {
    return client.db(MONGO_DATABASE).collection(USERS_COLLECTION)
}

export async function usersCount(): Promise<number> {
    try {
        const client = await clientPromise
        return await usersCollection(client).countDocuments()
    } catch (e) {
        console.error("Unable to retrieve recipe count", e)
        return Promise.reject("Unable to retrieve recipe count")
    }
}
