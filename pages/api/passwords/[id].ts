import {NextApiRequest, NextApiResponse} from "next";
import {RequestMethod} from "../../../lib/RequestMethod";
import {setPasswordFromToken, userByToken} from "../../../lib/users";
import {emptyUser, RecipesUser} from "../../../components/users/RecipesUser";

export type NewPassword = {
    resetToken: string
    password: string
}

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<RecipesUser>
): Promise<void> {
    switch (request.method) {
        case RequestMethod.GET:
            return userByToken(request.query.id as string)
                .then(user => response.status(200).json(user))
                .catch(reason => response.status(404).json(emptyUser()))

        // new password set
        case RequestMethod.PUT:
            return setPasswordFromToken(request.body as NewPassword)
                .then(summaries => response.status(200).json(summaries))

        default:
            return Promise.reject(`Unsupported HTTP method; method: ${request.method}; url: ${request.url}`)
    }
}