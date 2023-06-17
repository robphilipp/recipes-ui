import {
    Box,
    CssBaseline,
    Divider,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Toolbar,
    Typography,
    useTheme
} from "@mui/material";
import {Header} from "./Header";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import React, {JSX, useState} from "react";
import {useSession} from "next-auth/react";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import SearchIcon from "@mui/icons-material/Search";
import QuantityConverterDialog from "./QuantityConverterDialog";
import {Calculate} from "@mui/icons-material";
import AmountConverter from "./AmountConverter";
import {useRouter} from "next/router";
import {AppProps} from "next/app";
import RecipeSearch from "./RecipeSearch";
import UserProfileMenu from "./userprofile/UserProfileMenu";
import QuickReference from "./QuickReference";
import BottomNavBar from "./BottomNavBar"

const SMALL_SIDEBAR_NAV_WIDTH = process.env.sidebarNavWidthSmall
const MEDIUM_SIDEBAR_NAV_WIDTH = process.env.sidebarNavWidthMedium

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

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen)

    async function handleGoHome(): Promise<void> {
        await router.push("/")
    }

    async function handleAddRecipe(): Promise<void> {
        await router.push("/recipes/new")
    }

    async function handleImportRecipe(): Promise<void> {
        await router.push("/recipes/import/ocr")
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
                {session && <>
                    <List>
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
                    </List>
                </>}
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
            {session && <BottomNavBar/>}
        </Box>
    )
}