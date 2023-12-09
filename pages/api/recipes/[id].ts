import {NextApiRequest, NextApiResponse} from "next";
import {addRecipe, deleteRecipe, recipeById, updateRecipe} from "../../../lib/recipes";
import {emptyRecipe, Recipe} from "../../../components/recipes/Recipe";
import {RequestMethod} from "../../../lib/RequestMethod";
import {getToken} from "next-auth/jwt";
import {getServerSession} from "next-auth";
import {authOptions} from "../auth/[...nextauth]";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Recipe>
): Promise<void> {
    const token = await getToken({req: request})
    if (token === undefined || token === null) {
        response.redirect("/")
        return
    }

    const session = await getServerSession(request, response, authOptions)
    if (session === null) {
        return response.status(200).json(emptyRecipe())
    }

    switch (request.method) {
        case RequestMethod.GET:
            return recipeById(session.user, request.query.id as string)
                .then(summaries => response.status(200).json(summaries))

        case RequestMethod.PUT:
            return addRecipe(session.user, request.body as Recipe)
                .then(recipe => response.status(200).json(recipe))

        case RequestMethod.POST:
            return updateRecipe(session.user, request.body as Recipe)
                .then(recipe => response.status(200).json(recipe))

        // returns the deleted recipe
        case RequestMethod.DELETE:
            return deleteRecipe(session.user, request.query.id as string)
                .then(recipe => response.status(200).json(recipe))

        default:
            return Promise.reject(`Unsupported HTTP method; method: ${request.method}`)
    }
}