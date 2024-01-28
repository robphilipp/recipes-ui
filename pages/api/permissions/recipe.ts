import {NextApiRequest, NextApiResponse} from "next";
import {getToken} from "next-auth/jwt";
import {RequestMethod} from "../../../lib/RequestMethod";
import {updateUserPermissionsTo} from "../../../lib/permissions";
import {AccessRights, RecipePermission} from "../../../components/recipes/RecipePermissions";


export type UpdateRecipesPermissionRequest = {
    recipeId: string
    userId: string
    accessRights: AccessRights
}

/**
 * Handles updating the permissions to a recipe
 * @param request The request information
 * @param response The response information
 * @return An empty promise
 */
export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<RecipePermission>
): Promise<void> {
    // when user isn't logged in or doesn't have access to view the roles,
    // redirect them to the login screen
    const token = await getToken({req: request})
    if (token === undefined || token === null) {
        response.redirect("/")
        return
    }

    switch (request.method) {
        // update permissions
        case RequestMethod.POST:
            const {recipeId, userId, accessRights} = request.body as UpdateRecipesPermissionRequest
            return updateUserPermissionsTo(recipeId, userId, accessRights)
                .then(perms => response.status(200).json(perms))

        default:
            return Promise.reject(`Unsupported HTTP method for permissions: method: ${request.method}; url: ${request.url}`)
    }
}