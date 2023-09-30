import {NextApiRequest, NextApiResponse} from "next";
import {RequestMethod} from "../../../../lib/RequestMethod";
import {PasswordResetToken, UrlEnrichedPasswordResetToken} from "../../../../components/passwords/PasswordResetToken";
import {addPasswordResetTokenFor, tokensFor} from "../../../../lib/passwords";
import {failureResult, Result, successResult} from "result-fn";

const DEFAULT_BASE_URL = 'http://localhost:8080'

/**
 * Attempts to retrieve the protocol and host (with port) from the headers and construct
 * a base URL for the user to reset their password. If the protocol or host are not found,
 * then returns a failure result
 * @param request nextjs API request object
 * @return A {@link Result} holding the base URL or a failure
 */
function baseUrlFrom(request: NextApiRequest): Result<string, string> {
    const protoIndex = request.rawHeaders.findIndex(elem => elem == "x-forwarded-proto")
    if (protoIndex < 0 || protoIndex > request.rawHeaders.length-1) {
        return failureResult('Unable to find "x-forwarded-proto" in the headers')
    }
    const hostIndex = request.rawHeaders.findIndex(elem => elem == "x-forwarded-host")
    if (hostIndex < 0 || hostIndex > request.rawHeaders.length-1) {
        return failureResult('Unable to find "x-forwarded-host" in the headers')
    }
    return successResult(`${request.rawHeaders[protoIndex+1]}://${request.rawHeaders[hostIndex+1]}`)
}

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Array<UrlEnrichedPasswordResetToken> | PasswordResetToken>
): Promise<void> {
    switch (request.method) {
        // retrieve password reset tokens for user
        case RequestMethod.GET:
            const url = baseUrlFrom(request)
                .onFailure(error => console.log(`Unable to construct base URL, using "${DEFAULT_BASE_URL}" instead; error: ${error}`))
                .getOrDefault(DEFAULT_BASE_URL)
            return tokensFor(request.query.userId as string)
                .then(tokens => response.status(200)
                    .json(tokens.map(token => ({...token, url})))
                )
                .catch(reason => response.status(404).json(reason))

        // add new password reset token
        case RequestMethod.PUT:
            return addPasswordResetTokenFor(request.query.userId as string)
                .then(token => response.status(200).json(token))

        default:
            return Promise.reject(`Unsupported HTTP method; method: ${request.method}; url: ${request.url}`)
    }
}