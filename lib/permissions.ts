import clientPromise from "./mongodb"
import {Collection, Filter, MongoClient, ObjectId, OptionalId} from "mongodb"
import {
    AccessRights,
    accessRightsWith,
    noAccessRights,
    PrincipalType,
    principalTypeFrom,
    RecipePermission
} from "../components/recipes/RecipePermissions";

if (process.env.mongoDatabase === undefined) {
    throw Error("mongoDatabase not specified in process.env")
}
if (process.env.permissionsCollection === undefined) {
    throw Error("usersCollection not specified in process.env")
}

const MONGO_DATABASE: string = process.env.mongoDatabase
const PERMISSIONS_COLLECTION: string = process.env.permissionsCollection

export function permissionsCollection(client: MongoClient): Collection<OptionalId<MongoRecipePermission>> {
    return client.db(MONGO_DATABASE).collection(PERMISSIONS_COLLECTION)
}

export type PrincipalTypeLiteral = {
    readonly name: string
    readonly description: string
}

export function principalTypeLiteralFrom(name: "user" | "group"): PrincipalTypeLiteral {
    switch (name) {
        case "user":
            return {name, description: "User"}
        case "group":
            return {name, description: "Group"}
    }
}

export const userPrincipalType = (): PrincipalTypeLiteral => principalTypeLiteralFrom("user")
export const groupPrincipalType = (): PrincipalTypeLiteral => principalTypeLiteralFrom("group")

export type MongoRecipePermission = {
    _id: ObjectId
    recipeId: string
    principalId: string
    principalType: PrincipalTypeLiteral
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
}

function recipePermissionFrom(mongoPerms: MongoRecipePermission): RecipePermission {
    return principalTypeFrom(mongoPerms.principalType.name)
        .map(principalType => ({
            id: mongoPerms._id.toString(),
            recipeId: mongoPerms.recipeId,
            principalId: mongoPerms.principalId,
            principal: principalType,
            accessRights: accessRightsWith(mongoPerms.create, mongoPerms.read, mongoPerms.update, mongoPerms.delete)
        }))
        .getOrDefault({
            id: "",
            recipeId: "",
            principalId: "",
            principal: PrincipalType.USER,
            accessRights: noAccessRights()
        })
}

function mongoRecipePermissionsFrom(recipePermissions: RecipePermission): MongoRecipePermission {
    return {
        _id: recipePermissions.id !== undefined ? new ObjectId(recipePermissions.id) : new ObjectId(),
        recipeId: recipePermissions.recipeId,
        principalId: recipePermissions.principalId,
        principalType: principalTypeLiteralFrom(recipePermissions.principal),
        create: recipePermissions.accessRights.create,
        read: recipePermissions.accessRights.read,
        update: recipePermissions.accessRights.update,
        delete: recipePermissions.accessRights.delete,
    }
}

// function convertFilter(filter: Filter<RecipePermission>): Filter<MongoRecipePermission> {
//     Object.entries(([key, value]) => {
//         switch (key) {
//             case 'id':
//         }
//     })
// }

/**
 * Fetches permissions based on the specified {@link filter} object, which can
 * be empty. When the filter object is empty, returns all the permissions.
 * @param filter The filter object used by mongo to retrieve expressions
 * @return A promise for a list of recipe permissions that match the filter
 * object
 */
export async function permissions(filter: Filter<MongoRecipePermission> = {}): Promise<Array<RecipePermission>> {
    try {
        const client: MongoClient = await clientPromise
        return await permissionsCollection(client)
            .find(filter)
            .map(permission => recipePermissionFrom(permission))
            .toArray()
    } catch (e) {
        console.log("Unable to retrieve permissions", e)
        return Promise.reject("Unable to retrieve recipe permissions")
    }
}

export async function permissionFor(principalId: string, principalType: PrincipalTypeLiteral, recipeId: string): Promise<RecipePermission> {
    const client = await clientPromise
    try {
        const [perms, ...morePerms] = await permissions({
            principalId,
            principalType,
            recipeId
        })
        if (perms === undefined) {
            const message = `Unable to find recipe permissions; principal_id: ${principalId}; ` +
                `principal_type: ${principalType}; recipe_id: ${recipeId}`
            return Promise.reject(message)
        }
        if ((morePerms as Array<RecipePermission>).length > 0) {
        // if (morePerms !== undefined || (morePerms as Array<RecipePermission>).length > 0) {
            const message = `Found duplicate recipe permissions. Unable to proceed; principal_id: ${principalId}; ` +
                `principal_type: ${principalType}; recipe_id: ${recipeId}; ` +
                `duplicate_permission_ids: ${morePerms.map(perm => perm.id)}`
            return Promise.reject(message)
        }
        return perms
    } catch (e) {
        const message = `Unable to find recipe permissions; principal_id: ${principalId}; ` +
            `principal_type: ${principalType}; recipe_id: ${recipeId}`
        console.error(message, e)
        return Promise.reject(message)
    }
}

export const userPermissionsFor = async (userId: string, recipeId: string): Promise<RecipePermission> =>
    permissionFor(userId, principalTypeLiteralFrom(PrincipalType.USER), recipeId)

export const groupPermissionsFor = async (groupId: string, recipeId: string): Promise<RecipePermission> =>
    permissionFor(groupId, principalTypeLiteralFrom(PrincipalType.GROUP), recipeId)

export async function permissionById(permissionId: string): Promise<RecipePermission> {
    try {
        const client = await clientPromise
        const perms = await permissionsCollection(client).findOne({_id: new ObjectId(permissionId)})
        if (perms === undefined || perms === null) {
            return Promise.reject(`Unable to find permissions for specified permission ID; id: ${permissionId}`)
        }
        return recipePermissionFrom(perms)
    } catch (e) {
        const message = `Unable to find permissions for permission ID; id: ${permissionId}`
        console.error(message, e)
        return Promise.reject(message)
    }
}

export async function addPermissionTo(recipePermissions: RecipePermission): Promise<RecipePermission> {
    const {recipeId, principalId, principal: principalType, accessRights} = recipePermissions
    const client: MongoClient = await clientPromise
    const recipePermission: OptionalId<MongoRecipePermission> = {
        principalId,
        principalType: principalTypeLiteralFrom(principalType === PrincipalType.USER ? 'user' : 'group'),
        recipeId,
        create: accessRights.create,
        read: accessRights.read,
        update: accessRights.update,
        delete: accessRights.delete,
    }
    try {
        const result = await permissionsCollection(client).insertOne(recipePermission)
        if (result.insertedId !== undefined && result.insertedId !== null) {
            return await permissionById(result.insertedId.toString())
        }
        const message = `Unable to add permissions; principal_id: ${principalId}; ` +
            `principal_type: ${principalType}; recipe_id: ${recipeId}; access_rights: ${accessRights.value}`
        return Promise.reject(message)
    } catch (e) {
        const message = `Unable to add permissions (exception); principal_id: ${principalId}; ` +
            `principal_type: ${principalType}; recipe_id: ${recipeId}; access_rights: ${accessRights.value}`
        console.error(message, e)
        return Promise.reject(message)
    }
}

/**
 * Updates the access rights a user has to a recipe {@link Promise}
 * @param permissions The current recipe permissions to update
 * @param accessRights The new access rights
 * @return A promise to the updated recipe permissions
 */
export async function updateAccessRightsOn(permissions: RecipePermission, accessRights: AccessRights): Promise<RecipePermission> {
    if (permissions.id === undefined) {
        return Promise.reject(`Unable to update permissions directly because the permission's ID was not specified`)
    }
    const client: MongoClient = await clientPromise

    const updated: MongoRecipePermission = mongoRecipePermissionsFrom({...permissions, accessRights})

    const message = () => `Unable to update permissions; permission_id: ${permissions.id}; ` +
        `principal_id: ${permissions.principalId}; principal_type: ${permissions.principal}; ` +
        `recipe_id: ${permissions.recipeId}; new_access_rights: create=${updated.create}, ` +
        `read=${updated.read}, update=${updated.update}, delete=${updated.delete}`

    try {
        const result = await permissionsCollection(client)
            .updateOne({_id: new ObjectId(permissions.id)}, {$set: {...updated}})
        if (result.modifiedCount === undefined || result.modifiedCount === null) {
            return Promise.reject(message())
        }
        return await permissionById(updated._id.toString())
    } catch(e) {
        console.error(message(), e)
        return Promise.reject(message())
    }
}

/**
 * Updates the access rights associated with the specified permission ID
 * @param permissionId The ID of the {@link RecipePermission} to update
 * @param newAccessRights The new {@link AccessRights}
 @return A promise to the updated recipe permissions
 */
export async function updatePermissionsFor(permissionId: string, newAccessRights: AccessRights): Promise<RecipePermission> {
    try {
        const permissions = await permissionById(permissionId)
        return await updateAccessRightsOn(permissions, newAccessRights)
    } catch(e) {
        const message = `Unable to update permissions; permission_id: ${permissionId}; access_rights: ${newAccessRights}`
        console.error(message, e)
        return Promise.reject(message)
    }
}

/**
 * Updates the permissions a principal ({@link principalId} and {@link principalType}) has to a
 * recipe {@link recipeId}.
 * @param recipeId The ID of the recipe to which the principal has access rights
 * @param principalId The ID of the principal for which to update the access rights
 * @param principalType The type of the principal (i.e. user or group)
 * @param newAccessRights The new access rights
 * @return A promise to the updated recipe permissions
 * @see updateUserPermissionsTo
 * @see updateGroupPermissionsTo
 */
export async function updatePermissionsTo(
    recipeId: string,
    principalId: string,
    principalType: PrincipalTypeLiteral,
    newAccessRights: AccessRights
): Promise<RecipePermission> {
    try {
        const permissions = await permissionFor(principalId, principalType, recipeId)
        return await updateAccessRightsOn(permissions, newAccessRights)
    } catch(e) {
        const message = `Unable to update permissions; principalId: ${principalId}; ` +
            `principal_type: ${principalType}; recipe_id: ${recipeId}; access_rights: ${newAccessRights}`
        console.error(message, e)
        return Promise.reject(message)
    }
}

/**
 * Updates the permissions a user ({@link userId}) has to a recipe {@link recipeId}.
 * @param recipeId The ID of the recipe to which the principal has access rights
 * @param userId The ID of the user for which to update the access rights
 * @param accessRights The new access rights
 * @return A promise to the updated recipe permissions
 * @see updatePermissionsTo
 * @see updateGroupPermissionsTo
 */
export const updateUserPermissionsTo = (recipeId: string, userId: string, accessRights: AccessRights): Promise<RecipePermission> =>
    updatePermissionsTo(recipeId, userId, principalTypeLiteralFrom(PrincipalType.USER), accessRights)

export const updateGroupPermissionsTo = (recipeId: string, groupId: string, accessRights: AccessRights): Promise<RecipePermission> =>
    updatePermissionsTo(recipeId, groupId, principalTypeLiteralFrom(PrincipalType.GROUP), accessRights)

export async function deletePermissionsById(permissionsId: string): Promise<void> {
    try {
        const client = await clientPromise
        const results = await permissionsCollection(client).deleteOne({_id: new ObjectId(permissionsId)})
        if (results.deletedCount == 0) {
            const message = `Unable to delete permissions; permission_id: ${permissionsId}`
            return Promise.reject(message)
        }
    } catch (e) {
        const message = `Unable to delete permissions; permission_id: ${permissionsId}`
        console.error(message, e)
        return Promise.reject(message)

    }
}

export async function deletePermissionsFrom(
    recipeId: string,
    principalId: string,
    principalType: PrincipalTypeLiteral
): Promise<RecipePermission> {
    try {
        const client = await clientPromise
        const permissions = await permissionFor(principalId, principalType, recipeId)
        // because the permissions came from mongo, we are guaranteed to have a permissions ID
        await deletePermissionsById(permissions.id!)
        return permissions
    } catch(e) {
        const message = `Unable to delete permissions; principal_id: ${principalId}; ` +
            `principal_type: ${principalType}; recipe_id: ${recipeId}`
        console.error(message, e)
        return Promise.reject(message)
    }
}

export const deleteUserPermissionsFrom = (recipeId: string, userId: string): Promise<RecipePermission> =>
    deletePermissionsFrom(recipeId, userId, principalTypeLiteralFrom(PrincipalType.USER))

export const deleteGroupPermissionsFrom = (recipeId: string, groupId: string): Promise<RecipePermission> =>
    deletePermissionsFrom(recipeId, groupId, principalTypeLiteralFrom(PrincipalType.GROUP))
