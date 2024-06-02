import {Box, CssBaseline, Toolbar, Typography} from "@mui/material";
import {Header} from "./Header";
import React, {JSX} from "react";
import {AppProps} from "next/app";
import RecipeSearch from "./recipes/RecipeSearch";
import UserProfileMenu from "./users/profile/UserProfileMenu";
import BottomNavBar from "./navigation/BottomNavBar"
import SideNavigation from "./navigation/SideNavigation";
import RecipeSessionProvider, {useRecipeSession} from "../lib/RecipeSessionProvider";
import {RoleType} from "./users/Role";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import Notifications from "./notifications/Notifications";

const SMALL_SIDEBAR_NAV_WIDTH = parseInt(process.env.sidebarNavWidthSmall as string)
const MEDIUM_SIDEBAR_NAV_WIDTH = parseInt(process.env.sidebarNavWidthMedium as string)
const UNSECURED_CONTENT = (process.env.unauthenticated ?? "").split(",").map(path => path.trim())
// const UNSECURED_CONTENT = (process.env.unauthenticated ?? []) as Array<string>
export const isUnsecuredContent = (path: string) => UNSECURED_CONTENT.find(openPage => openPage === path)

export default function MainRecipeBookPage(props: AppProps): JSX.Element {
    const {Component, pageProps} = props
    const router = useRouter()

    const {status} = useSession()

    if (status === "loading") {
        return (
            <Typography>
                Hold on. Looking for something Booboo hasn&apos;t yet destroyed...
            </Typography>
        )
    }

    // allow unauthenticated users to view unsecured content
    if (isUnsecuredContent(router.pathname)) {
        return (
            <UnsecuredContent>
                <Component {...pageProps}/>
            </UnsecuredContent>
        )
    }

    return (
        <RecipeSessionProvider minRole={RoleType.USER}>
            <SecuredContent>
                <Component {...pageProps}/>
            </SecuredContent>
        </RecipeSessionProvider>
    )
}

type ContentProps = {
    children: JSX.Element
}

export function UnsecuredContent(props: ContentProps): JSX.Element {
    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            <Header
                smallRightOffset={0}
                mediumRightOffset={0}
                titleImageSrc="/images/goodoletimes.png"
                titleImageAlt="City Year"
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: {sm: `100%`, md: `100%`,},
                    padding: 0,
                    margin: 0
                }}
            >
                {props.children}
            </Box>
        </Box>
    )
}

export function SecuredContent(props: ContentProps): JSX.Element {
    const {children} = props

    const {role, status} = useRecipeSession()

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            <Header
                smallRightOffset={SMALL_SIDEBAR_NAV_WIDTH}
                mediumRightOffset={MEDIUM_SIDEBAR_NAV_WIDTH}
                titleImageSrc="/images/goodoletimes.png"
                titleImageAlt="City Year"
            >
                <RecipeSearch/>
                <Notifications/>
                <UserProfileMenu status={status} role={role}/>
            </Header>
            <SideNavigation
                smallWidth={SMALL_SIDEBAR_NAV_WIDTH}
                mediumWidth={MEDIUM_SIDEBAR_NAV_WIDTH}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: {
                        sm: `calc(100% - ${SMALL_SIDEBAR_NAV_WIDTH})`,
                        md: `calc(100% - ${MEDIUM_SIDEBAR_NAV_WIDTH})`,
                    }
                }}
            >
                <Toolbar/>
                {children}
                <Toolbar/>
            </Box>
            <BottomNavBar/>
        </Box>
    )
}