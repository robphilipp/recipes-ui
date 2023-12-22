import {NextApiRequest, NextApiResponse} from "next";
import {usersPermissionsForRecipes} from "../../../../lib/recipes";
import {RequestMethod} from "../../../../lib/RequestMethod";
import {getToken} from "next-auth/jwt";
import {getServerSession} from "next-auth";
import {authOptions} from "../../auth/[...nextauth]";
import {RecipesWithUsers} from "../users";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Array<RecipesWithUsers>>
    // response: NextApiResponse<Array<UserRecipePermissions>>
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
        case RequestMethod.GET:
            const permissions = await usersPermissionsForRecipes(
                session.user,
                [request.query.id as string],
                request.query.admin === "true"
            )
            const recipePerms: Array<RecipesWithUsers> = Array.from(permissions.entries())
                .map(([recipeId, perms]) => ({
                    recipeId: recipeId,
                    permissions: perms
                }))
            return response.status(200).json(recipePerms)

        // return usersPermissionsForRecipe(session.user, request.query.id as string, includeAdmins)
            //     .then(permissions => response.status(200).json(permissions))

        // case RequestMethod.PUT:
        //     return addRecipe(session.user, request.body as Recipe)
        //         .then(recipe => response.status(200).json(recipe))
        //
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