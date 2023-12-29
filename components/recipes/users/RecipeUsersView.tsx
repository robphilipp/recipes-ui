import {UserWithPermissions} from "../../../lib/recipes";
import {Divider, List, ListItem, ListItemText, Typography} from "@mui/material";
import {renderAccessRights} from "../RecipePermissions";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import React from "react";

type Props = {
    users: Array<UserWithPermissions>
    open: boolean
    onClose: () => void
    itemRenderer?: (user: UserWithPermissions) => JSX.Element
}

export default function RecipeUsersView(props: Props): JSX.Element {
    const {
        users,
        open,
        onClose,
        itemRenderer = defaultItemRenderer
    } = props
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Users with access</DialogTitle>
            <Divider/>
            <DialogContent>
                <List sx={{width: '100%', minWidth: 250, bgcolor: 'background.paper'}}>
                    {users.map((user, index) => (<>
                        {/*{index > 0 ? <Divider component="li"/> : <></>}*/}
                        {itemRenderer(user)}
                    </>))}
                </List>
            </DialogContent>
        </Dialog>
    )
}

function defaultItemRenderer(user: UserWithPermissions): JSX.Element {
    return (
        <ListItem alignItems="flex-start">
            <ListItemText
                key={user.email}
                primary={<>
                    {user.name}
                    <Divider component="br"/>
                    <Typography
                        sx={{display: 'inline', fontSize: '0.8em'}}
                        component="span"
                        variant="body2"
                        color="text.secondary"
                    >
                        ({renderAccessRights(user.accessRights)})
                    </Typography>
                </>}
                secondary={<div style={{paddingTop: 7}}>
                    <Typography
                        sx={{display: 'inline'}}
                        component="div"
                        variant="body2"
                        color="text.primary"
                    >
                        {user.email}
                    </Typography>
                </div>}
            />
        </ListItem>
    )
}
