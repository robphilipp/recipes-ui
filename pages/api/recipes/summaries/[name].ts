import {NextApiRequest, NextApiResponse} from "next";
import {recipeSummaries, recipeSummariesByName, RecipeSummary} from "../../../../lib/recipes";

export default async function handler(request: NextApiRequest, response: NextApiResponse<Array<RecipeSummary>>): Promise<void> {
    console.log("request", request)
    recipeSummariesByName([request.query.name as string])
        .then(summaries => response.status(200).json(summaries))
}