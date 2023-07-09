import React, {useState, JSX} from "react";
import {Box, IconButton, Menu, MenuItem} from "@mui/material";
import {AccountCircle} from "@mui/icons-material";
import {signOut} from "next-auth/react";
import {RoleType} from "../Role";

type Props = {
    status: "authenticated" | "loading"
    role: RoleType
}

const ICON_COLOR = {
    [RoleType.ADMIN]: "#ff8442",
    [RoleType.ACCOUNT_ADMIN]: "#ecce56",
    [RoleType.USER]: "#fff",
}

export default function UserProfileMenu(props: Props): JSX.Element {
    const {status, role} = props

    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)

    function handleOpenUserMenu(event: React.MouseEvent<HTMLElement>) {
        setAnchorElUser(event.currentTarget)
    }

    function handleCloseUserMenu() {
        setAnchorElUser(null)
    }

    return <Box sx={{ flexGrow: 0 }}>
        <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenUserMenu}
            color="inherit"
        >
            <AccountCircle sx={{color: ICON_COLOR[role]}}/>
        </IconButton>
        <Menu
            id="menu-appbar"
            sx={{ mt: '45px' }}
            anchorEl={anchorElUser}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
        >
            <MenuItem onClick={handleCloseUserMenu}>Profile</MenuItem>
            <MenuItem onClick={handleCloseUserMenu}>My account</MenuItem>
            {status === "authenticated" && <MenuItem onClick={() => signOut()}>Sign Out</MenuItem>}
        </Menu>
    </Box>
}
