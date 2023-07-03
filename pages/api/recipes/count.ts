import {NextApiRequest, NextApiResponse} from "next";
import {recipeCount} from "../../../lib/recipes";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<number>
): Promise<void> {
    return recipeCount()
        .then(count => response.status(200).json(count))
        .catch(reason => console.log("Failed to get recipe count; reason: ", reason))
}
