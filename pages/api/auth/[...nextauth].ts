import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import {authenticate} from "../../../lib/authentication";
import {RecipesUser} from "../../../lib/RecipesUser";

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
        const user = await authenticate(credentials as Credentials)

        // If no error and we have user data, return it
        if (user) {
            return user
        }
        // Return null if user data could not be retrieved
        return null
    }
})

export default NextAuth({
    // no providers because we are providing our own database
    providers: [credentialsProvider],
    // use JSON web tokens for managing sessions
    session: {
        strategy: 'jwt'
    }
})