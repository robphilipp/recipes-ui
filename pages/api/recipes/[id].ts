import {NextApiRequest, NextApiResponse} from "next";
import {addRecipe, deleteRecipe, recipeById, updateRecipe} from "../../../lib/recipes";
import {Recipe} from "../../../components/recipes/Recipe";
import {RequestMethod} from "../../../lib/RequestMethod";
import {getToken} from "next-auth/jwt";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Recipe>
): Promise<void> {
    const token = await getToken({req: request})
    console.log("Token", token)
    if (token === undefined || token === null) {
        response.redirect("/")
        return
    }

    switch (request.method) {
        case RequestMethod.GET:
            return recipeById(request.query.id as string)
                .then(summaries => response.status(200).json(summaries))

        case RequestMethod.PUT:
            return addRecipe(request.body as Recipe)
                .then(recipe => response.status(200).json(recipe))

        case RequestMethod.POST:
            return updateRecipe(request.body as Recipe)
                .then(recipe => response.status(200).json(recipe))

        // returns the deleted recipe
        case RequestMethod.DELETE:
            return deleteRecipe(request.query.id as string)
                .then(recipe => response.status(200).json(recipe))

        default:
            return Promise.reject(`Unsupported HTTP method; method: ${request.method}`)
    }
}