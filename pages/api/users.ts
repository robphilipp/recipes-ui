import {NextApiRequest, NextApiResponse} from "next";
import {RecipesUser} from "../../components/users/RecipesUser";
import {getServerSession} from "next-auth";
import authOptions from "./auth/[...nextauth]";
import {RequestMethod} from "../../lib/RequestMethod";
import {users} from "../../lib/users";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Array<RecipesUser>>
): Promise<void> {
    // when user isn't logged in, redirect them to the login screen
    const session = await getServerSession(request, response, authOptions)
    console.log("Session", session)
    if (!session) {
        response.redirect("/")
        return
    }

    switch (request.method) {
        case RequestMethod.GET:
            return users().then(users => response.status(200).json(users))
        default:
            console.log(`Unsupported HTTP method; method: ${request.method}`)
            return Promise.reject(`Unsupported HTTP method; method: ${request.method}`)
    }
}
