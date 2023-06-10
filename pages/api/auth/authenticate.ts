// import {NextApiRequest, NextApiResponse} from "next";
// import {RequestMethod} from "../../../components/RequestMethod";
// import {authenticate} from "../../../lib/authentication";
// import {Credentials} from "./[...nextauth]";
// import {User} from "../../../components/User";
//
// export default async function handler(
//     request: NextApiRequest,
//     response: NextApiResponse<User>
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