import {NextApiRequest, NextApiResponse} from "next";
import {recipesById} from "../../../lib/recipes";
import {Recipe} from "../../../components/Recipe";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Recipe>
): Promise<void> {
    console.log("request", request)
    return recipesById(request.query.id as string)
        .then(summaries => response.status(200).json(summaries))
}