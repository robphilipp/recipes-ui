import clientPromise from "./mongodb"
import {Collection, Filter, MongoClient} from "mongodb"
import {RecipePermission} from "../components/recipes/RecipePermissions";

if (process.env.mongoDatabase === undefined) {
    throw Error("mongoDatabase not specified in process.env")
}
if (process.env.permissionsCollection === undefined) {
    throw Error("usersCollection not specified in process.env")
}

const MONGO_DATABASE: string = process.env.mongoDatabase
const PERMISSIONS_COLLECTION: string = process.env.permissionsCollection

function permissionsCollection(client: MongoClient): Collection<RecipePermission> {
    return client.db(MONGO_DATABASE).collection(PERMISSIONS_COLLECTION)
}

export async function permissions(filter: Filter<RecipePermission> = {}): Promise<Array<RecipePermission>> {
    try {
        const client: MongoClient = await clientPromise
        return await permissionsCollection(client)
            .find(filter)
            .map(permission => ({...permission, id: permission._id.toString()}))
            .toArray()
    } catch (e) {
        console.log("Unable to retrieve permissions", e)
        return Promise.reject("Unable to retrieve recipe permissions")
    }
}
