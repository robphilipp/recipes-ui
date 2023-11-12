import {NextApiRequest, NextApiResponse} from "next";
import {getToken} from "next-auth/jwt";
import {RequestMethod} from "../../lib/RequestMethod";
import {permissions} from "../../lib/permissions";
import {Filter} from "mongodb";
import {principalTypeFrom, RecipePermission} from "../../components/recipes/RecipePermissions";

export const PERMISSIONS_BY_USER_ID: string = "user_id"
export const PERMISSIONS_BY_GROUP_ID: string = "group_id"

function filterForPermissions(request: NextApiRequest): Filter<RecipePermission> {
    const {query} = request
    if (query.hasOwnProperty(PERMISSIONS_BY_USER_ID)) {
        return {principalId: query[PERMISSIONS_BY_USER_ID], principalType: principalTypeFrom("user")}
    }
    if (query.hasOwnProperty(PERMISSIONS_BY_GROUP_ID)) {
        return {principalId: query[PERMISSIONS_BY_GROUP_ID], principalType: principalTypeFrom("group")}
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
        case RequestMethod.GET:
            return permissions(filterForPermissions(request))
                .then(perms => response.status(200).json(perms))
        default:
            return Promise.reject(`Unsupported HTTP method: method: ${request.method}; url: ${request.url}`)
    }
}