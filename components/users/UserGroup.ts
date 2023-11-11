import {RecipesUser} from "./RecipesUser";
import {roleAtLeast, RoleType} from "./Role";
import {failureResult, Result, successResult} from "result-fn";
import {duplicateCountsByKey, duplicatesByKey} from "../utils/ArrayUtils";

export type UserGroup = {
    readonly name: string
    readonly description: string
    readonly minRoleAllowed: RoleType
    readonly users: Array<RecipesUser>
}

export function hasUser(group: UserGroup, user: RecipesUser): boolean {
    return group.users.findIndex(groupUser => groupUser.id === user.id) >= 0
}

export function hasValidRoleFor(group: UserGroup, user: RecipesUser): boolean {
    const isRoleAllowed = roleAtLeast(group.minRoleAllowed)
    return isRoleAllowed(user.role.name)
}

export function duplicateUserCountsById(users: Array<RecipesUser>): Map<string, number> {
    return duplicateCountsByKey<RecipesUser, string>(users, user => user.id)
}


export function duplicateUsersById(users: Array<RecipesUser>): Map<string, Array<RecipesUser>> {
    return duplicatesByKey<RecipesUser, string>(users, (user: RecipesUser) => user.id)
}

function validateUserRolesAllowed(users: Array<RecipesUser>, minRole: RoleType): Result<Array<RecipesUser>, Array<RecipesUser>> {
    const isRoleAllowed = roleAtLeast(minRole)
    const validUsers = users.filter(user => isRoleAllowed(user.role.name))
    if (validUsers.length !== users.length) {
        const invalidUsers = users.filter(user => !isRoleAllowed(user.role.name))
        return failureResult(invalidUsers)
    }
    return successResult(validUsers)
}

export function usersGroupFor(
    name: string,
    description: string,
    minRole: RoleType = RoleType.USER,
    users: Array<RecipesUser> = []
): Result<UserGroup, string> {
    return validateUserRolesAllowed(users, minRole)
        .map(added => ({
            name,
            description,
            minRoleAllowed: minRole,
            users: added
        }))
        .mapFailure(invalid =>
            `Cannot create group because some user do not meet the minimum role requirement` +
            `;  [${invalid.map(user => user.email).join(", ")}]`
        )
}

export function addUserToGroup(group: UserGroup, user: RecipesUser): Result<UserGroup, string> {
    return validateUserRolesAllowed([...group.users, user], group.minRoleAllowed)
        .map(added => ({...group, users: added}))
        .mapFailure(notAdded => `Unable to add user; user_email: ${user.email}`)
}