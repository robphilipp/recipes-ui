import React, {JSX} from "react";
import {BottomNavigation, BottomNavigationAction, Box, Paper} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {Calculate} from "@mui/icons-material";
import {useRouter} from "next/router";

export enum BottomNavigationItem {HOME, ADD_RECIPE, CONVERTER}

export default function BottomNavBar(): JSX.Element {
    const router = useRouter()

    function selectedItemFromRoute(route: string): BottomNavigationItem | undefined {
        switch(route) {
            case "/":
                return BottomNavigationItem.HOME
            case "/recipes/new":
                return BottomNavigationItem.ADD_RECIPE
            case "/recipes/converter":
                return BottomNavigationItem.CONVERTER
            default:
                return undefined
        }
    }

    async function handleBottomNav(event: React.SyntheticEvent<Element, Event>, newNavItem: number): Promise<void> {
        switch (newNavItem) {
            case BottomNavigationItem.HOME:
                await router.push("/")
                break
            case BottomNavigationItem.ADD_RECIPE:
                await router.push("/recipes/new")
                break
            case BottomNavigationItem.CONVERTER:
                await router.push("/recipes/converter")
                break
        }
    }

    return (<Box>
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: theme => theme.zIndex.drawer + 1,
                display: {
                    sm: 'none',
                    md: 'none',
                    lg: 'none'
                }
            }}
            elevation={3}
        >
            <BottomNavigation
                showLabels
                value={selectedItemFromRoute(router.route)}
                onChange={(event, newValue) => handleBottomNav(event, newValue)}
            >
                <BottomNavigationAction
                    label="Home"
                    icon={<HomeIcon/>}
                />
                <BottomNavigationAction
                    label="Add Recipe"
                    icon={<AddCircleIcon/>}
                />
                <BottomNavigationAction
                    label="Converter"
                    icon={<Calculate/>}
                />
            </BottomNavigation>
        </Paper>
    </Box>)
}