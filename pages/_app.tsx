import '../styles/global.css'
import {AppProps} from 'next/app'
import Link from 'next/link'
import {
    AppBar,
    BottomNavigation,
    BottomNavigationAction,
    Box,
    CssBaseline,
    Divider,
    Drawer,
    List,
    ListItem, ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper, Stack,
    Toolbar,
    Typography, useTheme
} from "@mui/material";
import React, {useState} from "react";
import {useRouter} from "next/router";
import HomeIcon from '@mui/icons-material/Home';
import ArchiveIcon from '@mui/icons-material/Archive';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import SearchProvider from "../lib/useSearch";
import RecipeSearch from "../components/RecipeSearch";
import StatusProvider from "../lib/useStatus";
import {ThemeProvider} from '@mui/material/styles';
import {lightTheme} from "../theme/theme";
import SearchIcon from '@mui/icons-material/Search';
import {styled} from '@mui/system'
import {amountFor, convertAmount, UnitType} from "../lib/Measurements";
import AmountConverter from "../components/AmountConverter";
import QuantityConverterDialog from "../components/QuantityConverterDialog";
import {Calculate} from "@mui/icons-material";
import {QueryClientProvider, QueryClient} from "@tanstack/react-query";

const SMALL_SIDEBAR_NAV_WIDTH = process.env.sidebarNavWidthSmall
const MEDIUM_SIDEBAR_NAV_WIDTH = process.env.sidebarNavWidthMedium

enum Navigation {HOME, ADD_RECIPE, IMPORT_RECIPE_OCR}

const queryClient = new QueryClient()

const TitleImage = styled('img')({
    borderRadius: 5,
    height: 50,
    width: 50 * 1.56,
    marginRight: 10,
    marginLeft: -15
})

export default function App(props: AppProps) {
    const {Component, pageProps} = props
    const router = useRouter()
    const theme = useTheme()

    const [navItem, setNavItem] = useState<number>(0)

    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen)
    const goHome = async () => router
        .push("/")
        .then(() => setNavItem(Navigation.HOME))
    const goAddRecipe = async () => router
        .push("/recipes/new")
        .then(() => setNavItem(Navigation.ADD_RECIPE))
    const goImportRecipe = async () => router
        .push("/recipes/import/ocr")
        .then(() => setNavItem(Navigation.IMPORT_RECIPE_OCR))


    async function handleBottomNav(event: React.SyntheticEvent<Element, Event>, newNavItem: number) {
        switch (newNavItem) {
            case Navigation.HOME:
                await goHome()
                break
            case Navigation.ADD_RECIPE:
                await goAddRecipe()
                break
        }
    }

    function navbarContents() {
        return (
            <div>
                <Toolbar>
                    <Stack>
                        <Typography
                            color={theme.palette.text.disabled}
                            sx={{fontSize: '1em'}}
                        >
                            {process.env.siteName}
                        </Typography>
                        <Typography
                            color={theme.palette.text.disabled}
                            sx={{fontSize: '0.7em', textAlign: 'center'}}
                        >
                            version {process.env.version}
                        </Typography>
                    </Stack>
                </Toolbar>
                <Divider/>
                <List>
                    <ListItemButton onClick={goHome}>
                        <ListItemIcon><HomeIcon/></ListItemIcon>
                        <ListItemText primary="Home"/>
                    </ListItemButton>
                    <ListItemButton onClick={goAddRecipe}>
                        <ListItemIcon><AddCircleIcon/></ListItemIcon>
                        <ListItemText primary="Add Recipe"/>
                    </ListItemButton>
                    <ListItemButton onClick={goImportRecipe}>
                        <ListItemIcon><DocumentScannerIcon/></ListItemIcon>
                        <ListItemText primary="Import (OCR)"/>
                    </ListItemButton>
                </List>
                <Divider/>
                <List>
                    <ListItemButton disabled>
                        <ListItemIcon><SearchIcon/></ListItemIcon>
                        <ListItemText primary="Search"/>
                    </ListItemButton>
                </List>
                <div>
                    <QuantityConverterDialog
                        buttonText="Converter"
                        title="Converter"
                        icon={<Calculate/>}
                    >
                        <AmountConverter/>
                    </QuantityConverterDialog>
                </div>
                <Divider/>
                <List sx={{padding: 0}}>
                    <ListItem>
                        <Typography sx={{fontSize: 14, fontWeight: 700}}>Quick Reference</Typography>
                    </ListItem>
                    <ListItem sx={{paddingTop: 0, paddingBottom: 0}}>
                        <Typography sx={{fontSize: 13}}>
                            {convertAmount(amountFor(1, UnitType.TEASPOON), UnitType.MILLILITER).map(amount => `1 tsp ≈ ${Math.round(amount.value)} ml`).getOrDefault('')}
                        </Typography>
                    </ListItem>
                    <ListItem sx={{paddingTop: 0, paddingBottom: 0}}>
                        <Typography sx={{fontSize: 13}}>
                            {convertAmount(amountFor(1, UnitType.TABLESPOON), UnitType.MILLILITER).map(amount => `1 tbsp ≈ ${Math.round(amount.value)} ml`).getOrDefault('')}
                        </Typography>
                    </ListItem>
                    <ListItem sx={{paddingTop: 0, paddingBottom: 0}}>
                        <Typography sx={{fontSize: 13}}>
                            {convertAmount(amountFor(1, UnitType.TABLESPOON), UnitType.TEASPOON).map(amount => `1 tbsp = ${Math.round(amount.value)} tsps`).getOrDefault('')}
                        </Typography>
                    </ListItem>
                    <ListItem sx={{paddingTop: 0, paddingBottom: 0}}>
                        <Typography sx={{fontSize: 13}}>
                            {convertAmount(amountFor(1, UnitType.FLUID_OUNCE), UnitType.TABLESPOON).map(amount => `1 fl oz = ${Math.round(amount.value)} tbsps`).getOrDefault('')}
                        </Typography>
                    </ListItem>
                    <ListItem sx={{paddingTop: 0, paddingBottom: 0}}>
                        <Typography sx={{fontSize: 13}}>
                            {convertAmount(amountFor(1, UnitType.CUP), UnitType.FLUID_OUNCE).map(amount => `1 cup = ${Math.round(amount.value)} fl ozs`).getOrDefault('')}
                        </Typography>
                    </ListItem>
                    <ListItem sx={{paddingTop: 0, paddingBottom: 0}}>
                        <Typography sx={{fontSize: 13}}>
                            {convertAmount(amountFor(1, UnitType.QUART), UnitType.PINT).map(amount => `1 qt = ${Math.round(amount.value)} pts`).getOrDefault('')}
                        </Typography>
                    </ListItem>
                    <ListItem sx={{paddingTop: 0, paddingBottom: 0}}>
                        <Typography sx={{fontSize: 13}}>
                            {convertAmount(amountFor(1, UnitType.GALLON), UnitType.QUART).map(amount => `1 gal = ${Math.round(amount.value)} qts`).getOrDefault('')}
                        </Typography>
                    </ListItem>
                </List>
            </div>
        );
    }

    return (
        <ThemeProvider theme={lightTheme}>
            <QueryClientProvider client={queryClient}>
                <SearchProvider>
                    <StatusProvider>
                        <Box sx={{display: 'flex'}}>
                            <CssBaseline/>
                            <AppBar
                                color="primary"
                                position="fixed"
                                elevation={1}
                                sx={{
                                    width: {
                                        sm: `calc(100% - ${SMALL_SIDEBAR_NAV_WIDTH}px)`,
                                        md: `calc(100% - ${MEDIUM_SIDEBAR_NAV_WIDTH}px)`,
                                    },
                                    ml: {sm: `${SMALL_SIDEBAR_NAV_WIDTH}px`},
                                }}
                            >
                                <Toolbar>
                                    <Link href={"/"} style={{marginTop: 7}}>
                                        <TitleImage src="/images/goodoletimes.png" alt="City Year"/>
                                    </Link>
                                    <Typography
                                        variant="h6"
                                        noWrap
                                        component="div"
                                        color="default"
                                        style={{paddingLeft: 10}}
                                        sx={{flexGrow: 1, display: {xs: 'none', sm: 'block'}}}
                                    >
                                        {process.env.bookTitle}
                                    </Typography>
                                    <RecipeSearch/>
                                </Toolbar>
                            </AppBar>
                            <Box
                                component="nav"
                                sx={{
                                    width: {
                                        sm: SMALL_SIDEBAR_NAV_WIDTH,
                                        md: MEDIUM_SIDEBAR_NAV_WIDTH
                                    },
                                    flexShrink: {sm: 0}
                                }}
                                aria-label="mailbox folders"
                            >
                                <Drawer
                                    variant="temporary"
                                    open={mobileOpen}
                                    onClose={handleDrawerToggle}
                                    ModalProps={{
                                        keepMounted: true,
                                    }}
                                    sx={{
                                        display: {
                                            xs: 'block',
                                            sm: 'none',
                                            md: 'none'
                                        },
                                        '& .MuiDrawer-paper': {
                                            boxSizing: 'border-box',
                                            width: SMALL_SIDEBAR_NAV_WIDTH
                                        },
                                    }}
                                >
                                    {navbarContents()}
                                </Drawer>
                                <Drawer
                                    variant="permanent"
                                    sx={{
                                        display: {
                                            xs: 'none',
                                            sm: 'block',
                                            md: 'none'
                                        },
                                        '& .MuiDrawer-paper': {
                                            boxSizing: 'border-box',
                                            width: SMALL_SIDEBAR_NAV_WIDTH
                                        },
                                    }}
                                    open
                                >
                                    {navbarContents()}
                                </Drawer>
                                <Drawer
                                    variant="permanent"
                                    sx={{
                                        display: {
                                            xs: 'none',
                                            sm: 'none',
                                            md: 'block'
                                        },
                                        '& .MuiDrawer-paper': {
                                            boxSizing: 'border-box',
                                            width: MEDIUM_SIDEBAR_NAV_WIDTH
                                        },
                                    }}
                                    open
                                >
                                    {navbarContents()}
                                </Drawer>
                            </Box>
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
                            <Box>
                                <Paper
                                    sx={{
                                        position: 'fixed',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        zIndex: theme => theme.zIndex.drawer + 1
                                    }}
                                    elevation={3}
                                >
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
                            </Box>
                        </Box>
                    </StatusProvider>
                </SearchProvider>
            </QueryClientProvider>
        </ThemeProvider>
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