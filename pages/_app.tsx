import '../styles/global.css'
import {AppProps} from 'next/app'
import React, {JSX} from "react";
import SearchProvider from "../lib/useSearch";
import StatusProvider from "../lib/useStatus";
import {ThemeProvider} from '@mui/material/styles';
import {lightTheme} from "../theme/theme";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {SessionProvider} from "next-auth/react";
import MainRecipeBookPage from "../components/MainRecipeBookPage";
import RecipeSessionProvider from "../lib/RecipeSessionProvider";
import {RoleType} from "../components/users/Role";

const queryClient = new QueryClient()

export default function App(props: AppProps): JSX.Element {
    const {pageProps: {session}} = props

    return (
        <SessionProvider session={session}>
            <ThemeProvider theme={lightTheme}>
                <QueryClientProvider client={queryClient}>
                    <SearchProvider>
                        <StatusProvider>
                            <RecipeSessionProvider minRole={RoleType.USER}>
                                <MainRecipeBookPage {...props}/>
                            </RecipeSessionProvider>
                        </StatusProvider>
                    </SearchProvider>
                </QueryClientProvider>
            </ThemeProvider>
        </SessionProvider>
    )
}

// App.getInitialProps = async (appContext: AppContext) => {
//     const {router} = appContext
//     const locale = router.locale
//     const appProps = await App.getInitialProps(appContext)
//
//     global.__localeId__ = locale
//
//     return {...appProps}
// }