import NextAuth, {User} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import {authenticate} from "../../../lib/authentication";
import {RecipesUser} from "../../../components/RecipesUser";

export type Credentials = {
    email: string
    password: string
}

const credentialsProvider = CredentialsProvider({
    id: 'recipes-provider-mongo-credentials',
    // The name to display on the sign in form (e.g. 'Sign in with...')
    name: 'email and password',
    // use credentials to log in (setting this will cause the authorize function, which
    // is defined below, to be called)
    type: "credentials",
    // The credentials is used to generate a suitable form on the sign in page.
    // You can specify whatever fields you are expecting to be submitted.
    // e.g. domain, username, password, 2FA token, etc.
    // You can pass any HTML attribute to the <input> tag through the object.
    credentials: {
        email: { label: "Email", type: "text", placeholder: "email" },
        password: { label: "Password", type: "password" }
    },
    async authorize(credentials, req): Promise<RecipesUser | null> {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)
        // const res = await fetch("/api/auth/callback/credentials", {
        // // const res = await fetch("/api/auth/authenticate", {
        //     method: 'POST',
        //     body: JSON.stringify(credentials as Credentials),
        //     headers: { "Content-Type": "application/json" }
        // })
        //
        // const user = await res.json()
        // authenticate the user
        const user = await authenticate(credentials as Credentials)
        console.log("authorize callback", user)


        // If no error and we have user data, return it
        // if (res.ok && user) {
        if (user) {
            return user
        }
        // Return null if user data could not be retrieved
        return null
    }
})

// export const authOptions: AuthOptions = {
//     // no providers because we are providing our own database
//     providers: [credentialsProvider],
//     // // same mongo database that holds the recipes (I'm sure I'll
//     // // regret this down the road).
//     // adapter: MongoDBAdapter(clientPromise, {
//     //     collections: {
//     //         Users: 'users'
//     //     },
//     //     databaseName: 'recipeBooks'
//     // }),
//     // use JSON web tokens for managing sessions
//     session: {
//         strategy: 'jwt'
//     }
// }

export default NextAuth({
    // no providers because we are providing our own database
    providers: [credentialsProvider],
    // // same mongo database that holds the recipes (I'm sure I'll
    // // regret this down the road).
    // adapter: MongoDBAdapter(clientPromise, {
    //     collections: {
    //         Users: 'users'
    //     },
    //     databaseName: 'recipeBooks'
    // }),
    // callbacks: {
    //     async signIn({user, profile, credentials}) {
    //         console.log("user", user)
    //         console.log("profile", profile)
    //         console.log("creds", credentials)
    //         return true
    //     },
    //     async session({session, token, user}) {
    //         console.log("session", session)
    //         console.log("token", token)
    //         console.log("user", user)
    //         return session
    //     }
    // },
    // use JSON web tokens for managing sessions
    session: {
        strategy: 'jwt'
    }
})