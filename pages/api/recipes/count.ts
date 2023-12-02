import {NextApiRequest, NextApiResponse} from "next";
import {recipeSummariesSearch} from "../../../lib/recipes";
import {getServerSession} from "next-auth";
import {authOptions} from "../auth/[...nextauth]";
import {RecipeSummary} from "../../../components/recipes/Recipe";
import {hasAccessTo} from "../../../lib/authorization/authorization";
import {hasAccess} from "../../../lib/authorization/recipes";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<number>
): Promise<void> {
    const session = await getServerSession(request, response, authOptions)
    if (session === null) {
        return response.status(200).json(0)
    }

    // higher-order function used to determine whether user is authorized to view the recipe summary
    const isAuthorized: (resource: RecipeSummary) => boolean = hasAccessTo<RecipeSummary>(session, [hasAccess])

    return recipeSummariesSearch(session.user, [''])
        .then(summaries => response.status(200).json(summaries.length))
        .catch(reason => console.log("Failed to get recipe count; reason: ", reason))
}
