import {NextApiRequest, NextApiResponse} from "next";
import {RequestMethod} from "../../../lib/RequestMethod";
import {setPasswordFromToken} from "../../../lib/users";
import {RecipesUser} from "../../../components/users/RecipesUser";

export type NewPassword = {
    resetToken: string
    password: string
}

export default function handler(
    request: NextApiRequest,
    response: NextApiResponse<RecipesUser>
): Promise<void> {
    switch (request.method) {
        // new password set
        case RequestMethod.PUT:
            return setPasswordFromToken(request.body as NewPassword)
                .then(summaries => response.status(200).json(summaries))

        case RequestMethod.POST:

        default:
            return Promise.reject(`Unsupported HTTP method; method: ${request.method}`)
    }

}