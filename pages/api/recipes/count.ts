import {NextApiRequest, NextApiResponse} from "next";
import {recipeSummariesCount} from "../../../lib/recipes";
import {getServerSession} from "next-auth";
import {authOptions} from "../auth/[...nextauth]";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<number>
): Promise<void> {
    const session = await getServerSession(request, response, authOptions)
    if (session === null) {
        return response.status(200).json(0)
    }

    return recipeSummariesCount(session.user, [''])
        .then(count => response.status(200).json(count))
        .catch(reason => console.log("Failed to get recipe count; reason: ", reason))
}
