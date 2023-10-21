import {NextApiRequest, NextApiResponse} from "next";
import {RecipesUser} from "../../components/users/RecipesUser";
import {RequestMethod} from "../../lib/RequestMethod";
import {
    AddedUserInfo,
    addUser,
    deleteUsersByEmail,
    emailExists, updateUser,
    userById,
    usernameExists,
    users
} from "../../lib/users";
import {getToken} from "next-auth/jwt";
import {Role, roleAtLeast, RoleType} from "../../components/users/Role";

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

export type AttributeExists = {
    field: string
    exists: boolean
}

export const NAME_EXISTENCE: string = "name_existence"
export const EMAIL_EXISTENCE: string = "email_existence"
export const USER_ID: string = "user_id"

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Array<RecipesUser> | RecipesUser | AddedUserInfo | DeletedCount | AttributeExists>
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
            if (request.query.hasOwnProperty(NAME_EXISTENCE)) {
                return usernameExists(request.query[NAME_EXISTENCE] as string)
                    .then(exists => response.status(200).json({field: "name", exists}))
            }
            if (request.query.hasOwnProperty(EMAIL_EXISTENCE)) {
                return emailExists(request.query[EMAIL_EXISTENCE] as string)
                    .then(exists => response.status(200).json({field: "email", exists}))
            }
            if (request.query.hasOwnProperty(USER_ID)) {
                return userById(request.query[USER_ID] as string)
                    .then(user => response.status(200).json(user))
            }
            return users(request.query)
                .then(users => response.status(200).json(users))

        // adds new user
        case RequestMethod.PUT:
            return addUser(request.body as RecipesUser)
                .then(user => response.status(200).json(user))

        case RequestMethod.POST:
            return updateUser(request.body as RecipesUser)
                .then(user => response.status(200).json(user))

        // this patches the user-list resource by performing the action on the list
        case RequestMethod.PATCH:
            const {action, emails} = request.body as UsersPatchAction
            console.log(`Delete users with patch; action: ${action}`)
            if (emails.length === 0) {
                return response.status(200).json({deletedCount: 0})
            }
            return deleteUsersByEmail(emails)
                .then(count => response.status(200).json({deletedCount: count}))

        default:
            console.log(`Unsupported HTTP method; method: ${request.method}; url: ${request.url}`)
            return Promise.reject(`Unsupported HTTP method; method: ${request.method}; url: ${request.url}`)
    }
}
