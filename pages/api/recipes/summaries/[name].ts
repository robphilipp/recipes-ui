import {NextApiRequest, NextApiResponse} from "next";
import {recipeSummariesSearch} from "../../../../lib/recipes";
import {RecipeSummary} from "../../../../components/Recipe";

export default async function handler(request: NextApiRequest, response: NextApiResponse<Array<RecipeSummary>>): Promise<void> {
    const queries = typeof request.query.name === 'string' ?
        [request.query.name] :
        request.query.name
    return recipeSummariesSearch(queries)
        .then(summaries => response.status(200).json(summaries))
}