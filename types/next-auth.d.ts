import {DefaultSession} from "next-auth"
import {RecipesUser, UserAugmentation} from "../components/users/RecipesUser";

/**
 * Augment the next-auth.js modules so that the session has a {@link RecipesUser}
 * and that the {@link User} is also a {@link RecipesUser}.
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
    /**
     * Augment
     * Returned by `useSession`, `getSession` and received as a prop on the
     * `SessionProvider` React Context
     */
    interface Session {
        // user: UserAugmentation & DefaultSession["user"]
        user: RecipesUser
    }

    /**
     * Augment the default {@link User} to be a {@link RecipesUser}. Wasn't sure how to
     * set the {@link User} to be of type {@link RecipesUser} so instead, made the shape
     * the same. Recall that the {@link RecipesUser} extends the {@link User}.
     */
    interface User extends UserAugmentation {}
}

import { JWT } from "next-auth/jwt"

declare module "next-auth/jwt" {
    /**
     * Returned by the `jwt` callback and `getToken`, when using JWT sessions
     */
    interface JWT {
        user: RecipesUser
    }
}
