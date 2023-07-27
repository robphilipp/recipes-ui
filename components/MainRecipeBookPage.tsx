import {Box, CssBaseline, Toolbar} from "@mui/material";
import {Header} from "./Header";
import React, {JSX} from "react";
import {AppProps} from "next/app";
import RecipeSearch from "./recipes/RecipeSearch";
import UserProfileMenu from "./users/profile/UserProfileMenu";
import BottomNavBar from "./navigation/BottomNavBar"
import SideNavigation from "./navigation/SideNavigation";
import {useRecipeSession} from "../lib/RecipeSessionProvider";
import {RoleType} from "./users/Role";

const SMALL_SIDEBAR_NAV_WIDTH = process.env.sidebarNavWidthSmall
const MEDIUM_SIDEBAR_NAV_WIDTH = process.env.sidebarNavWidthMedium

export default function MainRecipeBookPage(props: AppProps): JSX.Element {
    const {Component, pageProps} = props

    const {role, status} = useRecipeSession()

    // if (status === "unauthenticated") {
    if (status !== "authenticated") {
        return (
            <UnsecuredContent>
                <Component {...pageProps}/>
            </UnsecuredContent>
        )
    }

    return (
        <SecuredContent role={role} status={status}>
            <Component {...pageProps}/>
        </SecuredContent>
    )

}

type UnsecuredContentProps = {
    children: JSX.Element
}

export function UnsecuredContent(props: UnsecuredContentProps): JSX.Element {
    const {children} = props
    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            <Header
                smallRightOffset='0px'
                mediumRightOffset='0px'
                titleImageSrc="/images/goodoletimes.png"
                titleImageAlt="City Year"
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: {
                        sm: `100%`,
                        md: `100%`,
                    }
                }}
            >
                <Toolbar/>
                {children}
                <Toolbar/>
            </Box>
        </Box>
    )
}

type SecuredContentProps = {
    role: RoleType | null
    status: "authenticated" | "unauthenticated" | "loading"
    children: JSX.Element
}
export function SecuredContent(props: SecuredContentProps): JSX.Element {
    const {role, status, children} = props

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
                        sm: `calc(100% - ${SMALL_SIDEBAR_NAV_WIDTH}px)`,
                        md: `calc(100% - ${MEDIUM_SIDEBAR_NAV_WIDTH}px)`,
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