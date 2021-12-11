import {NextApiRequest, NextApiResponse} from "next";
import {Recipe, recipeSummaries, RecipeSummary} from "../../../lib/recipes";

export default function handler(request: NextApiRequest, response: NextApiResponse<Array<RecipeSummary>>): void {
    recipeSummaries().then(summaries => response.status(200).json(summaries))
}
