import {
    BottomNavigation,
    BottomNavigationAction,
    Box,
    CssBaseline,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Stack,
    Toolbar,
    Typography,
    useTheme
} from "@mui/material";
import {Header} from "./Header";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ArchiveIcon from "@mui/icons-material/Archive";
import React, {useState} from "react";
import {useSession} from "next-auth/react";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import SearchIcon from "@mui/icons-material/Search";
import QuantityConverterDialog from "./QuantityConverterDialog";
import {Calculate} from "@mui/icons-material";
import AmountConverter from "./AmountConverter";
import {amountFor, convertAmount, UnitType} from "../lib/Measurements";
import {useRouter} from "next/router";
import {AppProps} from "next/app";
import RecipeSearch from "./RecipeSearch";
import UserProfileMenu from "./userprofile/UserProfileMenu";
import QuickReference from "./QuickReference";

const SMALL_SIDEBAR_NAV_WIDTH = process.env.sidebarNavWidthSmall
const MEDIUM_SIDEBAR_NAV_WIDTH = process.env.sidebarNavWidthMedium
enum BottomNavigationItem {HOME, ADD_RECIPE, IMPORT_RECIPE_OCR, CONVERTER}

export default function MainRecipeBookPage(props: AppProps): JSX.Element {
    const {Component, pageProps} = props

    const router = useRouter()
    const theme = useTheme()

    const {data: session, status} = useSession({
        required: true,
        async onUnauthenticated() {
            await router.push("/api/auth/signin")
        }
    })

    const [mobileOpen, setMobileOpen] = useState(false);
    const [navItem, setNavItem] = useState<number>(0)

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen)

    async function handleGoHome(): Promise<void> {
        await router.push("/")
        setNavItem(BottomNavigationItem.HOME)
    }

    async function handleAddRecipe(): Promise<void> {
        await router.push("/recipes/new")
        setNavItem(BottomNavigationItem.ADD_RECIPE)
    }

    async function handleImportRecipe(): Promise<void> {
        await router.push("/recipes/import/ocr")
        setNavItem(BottomNavigationItem.IMPORT_RECIPE_OCR)
    }

    async function handleBottomNav(event: React.SyntheticEvent<Element, Event>, newNavItem: number) {
        switch (newNavItem) {
            case BottomNavigationItem.HOME:
                await handleGoHome()
                break
            case BottomNavigationItem.ADD_RECIPE:
                await handleAddRecipe()
                break
            case BottomNavigationItem.CONVERTER:
                await router.push("/recipes/converter")
                setNavItem(BottomNavigationItem.CONVERTER)
                break
        }
    }
    function NavbarContents(): JSX.Element {
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
                {session && <><List>
                    <ListItemButton onClick={handleGoHome}>
                        <ListItemIcon><HomeIcon/></ListItemIcon>
                        <ListItemText primary="Home"/>
                    </ListItemButton>
                    <ListItemButton onClick={handleAddRecipe}>
                        <ListItemIcon><AddCircleIcon/></ListItemIcon>
                        <ListItemText primary="Add Recipe"/>
                    </ListItemButton>
                    <ListItemButton onClick={handleImportRecipe}>
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
                </List></>}
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
                <QuickReference/>
            </div>
        );
    }

    if (status === "loading") {
        return <div>Authenticating...</div>
    }
    if (session === null) {
        return <div>Happy feet!</div>
    }

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            <Header
                smallRightOffset={SMALL_SIDEBAR_NAV_WIDTH}
                mediumRightOffset={MEDIUM_SIDEBAR_NAV_WIDTH}
                titleImageSrc="/images/goodoletimes.png"
                titleImageAlt="City Year"
            >
                {session ? <RecipeSearch/> : <></>}
                <UserProfileMenu status={status}/>
            </Header>
            <Box
                component="nav"
                sx={{
                    width: {
                        sm: SMALL_SIDEBAR_NAV_WIDTH,
                        md: MEDIUM_SIDEBAR_NAV_WIDTH
                    },
                    flexShrink: {sm: 0}
                }}
                aria-label="navbar items"
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
                    <NavbarContents/>
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
                    <NavbarContents/>
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
                    <NavbarContents/>
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
                {session && <Component {...pageProps} />}
                <Toolbar/>
            </Box>
            {session && <Box>
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
                        <BottomNavigationAction label="Converter" icon={<Calculate/>}/>
                    </BottomNavigation>
                </Paper>
            </Box>}
        </Box>
    )
}