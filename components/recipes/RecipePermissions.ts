/*
    A recipe permission consists of a principal (ID), a principal type (user, group),
    and a permission specifying the access rights (create, read, update, delete) that
    the principal has on a recipe.

    The access rights are represented as a decimal number, converted from the bits
    representing each access right. The bits are 1111 (CRUD) for full access, and
    0000 for no access. For example, if a user has read and update permissions to a
    recipe, then the bits would be 0110 which would be represented as 0 + 4 + 2 + 0 = 6.
 */

export enum PrincipalType {USER, GROUP}

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
    readonly hasCreate: () => boolean
    readonly hasRead: () => boolean
    readonly hasUpdate: () => boolean
    readonly hasDelete: () => boolean
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
 * Higher-order function that determines whether the "create"
 * permission is set
 * @param accessRights The permission value (e.i. decimal of CRUD bits)
 * @return a function on the permission that returns `true` when the
 * permission contains "create"; otherwise returns `false`
 */
function hasCreate(accessRights: number): () => boolean {
    return () => has(accessRights, AccessRight.CREATE)
}

/**
 * Higher-order function that determines whether the "read"
 * permission is set
 * @param accessRights The permission value (e.i. decimal of CRUD bits)
 * @return a function on the permission that returns `true` when the
 * permission contains "read"; otherwise returns `false`
 */
function hasRead(accessRights: number): () => boolean {
    return () => has(accessRights, AccessRight.READ)
}

/**
 * Higher-order function that determines whether the "update"
 * permission is set
 * @param accessRights The permission value (e.i. decimal of CRUD bits)
 * @return a function on the permission that returns `true` when the
 * permission contains "update"; otherwise returns `false`
 */
function hasUpdate(accessRights: number): () => boolean {
    return () => has(accessRights, AccessRight.UPDATE)
}

/**
 * Higher-order function that determines whether the "delete"
 * permission is set
 * @param accessRights The permission value (i.e. decimal of CRUD bits)
 * @return a function on the permission that returns `true` when the
 * permission contains "delete"; otherwise returns `false`
 */
function hasDelete(accessRights: number): () => boolean {
    return () => has(accessRights, AccessRight.DELETE)
}

/**
 * Generates the convenience accessor functions for the permission
 * @param accessRights The permission value (i.e. decimal of CRUD bits)
 * @return An object holding the convenience accessor functions for
 * the permission
 */
const accessRightsFns = (accessRights: number) => ({
    hasCreate: hasCreate(accessRights),
    hasRead: hasRead(accessRights),
    hasUpdate: hasUpdate(accessRights),
    hasDelete: hasDelete(accessRights)
})

/**
 * @return a {@link Permission} object with no CRUD permissions
 */
export const noAccessRights = (): AccessRights => ({value: NO_PERMISSIONS, ...accessRightsFns(NO_PERMISSIONS)})

/**
 * @return a {@link Permission} object with full CRUD permissions
 */
export const fullAccessRights = (): AccessRights => ({value: ALL_PERMISSIONS, ...accessRightsFns(ALL_PERMISSIONS)})

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

    return {value, ...accessRightsFns(value)}
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
    readonly principalId: string
    readonly principal: PrincipalType
    readonly accessRights: AccessRights
}

export type PrincipalTypeLiteral = {
    readonly name: string
    readonly description: string
}

export function principalTypeFrom(name: "user" | "group"): PrincipalTypeLiteral {
    switch (name) {
        case "user": return {name, description: "User"}
        case "group": return {name, description: "Group"}
    }
}

/**
 * Creates permissions for the specified user, with the specified access rights
 * @param id The user ID
 * @param accessRights The access rights for the user
 * @return A permissions object
 */
export const userPermissionFor = (id: string, accessRights: AccessRights): RecipePermission => ({
    principalId: id,
    principal: PrincipalType.USER,
    accessRights: accessRights
})

/**
 * Creates permissions for the specified group of users, with the specified access rights
 * @param id Group ID
 * @param accessRights The access rights for the user
 * @return A permissions object
 */
export const groupPermissionFor = (id: string, accessRights: AccessRights): RecipePermission => ({
    principalId: id,
    principal: PrincipalType.GROUP,
    accessRights: accessRights
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
