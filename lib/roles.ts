import clientPromise from "./mongodb"
import {ClientSession, Collection, MongoClient, ObjectId} from "mongodb"
import {Role, roleFrom, rolesFrom} from "../components/users/Role"
import {RecipesUser} from "../components/users/RecipesUser";

if (process.env.mongoDatabase === undefined) {
    throw Error("mongoDatabase not specified in process.env")
}
if (process.env.rolesCollection === undefined) {
    throw Error("rolesCollection not specified in process.env")
}
if (process.env.usersRolesCollection === undefined) {
    throw Error("usersRolesCollection not specified in process.env")
}

const MONGO_DATABASE: string = process.env.mongoDatabase
const ROLES_COLLECTION: string = process.env.rolesCollection
const USERS_ROLES_COLLECTION: string = process.env.usersRolesCollection

type UserRole = {
    name: string
    description: string
}

type UsersToRoles = {
    userId: ObjectId
    roleId: ObjectId
}

function rolesCollection(client: MongoClient): Collection<UserRole> {
    return client.db(MONGO_DATABASE).collection(ROLES_COLLECTION)
}

function usersRolesCollection(client: MongoClient): Collection<UsersToRoles> {
    return client.db(MONGO_DATABASE).collection(USERS_ROLES_COLLECTION)
}

export async function roles(): Promise<Array<Role>> {
    try {
        const client: MongoClient = await clientPromise
        const roles = await rolesCollection(client).find().toArray()
        const conversions = rolesFrom(roles)
        return conversions.succeeded ?
            conversions.successes :
            Promise.reject(`Invalid roles found in database; [${conversions.failures.join(", ")}]`)
    } catch (e) {
        console.error("Unable to retrieve roles", e)
        return Promise.reject("Unable to retrieve roles")
    }
}

export async function roleIdFor(role: Role): Promise<string> {
    try {
        const client: MongoClient = await clientPromise
        const dbRole = await rolesCollection(client).findOne({name: role.name})
        return dbRole ?
            dbRole._id.toString() :
            Promise.reject(`Unable to retrieve role ID; role: ${role.name}`)
    } catch (e) {
        console.error(`Unable to retrieve role ID; role: ${role.name}`, e)
        return Promise.reject(`Unable to retrieve role ID; role: ${role.name}`)
    }
}

export async function addUsersRolesMappingFor(user: RecipesUser, session?: ClientSession): Promise<string> {
    try {
        const client: MongoClient = await clientPromise
        const roleId = await roleIdFor(user.role)
        const result = await usersRolesCollection(client)
            .insertOne({userId: new ObjectId(user.id), roleId: new ObjectId(roleId)}, {session})
        return result.insertedId.toString()
    } catch (e) {
        console.error(`Unable to add user-to-role mapping; user: ${user.email}; role: ${user.role.name}`, e)
        return Promise.reject(`Unable to add user-to-role mapping; user: ${user.email}; role: ${user.role.name}`)
    }
}

/**
 * Retrieves the role for the user, based on their user ID.
 * @param userId The string version of the users object ID ({@link ObjectId})
 * @return A {@link Promise} for the user's {@link Role}
 */
export async function roleFor(userId: string): Promise<Role> {
    try {
        const client: MongoClient = await clientPromise

        // find the entry in the users-roles mapping collection
        const entry = await usersRolesCollection(client).findOne({userId: new ObjectId(userId)})
        if (!entry) {
            return Promise.reject(`No user-role mapping entry found for user; userId: ${userId}`)
        }

        // find the role associated with the user
        const role = await rolesCollection(client).findOne({_id: new ObjectId(entry.roleId)})
        if (!role) {
            return Promise.reject(`No role found for user; userId: ${userId}`)
        }

        // convert the database role into a domain-object role
        const result = roleFrom(role)
        return result.succeeded ?
            result.getOrThrow() :
            Promise.reject(`Invalid role found for user; userId: ${userId}; role: ${role}`)
    } catch(e) {
        console.error(`Unable to retrieve role for user;  userId: ${userId}`, e)
        return Promise.reject(`Unable to retrieve role for user;  userId: ${userId}`)
    }
}
