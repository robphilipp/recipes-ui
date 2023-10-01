import NextAuth, {Session} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import {authenticate} from "../../../lib/authentication";
import {RecipesUser} from "../../../components/users/RecipesUser";
import {JWT} from "next-auth/jwt";
import {Provider} from "next-auth/providers";

export type Credentials = {
    email: string
    password: string
}

export const credentialsProvider = CredentialsProvider({
    id: 'recipes-provider-mongo-credentials',
    // The name to display on the sign-in form (e.g. 'Sign in with...')
    name: 'email and password',
    // use credentials to log in (setting this will cause the authorize function, which
    // is defined below, to be called)
    type: "credentials",
    // The credentials are used to generate a suitable form on the sign-in page.
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
    },
    // these callbacks serve mainly to put the RecipeUser into the auth.js User object
    // and have it passed down into the session for broader use by the app
    callbacks: {
        // async signIn({ user, account, profile, email, credentials }): Promise<boolean> {
        //     const isAllowedToSignIn = true
        //     if (isAllowedToSignIn) {
        //         return true
        //     } else {
        //         // Return false to display a default error message
        //         return false
        //         // Or you can return a URL to redirect to:
        //         // return '/unauthorized'
        //     }
        // },
        async jwt({ token, user }): Promise<JWT> {
            // when the user is defined, add the user to the token, which will
            // then appear in the "session" callback, and we update the session's
            // user to the recipe user
            if (user !== undefined) {
                token.user = user as RecipesUser
            }
            return token
        },
        async session({ session, token }): Promise<Session> {
            session.user = token.user
            return session
        }
    },
    secret: process.env.JWT_SECRET,
    pages: {
        signIn: '/login'
    },
    // Enable debug messages in the console if you are having problems
    debug: process.env.NODE_ENV === 'development',
})