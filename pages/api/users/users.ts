import {NextApiRequest, NextApiResponse} from "next";
import {RecipesUser} from "../../../components/users/RecipesUser";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Array<RecipesUser>>
): Promise<void> {

}
