import {NextApiRequest, NextApiResponse} from "next";
import {getToken} from "next-auth/jwt";
import {RequestMethod} from "../../lib/RequestMethod";
import {addPermissionTo, MongoRecipePermission, permissions, principalTypeLiteralFrom} from "../../lib/permissions";
import {Filter} from "mongodb";
import {RecipePermission} from "../../components/recipes/RecipePermissions";

export const PERMISSIONS_BY_USER_ID: string = "user_id"
export const PERMISSIONS_BY_GROUP_ID: string = "group_id"

// export type UpdatePermissionsRequest = {
//     permissionId: string
//     accessRights: AccessRights
// }

function filterForPermissions(request: NextApiRequest): Filter<MongoRecipePermission> {
    const {query} = request
    if (query.hasOwnProperty(PERMISSIONS_BY_USER_ID)) {
        return {principalId: query[PERMISSIONS_BY_USER_ID], principalType: principalTypeLiteralFrom("user")}
    }
    if (query.hasOwnProperty(PERMISSIONS_BY_GROUP_ID)) {
        return {principalId: query[PERMISSIONS_BY_GROUP_ID], principalType: principalTypeLiteralFrom("group")}
    }
    return {}
}

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
            // otherwise construct a filter and grab matching permissions
            return permissions(filterForPermissions(request))
                .then(perms => response.status(200).json(perms))

        // add recipe permission
        case RequestMethod.PUT:
            return addPermissionTo(request.body as RecipePermission)
                .then(perms => response.status(200).json(perms))

        default:
            return Promise.reject(`Unsupported HTTP method: method: ${request.method}; url: ${request.url}`)
    }
}