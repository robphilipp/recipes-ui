import {NextApiRequest, NextApiResponse} from "next";
import {roles} from "../../lib/roles";
import {Role} from "../../components/users/Role";
import {getServerSession} from "next-auth";
import authOptions from "./auth/[...nextauth]";
import {RequestMethod} from "../../lib/RequestMethod";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Array<Role>>
): Promise<void> {
    // when user isn't logged in, redirect them to the login screen
    const session = await getServerSession(request, response, authOptions)
    if (!session) {
        response.redirect("/")
        return
    }

    switch (request.method) {
        case RequestMethod.GET:
            return roles().then(roles => response.status(200).json(roles))
        default:
            return Promise.reject(`Unsupported HTTP method; method: ${request.method}`)
    }
}