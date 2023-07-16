import {Box, CssBaseline, Toolbar} from "@mui/material";
import {Header} from "./Header";
import React, {JSX} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import {AppProps} from "next/app";
import RecipeSearch from "./recipes/RecipeSearch";
import UserProfileMenu from "./users/profile/UserProfileMenu";
import BottomNavBar from "./navigation/BottomNavBar"
import SideNavigation from "./navigation/SideNavigation";
import {RecipesUser} from "./users/RecipesUser";
import {RoleType} from "./users/Role";
import {useRecipeSession} from "../lib/RequireRole";

const SMALL_SIDEBAR_NAV_WIDTH = process.env.sidebarNavWidthSmall
const MEDIUM_SIDEBAR_NAV_WIDTH = process.env.sidebarNavWidthMedium

export default function MainRecipeBookPage(props: AppProps): JSX.Element {
    const {Component, pageProps} = props

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
                <Component {...pageProps} />
                <Toolbar/>
            </Box>
            <BottomNavBar/>
        </Box>
    )
}