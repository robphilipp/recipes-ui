import '../styles/global.css'
import {AppProps} from 'next/app'
import React, {JSX} from "react";
import SearchProvider from "../lib/useSearch";
import StatusProvider from "../lib/useStatus";
import {ThemeProvider} from '@mui/material/styles';
import {lightTheme} from "../theme/theme";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {SessionProvider} from "next-auth/react";
import MainRecipeBookPage, {UnsecuredContent} from "../components/MainRecipeBookPage";
import {useRouter} from "next/router";

const queryClient = new QueryClient()

/**
 * Main entry point for the recipes app
 * @param props Props from next.js
 * @constructor
 */
export default function App(props: AppProps): JSX.Element {
    const {pageProps, Component} = props

    const router = useRouter()

    // for login, we don't need to wrap shit in a session provider, so
    // just show the login page so that the user can log in
    if (router.pathname === '/login') {
        return (
            <ThemeProvider theme={lightTheme}>
                <UnsecuredContent>
                    <Component {...pageProps}/>
                </UnsecuredContent>
            </ThemeProvider>
        )
    }

    return (
        <SessionProvider session={pageProps.session}>
            <ThemeProvider theme={lightTheme}>
                <QueryClientProvider client={queryClient}>
                    <SearchProvider>
                        <StatusProvider>
                            <MainRecipeBookPage {...props}/>
                        </StatusProvider>
                    </SearchProvider>
                </QueryClientProvider>
            </ThemeProvider>
        </SessionProvider>
    )
}
