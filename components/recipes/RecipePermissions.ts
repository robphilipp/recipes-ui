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

const noPermissions = () => ({create: false, read: false, update: false, delete: false})
const fullPermissions = () => ({create: true, read: true, update: true, delete: true})

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

export const setPermissions = (isSet: boolean = true, ...attributes: Array<PermissionAttribute>): Permission =>
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
        noPermissions()
    )

export const updatePermissionsWith = (permission: RecipePermission, attributes: Array<PermissionAttribute>, action: PermissionAction): RecipePermission => ({
    ...permission,
    permission: setPermissions(action === PermissionAction.ADD, ...attributes)
})

export const addPermissions = (permission: RecipePermission, attributes: Array<PermissionAttribute>): RecipePermission =>
    updatePermissionsWith(permission, attributes, PermissionAction.ADD)

export const removePermissions = (permission: RecipePermission, attributes: Array<PermissionAttribute>): RecipePermission =>
    updatePermissionsWith(permission, attributes, PermissionAction.REMOVE)

