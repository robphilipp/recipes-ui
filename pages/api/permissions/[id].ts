import {NextApiRequest, NextApiResponse} from "next";
import {getToken} from "next-auth/jwt";
import {RequestMethod} from "../../../lib/RequestMethod";
import {deletePermissionsById, permissionById, updatePermissionsFor} from "../../../lib/permissions";
import {AccessRights} from "../../../components/recipes/RecipePermissions";


/**
 * Handles getting permissions by permission ID, updating permissions for a specified permission ID,
 * and deleting a permission by its ID
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
        // retrieve recipe permissions based on the filter
        case RequestMethod.GET:
            return permissionById(request.query.id as string)
                .then(perms => response.status(200).json(perms))

        // update permissions
        case RequestMethod.POST:
            // const {permissionId, accessRights} = request.body as UpdatePermissionsRequest
            return updatePermissionsFor(request.query.id as string, request.body as AccessRights)
                .then(perms => response.status(200).json(perms))

        case RequestMethod.DELETE:
            return deletePermissionsById(request.query.id as string)
                .then(perms => response.status(200).json(perms))

        default:
            return Promise.reject(`Unsupported HTTP method for permissions: method: ${request.method}; url: ${request.url}`)
    }
}