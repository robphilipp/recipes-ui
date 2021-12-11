import {NextApiRequest, NextApiResponse} from "next";
import {Recipe, recipesById} from "../../../lib/recipes";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Recipe>
): Promise<void> {
    console.log("request", request)
    recipesById(request.query.id as string)
        .then(summaries => response.status(200).json(summaries))
}