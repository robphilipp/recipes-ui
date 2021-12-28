import {NextApiRequest, NextApiResponse} from "next";
import {updateRatings} from "../../../../lib/recipes";
import {Recipe} from "../../../../components/Recipe";
import {RequestMethod} from "../../../../components/RequestMethod";

type UpdateRating = {
    newRating: number
    ratings: Array<number>
}

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Recipe>
): Promise<void> {
    switch (request.method) {
        // case RequestMethod.GET:
        //     return recipeById(request.query.id as string)
        //         .then(summaries => response.status(200).json(summaries))
        //
        // case RequestMethod.PUT:
        //     return addRecipe(request.body as Recipe)
        //         .then(recipe => response.status(200).json(recipe))

        case RequestMethod.POST:
            const recipeId = request.query.id as string
            const {newRating, ratings} = (request.body as UpdateRating)
            return updateRatings(recipeId, newRating, ratings)
                .then(recipe => response.status(200).json(recipe))
                .catch(reason => console.error(reason))

        // // returns the deleted recipe
        // case RequestMethod.DELETE:
        //     return deleteRecipe(request.query.id as string)
        //         .then(recipe => response.status(200).json(recipe))

        default:
            return Promise.reject(`Unsupported HTTP method; method: ${request.method}`)
    }
}