import React, {JSX} from "react";
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
import QuantityConverterDialog from "../conversions/QuantityConverterDialog";
import {Calculate, Groups, LibraryBooks, ManageAccounts} from "@mui/icons-material";
import AmountConverter from "../conversions/AmountConverter";
import QuickReference from "../QuickReference";
import {useRouter} from "next/router";
import {useSession} from "next-auth/react";
import {RoleType} from "../users/Role";

type Props = {
    smallWidth?: string
    mediumWidth?: string
}
export default function SideNavigation(props: Props): JSX.Element {

    const {smallWidth, mediumWidth} = props

    const theme = useTheme()
    const router = useRouter()
    const {data: session} = useSession()

    async function handleGoHome(): Promise<void> {
        await router.push("/")
    }

    async function handleAddRecipe(): Promise<void> {
        await router.push("/recipes/new")
    }

    async function handleImportRecipe(): Promise<void> {
        await router.push("/recipes/import/ocr")
    }

    async function handleManageUsers(): Promise<void> {
        await router.push("/admin/users")
    }

    async function handleManageUserGroups(): Promise<void> {
        await router.push("/admin/groups")
    }

    function RecipeMenuItems(): JSX.Element {
        return (<>
            <Divider/>
            <List>
                <ListItemButton onClick={handleAddRecipe}>
                    <ListItemIcon><AddCircleIcon/></ListItemIcon>
                    <ListItemText primary="Add Recipe"/>
                </ListItemButton>
                <ListItemButton onClick={handleAddRecipe}>
                    <ListItemIcon><LibraryBooks/></ListItemIcon>
                    <ListItemText primary="Recipe Groups"/>
                </ListItemButton>
                <ListItemButton onClick={handleImportRecipe}>
                    <ListItemIcon><DocumentScannerIcon/></ListItemIcon>
                    <ListItemText primary="Import (OCR)"/>
                </ListItemButton>
            </List>
        </>)
    }

    function AdminMenuItems({visible}: {visible: boolean}): JSX.Element {
        if (visible) {
            return (<>
                <Divider/>
                <List>
                    <ListItemButton onClick={handleManageUsers}>
                        <ListItemIcon><ManageAccounts/></ListItemIcon>
                        <ListItemText primary="Users"/>
                    </ListItemButton>
                    <ListItemButton onClick={handleManageUserGroups}>
                        <ListItemIcon><Groups/></ListItemIcon>
                        <ListItemText primary="User Groups"/>
                    </ListItemButton>
                </List>
            </>)
        }
        return <></>

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
                </List>
                <RecipeMenuItems/>
                <AdminMenuItems
                    visible={session !== null && session.user.role.name === RoleType.ADMIN}
                />
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
