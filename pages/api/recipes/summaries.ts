import {NextApiRequest, NextApiResponse} from "next";
import {recipeSummariesSearch} from "../../../lib/recipes";
import {RecipeSummary} from "../../../components/recipes/Recipe";
import {RequestMethod} from "../../../lib/RequestMethod";
import {getServerSession} from "next-auth";
import {authOptions} from "../auth/[...nextauth]";

/**
 * Retrieves the recipes that match the search terms represented in the query-parameter
 * of the API call which this handler processes
 * @param request The API request holding the search terms as query parameters
 * @param response The summaries for recipes that match the search terms
 * @return An empty promise
 */
export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Array<RecipeSummary>>
): Promise<void> {
    const session = await getServerSession(request, response, authOptions)
    if (session === null) {
        return response.status(200).json([])
    }

    // grabs the query parameters whose keys are 'name'
    const queries = typeof request.query.name === 'string' ? [request.query.name] : request.query.name
    switch (request.method) {
        case RequestMethod.GET:
            return recipeSummariesSearch(session.user, queries)
                .then(summaries => response.status(200).json(summaries))
                .catch(reason => {
                    const message = `Failed to find recipes summaries; reason: ${reason}`
                    console.log(message)
                    return Promise.reject(message)
                })
        default:
            return Promise.reject(`Unable to return recipe summaries for query: [${queries?.join(", ")}]`)
    }
}
