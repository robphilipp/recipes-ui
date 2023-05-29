import {
    BottomNavigation,
    BottomNavigationAction,
    Box,
    CssBaseline, Divider,
    Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem,
    Paper,
    Stack,
    Toolbar,
    Typography, useTheme
} from "@mui/material";
import {Header} from "./Header";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ArchiveIcon from "@mui/icons-material/Archive";
import React, {useState} from "react";
import {signIn, signOut, useSession} from "next-auth/react";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import SearchIcon from "@mui/icons-material/Search";
import QuantityConverterDialog from "./QuantityConverterDialog";
import {AccountCircle, Calculate} from "@mui/icons-material";
import AmountConverter from "./AmountConverter";
import {amountFor, convertAmount, UnitType} from "../lib/Measurements";
import {useRouter} from "next/router";
import {AppProps} from "next/app";
import RecipeSearch from "./RecipeSearch";

const SMALL_SIDEBAR_NAV_WIDTH = process.env.sidebarNavWidthSmall
const MEDIUM_SIDEBAR_NAV_WIDTH = process.env.sidebarNavWidthMedium
enum Navigation {HOME, ADD_RECIPE, IMPORT_RECIPE_OCR}

export default function MainRecipeBookPage(props: AppProps): JSX.Element {
    const {Component, pageProps} = props

    const {data: session} = useSession()
    const router = useRouter()
    const theme = useTheme()

    const [mobileOpen, setMobileOpen] = useState(false);
    const [navItem, setNavItem] = useState<number>(0)

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

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
                {session && <><List>
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

    function handleMenu(event: React.MouseEvent<HTMLElement>) {
        setAnchorEl(event.currentTarget)
    }

    function handleClose() {
        setAnchorEl(null)
    }

    function Profile(): JSX.Element {
        return <>
            <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
            >
                <AccountCircle/>
            </IconButton>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
            </Menu>
        </>
    }

    function MainContent(): JSX.Element {
        if (session) {
            return (<Component {...pageProps} />)
        } else {
            return (<>
                Please sign in<br/>
                <button onClick={() => signIn()}>Sign In</button>
            </>)
        }
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
                <Profile/>
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
                {/*{session && <Component {...pageProps} />}*/}
                <MainContent/>
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
                    </BottomNavigation>
                </Paper>
            </Box>}
        </Box>
    )
}