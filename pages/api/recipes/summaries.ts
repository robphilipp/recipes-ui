import {NextApiRequest, NextApiResponse} from "next";
import {recipeSummariesByName, recipeSummariesSearch} from "../../../lib/recipes";
import {RecipeSummary} from "../../../components/recipes/Recipe";

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
    // grabs the query parameters whose keys are 'name'
    const queries = typeof request.query.name === 'string' ? [request.query.name] : request.query.name
    return recipeSummariesSearch(queries)
        .then(summaries => response.status(200).json(summaries))
}
