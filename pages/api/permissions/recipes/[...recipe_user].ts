import {NextApiRequest, NextApiResponse} from "next";
import {getToken} from "next-auth/jwt";
import {RequestMethod} from "../../../../lib/RequestMethod";
import {deletePermissionsFrom, principalTypeLiteralFrom} from "../../../../lib/permissions";
import {PrincipalType} from "../../../../components/recipes/RecipePermissions";


/**
 * Handles removing access of a user from a recipe
 * @param request The request information
 * @param response The response information
 * @return An empty promise
 * @see [../permissions.ts](../permissions.ts) for more general permission queries, adding permissions
 */
export default async function handler(request: NextApiRequest, response: NextApiResponse): Promise<void> {
    // when user isn't logged in or doesn't have access to view the roles,
    // redirect them to the login screen
    const token = await getToken({req: request})
    if (token === undefined || token === null) {
        response.redirect("/")
        return
    }

    switch (request.method) {
        case RequestMethod.DELETE: {
            const [recipeId, userId] = request.query.recipe_user as [string, string]
            return deletePermissionsFrom(recipeId, userId, principalTypeLiteralFrom(PrincipalType.USER))
                .then(perms => response.status(200).json(perms))
        }
        default:
            return Promise.reject(`Unsupported HTTP method for permissions: method: ${request.method}; url: ${request.url}`)
    }
}