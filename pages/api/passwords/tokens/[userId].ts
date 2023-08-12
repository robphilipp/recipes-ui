import {NextApiRequest, NextApiResponse} from "next";
import {RequestMethod} from "../../../../lib/RequestMethod";
import {PasswordResetToken} from "../../../../components/passwords/PasswordResetToken";
import {addPasswordResetTokenFor, tokensFor} from "../../../../lib/passwords";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Array<PasswordResetToken> | PasswordResetToken>
): Promise<void> {
    switch (request.method) {
        // retrieve password reset tokens for user
        case RequestMethod.GET:
            return tokensFor(request.query.userId as string)
                .then(tokens => response.status(200).json(tokens))
                .catch(reason => response.status(404).json([]))

        // add new password reset token
        case RequestMethod.PUT:
            const tokenInfo = request.body as PasswordResetToken
            return addPasswordResetTokenFor(tokenInfo.userId)
                .then(token => response.status(200).json(token))

        default:
            return Promise.reject(`Unsupported HTTP method; method: ${request.method}; url: ${request.url}`)
    }
}