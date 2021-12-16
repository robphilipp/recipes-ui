import {NextApiRequest, NextApiResponse} from "next";
import {addRecipe, recipeById} from "../../../lib/recipes";
import {Recipe} from "../../../components/Recipe";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Recipe>
): Promise<void> {
    console.log("request", request)
    if (request.method === "GET") {
        return recipeById(request.query.id as string)
            .then(summaries => response.status(200).json(summaries))
    }
    if (request.method === "PUT") {
        return addRecipe(request.body as Recipe)
            .then(recipe => response.status(200).json(recipe))
    }
}