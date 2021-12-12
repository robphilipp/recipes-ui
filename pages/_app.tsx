import '../styles/global.css'
import {AppContext, AppProps} from 'next/app'
import Link from 'next/link'
import {AppBar, BottomNavigation, BottomNavigationAction, Box, Paper, Toolbar, Typography} from "@mui/material";
import Image from "next/image";
import utilStyles from "../styles/utils.module.css";
import React, {useState} from "react";
import SearchIcon from '@mui/icons-material/Search';
import {useRouter} from "next/router";
import HomeIcon from '@mui/icons-material/Home';
import ArchiveIcon from '@mui/icons-material/Archive';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchProvider from "../lib/useSearch";
import RecipeSearch from "../components/RecipeSearch";
import StatusProvider from "../lib/useStatus";

// const Search = styled('div')(({theme}) => ({
//     position: 'relative',
//     borderRadius: theme.shape.borderRadius,
//     backgroundColor: alpha(theme.palette.common.white, 0.15),
//     '&:hover': {
//         backgroundColor: alpha(theme.palette.common.white, 0.25),
//     },
//     marginLeft: 0,
//     width: '100%',
//     [theme.breakpoints.up('sm')]: {
//         marginLeft: theme.spacing(1),
//         width: 'auto',
//     },
// }));
//
// const SearchIconWrapper = styled('div')(({theme}) => ({
//     padding: theme.spacing(0, 2),
//     height: '100%',
//     position: 'absolute',
//     pointerEvents: 'none',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
// }));
//
// const StyledInputBase = styled(InputBase)(({theme}) => ({
//     color: 'inherit',
//     '& .MuiInputBase-input': {
//         padding: theme.spacing(1, 1, 1, 0),
//         // vertical padding + font size from searchIcon
//         paddingLeft: `calc(1em + ${theme.spacing(4)})`,
//         transition: theme.transitions.create('width'),
//         width: '100%',
//         [theme.breakpoints.up('sm')]: {
//             width: '12ch',
//             '&:focus': {
//                 width: '20ch',
//             },
//         },
//     },
// }));

export default function App(props: AppProps) {
    const {Component, pageProps} = props
    const router = useRouter()

    // const [search, setSearch] = useState<string>()
    // const [searchTokens, setSearchTokens] = useState<Array<string>>([])
    const [navItem, setNavItem] = useState<number>(0)

    // async function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    //     switch (event.key) {
    //         case 'Enter':
    //             // await axios.get(`/api/recipes/summaries/${search}`)
    //             // await router.push(`/api/recipes/summaries/${search}`)
    //             // await router.push(`/?name=${search}`)
    //             setSearchTokens(tokens => [...tokens, search])
    //             setSearch('')
    //             break
    //         case 'Escape':
    //             setSearch('')
    //             break
    //         default:
    //     }
    // }
    //
    // async function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    //     const searchValue = event.currentTarget.value
    //     setSearch(searchValue)
    //     // await axios.get(`/api/recipes/summaries/${search}`)
    //     // await router.push(`/?name=${searchValue}`)
    // }

    function handleBottomNav(event: React.SyntheticEvent<Element, Event>, newNavItem: number) {
        switch (newNavItem) {
            case 0:
                router.push("/")
                setNavItem(newNavItem)
                break
            case 1:
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
                            <Link href={"/"}><a style={{marginTop: 7}}><Image
                                priority
                                src="/images/2020.jpg"
                                className={utilStyles.borderCircle}
                                height={50}
                                width={50}
                                alt="Shitty Year"
                            /></a></Link>
                            <Typography
                                variant="h6"
                                noWrap
                                component="div"
                                style={{paddingLeft: 10}}
                                sx={{flexGrow: 1, display: {xs: 'none', sm: 'block'}}}
                            >{process.env.bookTitle}</Typography>
                            {/*<Search>*/}
                            {/*    <SearchIconWrapper><SearchIcon/></SearchIconWrapper>*/}
                            {/*    <StyledInputBase*/}
                            {/*        placeholder="Search…"*/}
                            {/*        value={search}*/}
                            {/*        inputProps={{'aria-label': 'search'}}*/}
                            {/*        onChange={handleChange}*/}
                            {/*        onKeyDown={handleKeyPress}*/}
                            {/*    />*/}
                            {/*</Search>*/}
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