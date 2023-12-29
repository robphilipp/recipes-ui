/*
    A recipe permission consists of a principal (ID), a principal type (user, group),
    and a permission specifying the access rights (create, read, update, delete) that
    the principal has on a recipe.

    The access rights are represented as a decimal number, converted from the bits
    representing each access right. The bits are 1111 (CRUD) for full access, and
    0000 for no access. For example, if a user has read and update permissions to a
    recipe, then the bits would be 0110 which would be represented as 0 + 4 + 2 + 0 = 6.
 */

import {failureResult, Result, successResult} from "result-fn";


/**
 * Type that adds access rights into the object of type T.
 * This is really only meant to be used in the domain layer.
 * @see WithAccessRights for the type that is used in the database layer.
 */
export type WithPermissions<T> = T & {accessRights: AccessRights}

export enum PrincipalType {USER = 'user', GROUP = 'group'}

export function principalTypeFrom(name: string): Result<PrincipalType, string> {
    switch (name.toLowerCase()) {
        case 'user':
            return successResult(PrincipalType.USER)
        case 'group':
            return successResult(PrincipalType.GROUP)
        default:
            return failureResult(`No principal type with name exists; name: ${name}`)
    }
}

/**
 * Enumeration of valid permissions
 */
export enum AccessRight {
    CREATE = 3, READ = 2, UPDATE = 1, DELETE = 0
}

export enum Action {ADD, REMOVE}

/**
 * Immutable representation of a permissions for a recipe with
 * accessor convenience functions
 */
export type AccessRights = {
    readonly value: number
    readonly create: boolean
    readonly read: boolean
    readonly update: boolean
    readonly delete: boolean
}

const NO_PERMISSIONS = 0
const ALL_PERMISSIONS = Object.values(AccessRight)
    // because typescript enums have reverse mapping in the object, we need
    // to filter out all non-numeric values (which are the reverse mappings)
    .filter((attr: AccessRight) => !isNaN(attr.valueOf()))
    .reduce<number>(
        (sum, permission: number) => sum + Math.pow(2, permission),
        0
    )

/**
 * Helper function that calculates whether the permission value contains
 * the permission attribute. For example, a permission value of 3 contains
 * the {@link AccessRight.UPDATE} and {@link AccessRight.DELETE}
 * @param accessRights The permission value
 * @param attribute The attribute to test
 * @return `true` if the permission value contains the attribute; `false` otherwise
 */
const has = (accessRights: number, attribute: AccessRight): boolean =>
    (Math.max(0, Math.min(15, accessRights)) & Math.pow(2, attribute)) > 0

/**
 * Whether the "create" permission is set
 * @param accessRights The permission value (e.i. decimal of CRUD bits)
 * @return `true` when the permission contains "create"; otherwise returns `false`
 */
function hasCreate(accessRights: number): boolean {
    return has(accessRights, AccessRight.CREATE)
}

/**
 * Whether the "read" permission is set
 * @param accessRights The permission value (e.i. decimal of CRUD bits)
 * @return `true` when the permission contains "read"; otherwise returns `false`
 */
function hasRead(accessRights: number): boolean {
    return has(accessRights, AccessRight.READ)
}

/**
 * Whether the "update" permission is set
 * @param accessRights The permission value (e.i. decimal of CRUD bits)
 * @return `true` when the permission contains "update"; otherwise returns `false`
 */
function hasUpdate(accessRights: number): boolean {
    return has(accessRights, AccessRight.UPDATE)
}

/**
 * Higher-order function that determines whether the "delete"
 * permission is set
 * @param accessRights The permission value (i.e. decimal of CRUD bits)
 * @return `true` when the permission contains "delete"; otherwise returns `false`
 */
function hasDelete(accessRights: number): boolean {
    return has(accessRights, AccessRight.DELETE)
}

/**
 * Generates the convenience accessor values for the permission
 * @param accessRights The permission value (i.e. decimal of CRUD bits)
 * @return An access rights object from the access rights number
 */
export const accessRightsFor = (accessRights: number): AccessRights => ({
    value: accessRights,
    create: hasCreate(accessRights),
    read: hasRead(accessRights),
    update: hasUpdate(accessRights),
    delete: hasDelete(accessRights)
})

/**
 * @return a {@link Permission} object with no CRUD permissions
 */
export const noAccessRights = (): AccessRights => accessRightsFor(NO_PERMISSIONS)

/**
 * @return a {@link Permission} object with full CRUD permissions
 */
export const fullAccessRights = (): AccessRights => accessRightsFor(ALL_PERMISSIONS)

/**
 * Converts the boolean permissions into an array of {@link AccessRight} enumerations
 * @param create `true` if principal has permission to create recipes; `false` otherwise
 * @param read `true` if principal has permission to read recipes; `false` otherwise
 * @param update `true` if principal has permission to update recipes; `false` otherwise
 * @param canDelete `true` if principal has permission to delete recipes; `false` otherwise
 * @return An array of {@link AccessRight} in the order create, read, update, delete
 */
export function accessRightArrayFrom(create: boolean, read: boolean, update: boolean, canDelete: boolean): Array<AccessRight> {
    let rights: Array<AccessRight> = []
    if (create) rights.push(AccessRight.CREATE)
    if (read) rights.push(AccessRight.READ)
    if (update) rights.push(AccessRight.UPDATE)
    if (canDelete) rights.push(AccessRight.DELETE)
    return rights
}

export function accessRightArrayFor(accessRights: AccessRights): Array<AccessRight> {
    return accessRightArrayFrom(accessRights.create, accessRights.read, accessRights.update, accessRights.delete)
}

/**
 * Creates an {@link AccessRights} object from the specified boolean values
 * @param create `true` if principal has permission to create recipes; `false` otherwise
 * @param read `true` if principal has permission to read recipes; `false` otherwise
 * @param update `true` if principal has permission to update recipes; `false` otherwise
 * @param canDelete `true` if principal has permission to delete recipes; `false` otherwise
 * @return An {@link AccessRights} object based on the specified boolean values
 */
export function accessRightsWith(create: boolean, read: boolean, update: boolean, canDelete: boolean): AccessRights {
    return createAccessRightsFrom(noAccessRights(), Action.ADD, ...accessRightArrayFrom(create, read, update, canDelete))
}

/**
 * Convenience function that returns an object `{create: true}` used for filtering
 * @return an object `{read: true}` used for filtering
 * @see filteredAccessRights
 */
export const withCreateAccess = (): Partial<AccessRights> =>
    filteredAccessRights(accessRightsWith(true, false, false, false))

/**
 * Convenience function that returns an object `{read: true}` used for filtering
 * @return an object `{read: true}` used for filtering
 * @see filteredAccessRights
 */
export const withReadAccess = (): Partial<AccessRights> =>
    filteredAccessRights(accessRightsWith(false, true, false, false))

/**
 * Convenience function that returns an object `{update: true}` used for filtering
 * @return an object `{read: true}` used for filtering
 * @see filteredAccessRights
 */
export const withUpdateAccess = (): Partial<AccessRights> =>
    filteredAccessRights(accessRightsWith(false, false, true, false))

/**
 * Convenience function that returns an object `{delete: true}` used for filtering
 * @return an object `{read: true}` used for filtering
 * @see filteredAccessRights
 */
export const withDeleteAccess = (): Partial<AccessRights> =>
    filteredAccessRights(accessRightsWith(false, false, false, true))

/**
 * Returns an object the holds only the access rights that are `true`. This provides a
 * useful filter on a specific access right we care about. For example, suppose that
 * we only care about whether the user has "read" permission, and not whether the user
 * can delete or update a recipe. This provides that.
 * @param accessRights The access rights to filter
 * @return an object the holds only the access rights that are `true`
 * @see withCreateAccess
 * @see withReadAccess
 * @see withUpdateAccess
 * @see withDeleteAccess
 */
export function filteredAccessRights(accessRights: AccessRights): Partial<AccessRights> {
    let access: Partial<AccessRights> = {}
    if (accessRights.create) access = {...access, create: true}
    if (accessRights.read) access = {...access, read: true}
    if (accessRights.update) access = {...access, update: true}
    if (accessRights.delete) access = {...access, delete: true}
    return access
}

/**
 * Creates a new {@link AccessRights} based on the specified {@link accessRights}, the specifed
 * {@link action}, and the specified {@link attributes}. For example, if the specified
 * {@link permission} is 3, and the specified {@link action} is {@link Action.REMOVE},
 * and the specified {@link attributes} are {@link AccessRight.UPDATE} and
 * {@link AccessRight.DELETE}, then the result permission value will be 0 (e.g. no
 * permissions)
 *
 * @param accessRights The permission value from which to adjust
 * @param action Whether to add or remove the permission
 * @param attributes The permission attribute to add or remove
 * @return A new {@link AccessRights} object
 */
function createAccessRightsFrom(
    accessRights: AccessRights,
    action: Action,
    ...attributes: Array<AccessRight>
): AccessRights {
    const multiplier = action === Action.ADD ? 1 : -1

    const value = attributes
        // when adding an access right, it can't already exist, and when
        // removing an access right, it must already exist.
        .filter(attr => action === Action.ADD ?
            !has(accessRights.value, attr) :
            has(accessRights.value, attr)
        )
        .reduce<number>(
            (sum, attr) => sum + multiplier * Math.pow(2, attr),
            accessRights.value
        )

    return accessRightsFor(value)
}

/**
 * Sets the specified {@link attributes} on the specified {@link accessRights} and returns the
 * new {@link AccessRights}. If the permission is already set, then has no effect.
 * @param accessRights The permission value from which to adjust
 * @param attributes The permission attribute to add
 * @return A new {@link AccessRights} object
 */
export const setAccessRights = (accessRights: AccessRights, ...attributes: Array<AccessRight>): AccessRights =>
    createAccessRightsFrom(accessRights, Action.ADD, ...attributes)

/**
 * Clears the specified {@link attributes} on the specified {@link accessRights} and returns the
 * new {@link AccessRights}. If the permission is not set, then has no effect.
 * @param accessRights The permission value from which to adjust
 * @param attributes The permission attribute to remove
 * @return A new {@link AccessRights} object
 */
export const clearAccessRights = (accessRights: AccessRights, ...attributes: Array<AccessRight>): AccessRights =>
    createAccessRightsFrom(accessRights, Action.REMOVE, ...attributes)

/**
 * Immutable representation of a principal's permissions on a recipe
 */
export type RecipePermission = {
    readonly id?: string
    readonly recipeId: string
    readonly principalId: string
    readonly principal: PrincipalType
    readonly accessRights: AccessRights
}

/**
 * Creates permissions for the specified user, with the specified access rights
 * @param userId The user ID
 * @param recipeId The ID of the recipe to which the permissions are granted
 * @param accessRights The access rights for the user
 * @return A permissions object
 */
export const userPermissionFor = (userId: string, recipeId: string, accessRights: AccessRights): RecipePermission => ({
    principalId: userId,
    principal: PrincipalType.USER,
    recipeId,
    accessRights
})

/**
 * Creates permissions for the specified group of users, with the specified access rights
 * @param groupId Group ID
 * @param recipeId The ID of the recipe to which the permissions are granted
 * @param accessRights The access rights for the user
 * @return A permissions object
 */
export const groupPermissionFor = (groupId: string, recipeId: string, accessRights: AccessRights): RecipePermission => ({
    principalId: groupId,
    principal: PrincipalType.GROUP,
    recipeId,
    accessRights
})

/**
 * Sets the access rights on the permissions. This function returns a new {@link RecipePermission}
 * object for which the access rights are set to the ones specified.
 * @param permissions The recipe permissions object on which to set the access rights
 * @param accessRight The access rights
 * @return A new {@link RecipePermission} object with the specified access rights
 * @see clearAccessRightsFor
 * @see addAccessRightsTo
 * @see removeAccessRightsFrom
 */
export const setAccessRightsFor = (permissions: RecipePermission, ...accessRight: Array<AccessRight>): RecipePermission => ({
    ...permissions,
    accessRights: setAccessRights(noAccessRights(), ...accessRight)
})

/**
 * Removes all access rights on the permissions. This function returns a new {@link RecipePermission}
 * object for which the access rights have been removed (i.e. no access rights).
 * @param permissions The recipe permissions object on which to set the access rights
 * @return A new {@link RecipePermission} object with all access rights removed
 * @see setAccessRightsFor
 * @see addAccessRightsTo
 * @see removeAccessRightsFrom
 */
export const clearAccessRightsFor = (permissions: RecipePermission): RecipePermission => ({
    ...permissions,
    accessRights: setAccessRights(noAccessRights())
})

/**
 * Adds the specified access rights to the permissions. This function returns a new {@link RecipePermission}
 * object for which the specified access rights have been added.
 * @param permissions The recipe permissions object on which to set the access rights
 * @param accessRight The access rights to add
 * @return A new {@link RecipePermission} object with the specified access rights
 * @see setAccessRightsFor
 * @see clearAccessRightsFor
 * @see removeAccessRightsFrom
 */
export const addAccessRightsTo = (permissions: RecipePermission, ...accessRight: Array<AccessRight>): RecipePermission => ({
    ...permissions,
    accessRights: setAccessRights(permissions.accessRights, ...accessRight)
})

/**
 * Removes the specified access rights from the permissions. This function returns a new {@link RecipePermission}
 * object from which the specified access rights have been removed.
 * @param permissions The recipe permissions object on which to set the access rights
 * @param accessRight The access rights to remove
 * @return A new {@link RecipePermission} object with the specified access rights
 * @see setAccessRightsFor
 * @see clearAccessRightsFor
 * @see addAccessRightsTo
 */
export const removeAccessRightsFrom = (permissions: RecipePermission, ...accessRight: Array<AccessRight>): RecipePermission => ({
    ...permissions,
    accessRights: clearAccessRights(permissions.accessRights, ...accessRight)
})

/**
 * Renders the access rights as a human-readable string
 * @param rights The access rights to render
 * @return a human-readable string representing the access rights
 */
export function renderAccessRights(rights: AccessRights): string {
    const access: Array<string> = []
    if (rights.read) access.push("Read")
    if (rights.update) access.push("Update")
    if (rights.delete) access.push("Delete")
    return access.join(", ")
}
