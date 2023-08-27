import {NextApiRequest, NextApiResponse} from "next";
import {RecipesUser} from "../../components/users/RecipesUser";
import {RequestMethod} from "../../lib/RequestMethod";
import {AddedUserInfo, addUser, deleteUsers, users} from "../../lib/users";
import {getToken} from "next-auth/jwt";
import {Role, roleAtLeast, roleFrom, RoleLiteral, RoleType} from "../../components/users/Role";

// todo: ultimately want these methods to work for admin and account admin, and
//       for account admin filter to only users in groups owned by the account
const userNotAdmin: (role: Role) => boolean = (role: Role) => !roleAtLeast(RoleType.ADMIN)(role.name)

export type DeletedCount = {
    deletedCount: number
}

export type UsersPatchAction = {
    action: "delete"
    emails: Array<string>
}

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Array<RecipesUser> | AddedUserInfo | DeletedCount>
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

        // this patches the user-list resource by performing the action on the list
        case RequestMethod.PATCH:
            const {action, emails} = request.body as UsersPatchAction
            console.log(`Delete users with patch; action: ${action}`)
            // const emails: Array<string> = [request.query.email || ""]
            //     .flatMap(email => email)
            //     .filter(email => email.length > 0)
            if (emails.length === 0) {
                return response.status(200).json({deletedCount: 0})
            }
            return deleteUsers(emails)
                .then(count => response.status(200).json({deletedCount: count}))

        default:
            console.log(`Unsupported HTTP method; method: ${request.method}; url: ${request.url}`)
            return Promise.reject(`Unsupported HTTP method; method: ${request.method}; url: ${request.url}`)
    }
}
