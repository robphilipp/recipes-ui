import {UserWithPermissions} from "../../../lib/recipes";
import {Button, Card, CardContent, CardHeader, Divider, List, ListItem, ListItemText, Typography} from "@mui/material";
import {AccessRight} from "../RecipePermissions";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import React, {JSX, useState} from "react";
import DialogActions from "@mui/material/DialogActions";
import {RecipesUser} from "../../users/RecipesUser";
import {RoleType} from "../../users/Role";
import {AccessChanges, AccessRightsEditor, hasAccessChanges} from "./AccessRightsEditor";

type Props = {
    requester: RecipesUser
    users: Array<UserWithPermissions>
    open: boolean
    itemRenderer?: (user: UserWithPermissions) => JSX.Element
    onClose: () => void
    onSave: (changed: Map<string, Array<AccessRight>>) => void
}

export default function RecipeUsersView(props: Props): JSX.Element {
    const {
        requester,
        users,
        open,
        onClose,
        onSave
    } = props

    // holds the access that has changed
    const [updatedAccess, setUpdatedAccess] = useState<Map<string, Array<AccessRight>>>(() => new Map())

    /**
     * When the user clicks on the save button, figure out what changes need to be saved and
     * call the {@link onSave} callback with those changes.
     */
    function handleSave(): void {
        // callback from the parent
        onSave(updatedAccess)
    }

    function handleAccessChanged(user: UserWithPermissions, changes: AccessChanges, accessRights: Array<AccessRight>): void {
        const newAccess = new Map(updatedAccess)
        if (hasAccessChanges(changes)) {
            newAccess.set(user.principalId, accessRights)
        } else {
            newAccess.delete(user.principalId)
        }
        setUpdatedAccess(newAccess)
    }

    const showRole = requester.role.name === RoleType.ADMIN
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Users with access</DialogTitle>
            <Divider/>
            <DialogContent>
                <List sx={{width: '100%', minWidth: 250, bgcolor: 'background.paper'}}>
                    {users.map(user=> (
                            <ListItem key={`${user.email}-li`} alignItems="flex-start">
                                <ListItemText
                                    key={`${user.email}-li-text`}
                                    primary={
                                        <Card sx={{minWidth: 300, margin: 0}} variant="outlined"
                                              key={`${user.email}-li-card`}>
                                            <CardHeader
                                                title={<Typography
                                                    sx={{fontSize: '1.1em', fontWeight: 900, marginTop: '-0.2em'}}
                                                    color="text.primary"
                                                    component="div"
                                                >
                                                    {user.name}
                                                </Typography>}
                                                subheader={showRole ?
                                                    <Typography
                                                        sx={{fontSize: '0.7em', marginTop: '-0.2em'}}
                                                        color="text.secondary"
                                                        component="div"
                                                    >
                                                        {user.role.description}
                                                    </Typography> :
                                                    <></>}
                                            />
                                            <CardContent>
                                                <AccessRightsEditor
                                                    user={user}
                                                    onChange={handleAccessChanged}
                                                />
                                            </CardContent>
                                        </Card>}
                                />
                            </ListItem>
                        )
                    )}
                </List>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleSave}
                    disabled={updatedAccess.size === 0}
                    sx={{textTransform: 'none'}}
                >
                    Save
                </Button>
                <Button
                    onClick={onClose}
                    sx={{textTransform: 'none'}}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}
