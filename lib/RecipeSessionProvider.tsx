import React, {createContext, JSX, useContext} from "react";
import {useSession} from "next-auth/react";
import {roleAtLeast, RoleType} from "../components/users/Role";
import {useRouter} from "next/router";
import {Session} from "next-auth";
import {emptyUser} from "../components/users/RecipesUser";

const UNAUTHENTICATED_CONTENT = (process.env.unauthenticated ?? []) as Array<string>

type UseRecipeSession = Session & {
    role: RoleType | null,
    status: "authenticated" | "loading" | "unauthenticated",
    update: (data?: any) => Promise<Session | null>
}

const initialRecipeSession: UseRecipeSession = {
    user: emptyUser(),
    expires: "",
    role: null,
    status: "unauthenticated",
    update: () => Promise.resolve(null)
}

const RecipeSessionContext = createContext<UseRecipeSession>(initialRecipeSession)

interface Props {
    // the minimum role that a user must have in order to access the children components
    minRole: RoleType
    // wrapped children
    children: JSX.Element | Array<JSX.Element>;
}

/**
 * This provider does three things:
 * 1. redirects unauthenticated users to the login page for children
 *    components, and
 * 2. guards children components from unauthorized use based on role, and
 * 3. is the provider for the {@link useRecipeSession} hook that exposes the user's
 *    role-type, status, and the fields and function from the next-auth
 *    {@link Session}
 *
 * @param props Holds the minimum role required to render child components
 * @constructor
 */
export default function RecipeSessionProvider(props: Props): JSX.Element {
    const {minRole, children} = props
    const router = useRouter()

    const hasSufficientRole = roleAtLeast(minRole)

    // require that the user be logged in, or send the user to a login screen
    // const {data: session, status, update} = useSession({
    //     required: true,
    //     async onUnauthenticated() {
    //         await router.push("/api/auth/signin")
    //     }
    // })
    const {data: session, status, update} = useSession()

    if (status === "loading") {
        return <div>Hold on. Looking for something Booboo hasn&apos;t yet destroyed...</div>
    }

    // status is 'loading', and once loaded, becomes either 'unauthenticated' or
    // 'authenticated'
    if (status === "unauthenticated") {
        if (!UNAUTHENTICATED_CONTENT.find(openPage => openPage === router.pathname)) {
            router
                .push("/api/auth/signin")
                .catch(reason => console.error(`Failed to redirect to login screen; reason: ${reason}`))
            return <div>Redirecting...</div>
        }
        console.log(router.route, router)
        return <>{children}</>
    }

    if (session && status === "authenticated" && hasSufficientRole(session.user.role.name)) {
        return (
            <RecipeSessionContext.Provider value={{
                user: session.user,
                expires: session.expires,
                role: session.user.role.name,
                status,
                update
            }}>
                {children}
            </RecipeSessionContext.Provider>)
    }

    return <div>Sadly, Booboo has destroyed everything!</div>
}

/**
 * Hook that provides the next-js {@link Session} enriched with the user's
 * role-type, status.
 */
export function useRecipeSession(): UseRecipeSession {
    const context = useContext<UseRecipeSession>(RecipeSessionContext)
    const {user, expires, role, status, update} = context
    if (user === undefined || expires === undefined || role === undefined || status === undefined || update === undefined) {
        throw new Error("useSearch hook can only be used when the component is a child of <RequireRole/>")
    }
    return context

}