import {failureResult, Result, successResult} from "result-fn";

export enum RoleType {
    ADMIN = 'admin',
    ACCOUNT_ADMIN = 'account_admin',
    USER = 'user',
}

export type Role = {
    name: RoleType
    description: string
}

export type RoleLiteral = {
    name: string
    description: string
}

const roles = new Map<RoleType, number>([
    [RoleType.ADMIN, 3],
    [RoleType.ACCOUNT_ADMIN, 2],
    [RoleType.USER, 1],
])

export function roleAtLeast(minRole: RoleType): (role: RoleType | null) => boolean {
    return (role: RoleType | null): boolean => {
        if (role === null) return false;
        const roleIndex = roles.get(role) ?? 0
        const minRoleIndex = roles.get(minRole) ?? Infinity
        return roleIndex >= minRoleIndex
    }
}

export function roleFrom(literal: RoleLiteral): Result<Role, string> {
    switch (literal.name.toLowerCase()) {
        case RoleType.ADMIN.valueOf():
            return successResult({name: RoleType.ADMIN, description: literal.description})
        case RoleType.ACCOUNT_ADMIN.valueOf():
            return successResult({name: RoleType.ACCOUNT_ADMIN, description: literal.description})
        case RoleType.USER.valueOf():
            return successResult({name: RoleType.USER, description: literal.description})
        default:
            return failureResult(`Invalid role specified; role: ${literal}`)
    }
}

export type RolesConversionResults = {
    readonly succeeded: boolean
    readonly successes: Array<Role>
    readonly failures: Array<string>
}

export function rolesFrom(literals: Array<RoleLiteral>): RolesConversionResults {
    const conversions = literals
        .map(literal => ({result: roleFrom(literal), literal: literal.name}))
        .reduce(
            (prev: RolesConversionResults, current: {result: Result<Role, string>, literal: string}) => {
                if (current.result.succeeded && current.result.value !== undefined) {
                    prev.successes.push(current.result.value)
                } else {
                    prev.failures.push(current.literal)
                }
                return {...prev}
            },
            {successes: [], failures: [], succeeded: true}
        )
    return {
        ...conversions,
        succeeded: conversions.failures.length === 0
    }
}
