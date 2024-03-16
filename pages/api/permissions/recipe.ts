import {NextApiRequest, NextApiResponse} from "next";
import {getToken} from "next-auth/jwt";
import {RequestMethod} from "../../../lib/RequestMethod";
import {addPermissionTo, updateUserPermissionsTo} from "../../../lib/permissions";
import {AccessRights, PrincipalType, RecipePermission} from "../../../components/recipes/RecipePermissions";
import {userIdFor} from "../../../lib/users";


export type UpdateRecipesPermissionRequest = {
    recipeId: string
    userId: string
    accessRights: AccessRights
}

export type AddRecipesPermissionRequest = {
    recipeId: string
    email: string
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
        // update permissions for a user that already has access to the recipe
        // case RequestMethod.POST: {
        case RequestMethod.PATCH: {
            const {recipeId, userId, accessRights} = request.body as UpdateRecipesPermissionRequest
            const permissions = await updateUserPermissionsTo(recipeId, userId, accessRights)
            response.status(200).json(permissions)
            return
        }

        // add permissions to a user that doesn't already have access
        case RequestMethod.PUT: {
            const {recipeId, email, accessRights} = request.body as AddRecipesPermissionRequest
            const userId = await userIdFor(email)
            if (userId === undefined || userId === null || userId === '') {
                return Promise.reject(`No user found for specified email; email: ${email}; recipe_id" ${recipeId}`)
            }
            const permission: RecipePermission = {
                recipeId,
                principalId: userId,
                principal: PrincipalType.USER,
                accessRights
            }
            const updatedPermissions = await addPermissionTo(permission)
            response.status(200).json(updatedPermissions)
            return
        }


        default:
            return Promise.reject(`Unsupported HTTP method for permissions: method: ${request.method}; url: ${request.url}`)
    }
}