import '../styles/global.css'
import {AppProps} from 'next/app'
import Link from 'next/link'
import {AppBar, BottomNavigation, BottomNavigationAction, Box, Paper, Toolbar, Typography} from "@mui/material";
import Image from "next/image";
import utilStyles from "../styles/utils.module.css";
import React, {useState} from "react";
import {useRouter} from "next/router";
import HomeIcon from '@mui/icons-material/Home';
import ArchiveIcon from '@mui/icons-material/Archive';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchProvider from "../lib/useSearch";
import RecipeSearch from "../components/RecipeSearch";
import StatusProvider from "../lib/useStatus";

enum Navigation {HOME, ADD_RECIPE}

export default function App(props: AppProps) {
    const {Component, pageProps} = props
    const router = useRouter()

    const [navItem, setNavItem] = useState<number>(0)

    function handleBottomNav(event: React.SyntheticEvent<Element, Event>, newNavItem: number) {
        switch (newNavItem) {
            case Navigation.HOME:
                router.push("/")
                setNavItem(newNavItem)
                break
            case Navigation.ADD_RECIPE:
                router.push("/recipes/new")
                setNavItem(newNavItem)
                break
        }
    }

    return (
        <SearchProvider>
            <StatusProvider>
                <Box sx={{flexGrow: 1}}>
                    <AppBar
                        color="default"
                        position="fixed"
                        elevation={0}
                    >
                        <Toolbar>
                            <Link href={"/"}>
                                <a style={{marginTop: 7}}>
                                    <Image
                                        priority
                                        src="/images/2020.jpg"
                                        className={utilStyles.borderCircle}
                                        height={50}
                                        width={50}
                                        alt="Shitty Year"
                                    />
                                </a>
                            </Link>
                            <Typography
                                variant="h6"
                                noWrap
                                component="div"
                                style={{paddingLeft: 10}}
                                sx={{flexGrow: 1, display: {xs: 'none', sm: 'block'}}}
                            >
                                {process.env.bookTitle}
                            </Typography>
                            <RecipeSearch/>
                        </Toolbar>
                        <Paper sx={{position: 'fixed', bottom: 0, left: 0, right: 0}} elevation={3}>
                            <BottomNavigation
                                showLabels
                                value={navItem}
                                onChange={(event, newValue) => handleBottomNav(event, newValue)}
                            >
                                <BottomNavigationAction label="Home" icon={<HomeIcon/>}/>
                                <BottomNavigationAction label="Add Recipe" icon={<AddCircleIcon/>}/>
                                <BottomNavigationAction label="Archive" icon={<ArchiveIcon/>}/>
                            </BottomNavigation>
                        </Paper>
                    </AppBar>
                </Box>
                <Component {...pageProps} />
            </StatusProvider>
        </SearchProvider>
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