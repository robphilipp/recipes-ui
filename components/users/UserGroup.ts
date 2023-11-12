import {RecipesUser} from "./RecipesUser";
import {roleAtLeast, RoleType} from "./Role";
import {failureResult, Result, successResult} from "result-fn";
import {duplicateCountsByKey, duplicatesByKey} from "../utils/ArrayUtils";

/**
 * Immutable user group to allow recipe permissions to be set for groups of users
 */
export type UserGroup = {
    readonly name: string
    readonly description: string
    // the minimum role allowed in this group
    readonly minRoleAllowed: RoleType
    readonly users: Array<RecipesUser>
}

export function hasMatchingUsers(group: UserGroup, predicate: (user: RecipesUser) => boolean): boolean {
    return group.users.findIndex(predicate) >= 0
}

export function hasValidRoleFor(group: UserGroup, user: RecipesUser): boolean {
    const isRoleAllowed = roleAtLeast(group.minRoleAllowed)
    return isRoleAllowed(user.role.name)
}

export function findDuplicateUserCountsFor<K>(users: Array<RecipesUser>, keyFn: (user: RecipesUser) => K): Map<K, number> {
    return duplicateCountsByKey<RecipesUser, K>(users, keyFn);
}

export function findDuplicateUserCountsById(users: Array<RecipesUser>): Map<string, number> {
    return findDuplicateUserCountsFor<string>(users, user => user.id)
}

export function findDuplicateUsersFor<K>(users: Array<RecipesUser>, keyFn: (user: RecipesUser) => K): Map<K, Array<RecipesUser>> {
    return duplicatesByKey<RecipesUser, K>(users, keyFn)
}

export function findDuplicateUsersById(users: Array<RecipesUser>): Map<string, Array<RecipesUser>> {
    return findDuplicateUsersFor<string>(users, (user: RecipesUser) => user.id)
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

export function createUserGroupFrom(
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

export function removeMatchingUsersFromGroup(group: UserGroup, predicate: (user: RecipesUser) => boolean): UserGroup {
    return {...group, users: group.users.filter(user => !predicate(user))}
}
