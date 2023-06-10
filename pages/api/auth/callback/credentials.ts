// import {NextApiRequest, NextApiResponse} from "next";
// import {RequestMethod} from "../../../../components/RequestMethod";
// import {authenticate} from "../../../../lib/authentication";
// import {Credentials} from "../[...nextauth]";
// import {RecipesUser} from "../../../../components/RecipesUser";
//
// export default async function handler(
//     request: NextApiRequest,
//     response: NextApiResponse<RecipesUser>
// ): Promise<void> {
//     switch (request.method) {
//         case RequestMethod.POST:
//             console.log("authenticate handler", request.body)
//             return authenticate(request.body as Credentials)
//                 .then(user => response.status(200).json(user))
//         default:
//             return Promise.reject(`Unsupported HTTP method; method: ${request.method}`)
//     }
// }