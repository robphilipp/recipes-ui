import {NextApiRequest, NextApiResponse} from "next";
import {RequestMethod} from "../../../../lib/RequestMethod";
import {PasswordResetToken} from "../../../../components/passwords/PasswordResetToken";
import {PasswordResetTokenPurgeResult, purgeExpiredTokens, retrieveExpiredTokens} from "../../../../lib/passwords";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Array<PasswordResetToken> | PasswordResetTokenPurgeResult>
): Promise<void> {
    switch (request.method) {
        // retrieve all the expired password reset tokens
        case RequestMethod.GET:
            return retrieveExpiredTokens()
                .then(tokens => response.status(200).json(tokens))
                .catch(reason => response.status(404).json([]))

        // purge expired password reset tokens
        case RequestMethod.DELETE:
            return purgeExpiredTokens()
                .then(results => response.status(200).json(results))

        default:
            return Promise.reject(`Unsupported HTTP method; method: ${request.method}; url: ${request.url}`)
    }
}