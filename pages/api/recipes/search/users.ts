import {NextApiRequest, NextApiResponse} from "next";
import {UserWithPermissions, usersPermissionsForRecipes} from "../../../../lib/recipes";
import {RequestMethod} from "../../../../lib/RequestMethod";
import {getToken} from "next-auth/jwt";
import {getServerSession} from "next-auth";
import {authOptions} from "../../auth/[...nextauth]";
import {RecipesUser} from "../../../../components/users/RecipesUser";

export type RecipesWithUsers = {recipeId: string, permissions: Array<UserWithPermissions>}

export type UsersRequest = {
    recipeIds: Array<string>
    includeAdmins: boolean
}

async function fetchUsersPermissionsForRecipes(user: RecipesUser, recipeIds: Array<string>, includeAdmins: boolean): Promise<Array<RecipesWithUsers>> {
    const permissions = await usersPermissionsForRecipes(user, recipeIds, includeAdmins)
    return Array.from(permissions.entries())
        .map(([recipeId, permissions]) => ({recipeId, permissions}))
}

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Array<RecipesWithUsers>>
): Promise<void> {
    const token = await getToken({req: request})
    if (token === undefined || token === null) {
        response.redirect("/")
        return
    }

    const session = await getServerSession(request, response, authOptions)
    if (session === null) {
        return response.status(200).json([])
    }

    switch (request.method) {
        case RequestMethod.GET: {
            const recipeIds: Array<string> = Array.isArray(request.query.id) ?
                request.query.id as Array<string> :
                [request.query.id as string]
            return fetchUsersPermissionsForRecipes(session.user, recipeIds, request.query.admin === "true")
                .then(recipePerms => response.status(200).json(recipePerms))
        }

        case RequestMethod.POST: {
            const {recipeIds, includeAdmins} = request.body as UsersRequest
            return fetchUsersPermissionsForRecipes(session.user, recipeIds, includeAdmins)
                .then(recipePerms => response.status(200).json(recipePerms))
        }

        // case RequestMethod.POST:
        //     return updateRecipe(session.user, request.body as Recipe)
        //         .then(recipe => response.status(200).json(recipe))
        //
        // // returns the deleted recipe
        // case RequestMethod.DELETE:
        //     return deleteRecipe(session.user, request.query.id as string)
        //         .then(recipe => response.status(200).json(recipe))

        default:
            return Promise.reject(`Unsupported HTTP method; method: ${request.method}`)
    }
}

