import {failureResult, Result, successResult} from "result-fn";

export enum PrincipalType {USER, GROUP}

export enum PermissionAttribute {CREATE, READ, UPDATE, DELETE}

export enum PermissionAction {ADD, REMOVE}

/**
 * Immutable representation of a permission for recipes
 */
export type Permission = {
    readonly create: boolean
    readonly read: boolean
    readonly update: boolean
    readonly delete: boolean
}

export const noPermissions = () => ({create: false, read: false, update: false, delete: false})
export const fullPermissions = () => ({create: true, read: true, update: true, delete: true})

/**
 * Immutable representation of a principal's permissions on a recipe
 */
export type RecipePermission = {
    readonly principalId: string
    readonly principal: PrincipalType
    readonly permission: Permission
}

export const userPermissionFor = (id: string, permission: Permission): RecipePermission => ({
    principalId: id,
    principal: PrincipalType.USER,
    permission
})

export const groupPermissionFor = (id: string, permission: Permission): RecipePermission => ({
    principalId: id,
    principal: PrincipalType.GROUP,
    permission
})

const createPermissions = (isSet: boolean = true, permission: Permission, ...attributes: Array<PermissionAttribute>): Permission =>
    attributes.reduce(
        (permissions: Permission, attribute: PermissionAttribute): Permission => {
            switch (attribute) {
                case PermissionAttribute.CREATE:
                    return {...permissions, create: isSet}
                case PermissionAttribute.READ:
                    return {...permissions, read: isSet}
                case PermissionAttribute.UPDATE:
                    return {...permissions, update: isSet}
                case PermissionAttribute.DELETE:
                    return {...permissions, delete: isSet}
            }
        },
        // noPermissions()
        permission
    )

export const setPermissions = (permission: Permission, ...attributes: Array<PermissionAttribute>): Permission => createPermissions(true, permission, ...attributes)
export const clearPermissions = (permission: Permission, ...attributes: Array<PermissionAttribute>): Permission => createPermissions(false, permission, ...attributes)

export const updatePermissionsWith = (permission: RecipePermission, attributes: Array<PermissionAttribute>, action: PermissionAction): RecipePermission => ({
    ...permission,
    permission: createPermissions(action === PermissionAction.ADD, permission.permission, ...attributes)
})

export const addPermissions = (permission: RecipePermission, attributes: Array<PermissionAttribute>): RecipePermission =>
    updatePermissionsWith(permission, attributes, PermissionAction.ADD)

export const removePermissions = (permission: RecipePermission, attributes: Array<PermissionAttribute>): RecipePermission =>
    updatePermissionsWith(permission, attributes, PermissionAction.REMOVE)

/*
 * Conversions of permissions to and from their number representations
 * For example, full permissions are C R U D -> 1 1 1 1 = 15.
 */

/**
 *
 * @param permission
 */
export function permissionToNumber(permission: Permission): number {
    return (permission.create ? 8 : 0) +
        (permission.read ? 4 : 0) +
        (permission.update ? 2 : 0) +
        (permission.delete ? 1 : 0)
    // return Object.values(permission).reduce<number>(
    //     (sum, permission, index) => permission ? sum + Math.pow(2, index) : sum,
    //     0
    // )
}

export function permissionFromNumber(permission: number): Result<Permission, string> {
    if (permission < 0 || permission > 15) {
        return failureResult(`Permission must be in the interval [0, 15]; permission: ${permission}`)
    }
    return successResult({
        create: (permission & 8) > 0,
        read: (permission & 4) > 0,
        update: (permission & 2) > 0,
        delete: (permission & 1) > 0
    })
}
