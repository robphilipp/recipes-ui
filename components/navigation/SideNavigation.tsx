import React, {JSX, useState} from "react";
import {
    Box,
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
import HomeIcon from "@mui/icons-material/Home";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import SearchIcon from "@mui/icons-material/Search";
import QuantityConverterDialog from "../QuantityConverterDialog";
import {Calculate} from "@mui/icons-material";
import AmountConverter from "../AmountConverter";
import QuickReference from "../QuickReference";
import {useRouter} from "next/router";

type Props = {
    smallWidth?: string
    mediumWidth?: string
}
export default function SideNavigation(props: Props): JSX.Element {

    const {smallWidth, mediumWidth} = props

    const theme = useTheme()
    const router = useRouter()

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
        )
    }

    return (
        <Box
            component="nav"
            sx={{
                width: {
                    sm: smallWidth,
                    md: mediumWidth
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
                        width: smallWidth
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
                        width: smallWidth
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
                        width: mediumWidth
                    },
                }}
                open
            >
                <NavbarContents/>
            </Drawer>
        </Box>
    );
}
