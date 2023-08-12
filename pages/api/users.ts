import {NextApiRequest, NextApiResponse} from "next";
import {RecipesUser} from "../../components/users/RecipesUser";
import {RequestMethod} from "../../lib/RequestMethod";
import {addUser, users} from "../../lib/users";
import {getToken} from "next-auth/jwt";
import {Role, roleAtLeast, roleFrom, RoleLiteral, RoleType} from "../../components/users/Role";

// todo: ultimately want these methods to work for admin and account admin, and
//       for account admin filter to only users in groups owned by the account
const userNotAdmin: (role: Role) => boolean = (role: Role) => !roleAtLeast(RoleType.ADMIN)(role.name)

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Array<RecipesUser> | RecipesUser>
): Promise<void> {
    // when user isn't logged in or doesn't have access to view the roles,
    // redirect them to the login screen
    const token = await getToken({req: request})
    if (token === undefined || token === null || userNotAdmin(token.user.role)) {
        response.redirect("/")
        return
    }

    switch (request.method) {
        case RequestMethod.GET:
            return users()
                .then(users => response.status(200).json(users))

        case RequestMethod.PUT:
            return addUser(request.body as RecipesUser)
                .then(user => response.status(200).json(user))
        default:
            console.log(`Unsupported HTTP method; method: ${request.method}; url: ${request.url}`)
            return Promise.reject(`Unsupported HTTP method; method: ${request.method}; url: ${request.url}`)
    }
}
