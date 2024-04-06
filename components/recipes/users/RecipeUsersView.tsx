import {UserWithPermissions} from "../../../lib/recipes";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Stack,
    Tooltip,
    Typography
} from "@mui/material";
import {AccessRight} from "../RecipePermissions";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import React, {JSX, useState} from "react";
import DialogActions from "@mui/material/DialogActions";
import {RecipesUser} from "../../users/RecipesUser";
import {RoleType} from "../../users/Role";
import {AccessChanges, AccessRightsEditor, hasAccessChanges} from "./AccessRightsEditor";
import {DeleteOutlineRounded, DeleteRounded, Restore} from "@mui/icons-material";

type Props = {
    requester: RecipesUser
    users: Array<UserWithPermissions>
    open: boolean
    itemRenderer?: (user: UserWithPermissions) => JSX.Element
    onClose: () => void
    onSave: (changed: Map<string, Array<AccessRight>>, removed: Array<string>) => void
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

    // holds users that have been removed
    const [removedUsers, setRemovedUsers] = useState<Array<string>>([])

    /**
     * When the user clicks on the save button, figure out what changes need to be saved and
     * call the {@link onSave} callback with those changes.
     */
    function handleSave(): void {
        // remove any "removed" users from the changes to access
        const finalAccess = new Map<string, Array<AccessRight>>(updatedAccess)
        removedUsers.forEach(principalId => finalAccess.delete(principalId))

        // callback from the parent
        onSave(updatedAccess, removedUsers)
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

    function isUserRemoved(user: UserWithPermissions): boolean {
        return removedUsers.find(principleId => principleId === user.principalId) !== undefined
    }

    /**
     * Adds the user to the removed user list if the user is not already in the list. Removes
     * the user from the removed user list if the user is already in the list. Effectively,
     * this function toggles whether a user should have their permissions removed from this recipe
     * @param user The user
     */
    function handleRemoveUser(user: UserWithPermissions): void {
        if (isUserRemoved(user)) {
            // when the user is in the removed list, then a second click means that the user should
            // be un-removed (i.e. restored)
            setRemovedUsers(removedUsers.filter(principleId => principleId !== user.principalId))
        } else {
            // add the user to the removed list
            const updated = removedUsers.slice()
            updated.push(user.principalId)
            setRemovedUsers(updated)
        }
    }

    const showRole = requester.role.name === RoleType.ADMIN
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Users with access</DialogTitle>
            <Divider/>
            <DialogContent>
                <List sx={{width: '100%', minWidth: 250, bgcolor: 'background.paper'}}>
                    {users.map(user => (
                            <ListItem key={`${user.email}-li`} alignItems="flex-start">
                                <ListItemText
                                    key={`${user.email}-li-text`}
                                    primary={
                                        <Card sx={{minWidth: 300, margin: 0}} variant="outlined"
                                              key={`${user.email}-li-card`}>
                                            <CardHeader
                                                title={
                                                    <Stack direction="row" alignItems="left" justifyContent="space-between">
                                                        <Typography
                                                            sx={{
                                                                fontSize: '0.8em',
                                                                fontWeight: 450,
                                                                textDecoration: isUserRemoved(user) ? "line-through" : "none"
                                                            }}
                                                            color="text.primary"
                                                            component="div"
                                                        >
                                                            {user.name}
                                                        </Typography>
                                                        <Tooltip
                                                            title={isUserRemoved(user) ?
                                                                "Restore user's access to recipe" :
                                                                "Remove user's access to recipe"}
                                                        >
                                                            <IconButton onClick={_ => handleRemoveUser(user)}>
                                                                {isUserRemoved(user) ? <Restore/> : <DeleteRounded/>}
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>}
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
                                                    disabled={isUserRemoved(user)}
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
                    disabled={updatedAccess.size === 0 && removedUsers.length === 0}
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
