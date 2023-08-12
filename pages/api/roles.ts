import {NextApiRequest, NextApiResponse} from "next";
import {roles} from "../../lib/roles";
import {Role, roleAtLeast, RoleType} from "../../components/users/Role";
import {RequestMethod} from "../../lib/RequestMethod";
import {getToken} from "next-auth/jwt";

// const userCannotViewRoles: (role: RoleType | null) => boolean = roleAtLeast(RoleType.ACCOUNT_ADMIN)
const cannotViewRoles: (role: Role) => boolean = (role: Role) => !roleAtLeast(RoleType.ADMIN)(role.name)

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Array<Role>>
): Promise<void> {
    // when user isn't logged in or doesn't have access to view the roles,
    // redirect them to the login screen
    const token = await getToken({req: request})
    if (token === undefined || token === null || cannotViewRoles(token.user.role)) {
        response.redirect("/")
        return
    }

    switch (request.method) {
        case RequestMethod.GET:
            return roles().then(roles => response.status(200).json(roles))
        default:
            return Promise.reject(`Unsupported HTTP method; method: ${request.method}; url: ${request.url}`)
    }
}