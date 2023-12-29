import {UserWithPermissions} from "../../../lib/recipes";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    List,
    ListItem,
    ListItemText,
    Stack,
    styled,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import {AccessRight, accessRightArrayFor} from "../RecipePermissions";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import React, {JSX, useEffect, useRef, useState} from "react";
import DialogActions from "@mui/material/DialogActions";
import {RecipesUser} from "../../users/RecipesUser";
import {RoleType} from "../../users/Role";

type Action = "added" | "removed" | "none"
type AccessChanges = {
    create: Action
    read: Action
    update: Action
    delete: Action
}

function calculateChange(oldRights: Array<AccessRight>, newRights: Array<AccessRight>, right: AccessRight): Action {
    if (oldRights.indexOf(right) === -1 && newRights.indexOf(right) > -1) {
        return "added"
    }
    if (oldRights.indexOf(right) > -1 && newRights.indexOf(right) === -1) {
        return "removed"
    }
    return "none"
}
function calculateChanges(oldRights: Array<AccessRight>, newRights: Array<AccessRight>): AccessChanges {
    return {
        create: calculateChange(oldRights, newRights, AccessRight.CREATE),
        read: calculateChange(oldRights, newRights, AccessRight.READ),
        update: calculateChange(oldRights, newRights, AccessRight.UPDATE),
        delete: calculateChange(oldRights, newRights, AccessRight.DELETE)
    }
}

type Props = {
    requester: RecipesUser
    users: Array<UserWithPermissions>
    open: boolean
    onClose: () => void
    itemRenderer?: (user: UserWithPermissions) => JSX.Element
}

export default function RecipeUsersView(props: Props): JSX.Element {
    const {
        requester,
        users,
        open,
        onClose,
    } = props

    const original = useRef<Map<string, Array<AccessRight>>>(new Map())
    const changes = useRef<Map<string, AccessChanges>>(new Map())
    const [access, setAccess] = useState<Map<string, Array<AccessRight>>>(() => new Map())

    // this same component is used by all the recipes, and so when the user list
    // changes, we need to update the permissions (each recipe will, and must, have
    // its own user list)
    useEffect(
        () => {
            changes.current = new Map()
            const initialAccess = new Map(users.map(user => ([user.principalId, accessRightArrayFor(user.accessRights)])))
            original.current = initialAccess
            setAccess(initialAccess)
        },
        [users]
    )

    function handlePermissionChange(event: React.MouseEvent<HTMLElement>, newAccess: Array<AccessRight>, user: UserWithPermissions): void {
        changes.current.set(user.principalId, calculateChanges(original.current.get(user.principalId)!, newAccess))

        const updated = new Map(access)
        updated.set(user.principalId, newAccess)
        setAccess(updated)
    }

    function colorFor(user: UserWithPermissions, permission: "create" | "read" | "update" | "delete"): "green" | "error" | "primary" {
        const change = changes.current.get(user.principalId)
        if (change?.[permission] === "added") return "green"
        if (change?.[permission] === "removed") return "error"
        return "primary"
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
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        marginTop: '-0.5em'
                                                    }}
                                                >
                                                    <Stack>
                                                        <Typography
                                                            sx={{display: 'inline', marginTop: '-1em'}}
                                                            component="div"
                                                            variant="body2"
                                                            color="text.primary"
                                                        >
                                                            {user.email}
                                                        </Typography>
                                                        <StyledToggleButtonGroup
                                                            key={`${user.principalId}-toggle-buttons`}
                                                            value={access.get(user.principalId) ?? []}
                                                            onChange={(event, newAccess) => handlePermissionChange(event, newAccess, user)}
                                                            size="small"
                                                            sx={{marginLeft: '-5px'}}
                                                        >
                                                            <ToggleButton
                                                                value={AccessRight.READ}
                                                                aria-label="read"
                                                            >
                                                                <Typography
                                                                    color={colorFor(user, "read")}
                                                                    sx={{fontSize: '1em'}}
                                                                >
                                                                    Read
                                                                </Typography>
                                                            </ToggleButton>
                                                            <ToggleButton
                                                                value={AccessRight.UPDATE}
                                                                aria-label="update"
                                                            >
                                                                <Typography
                                                                    color={colorFor(user, "update")}
                                                                    sx={{fontSize: '1em'}}
                                                                >
                                                                    Update
                                                                </Typography>
                                                            </ToggleButton>
                                                            <ToggleButton
                                                                value={AccessRight.DELETE}
                                                                aria-label="delete"
                                                            >
                                                                <Typography
                                                                    color={colorFor(user, "delete")}
                                                                    sx={{fontSize: '1em'}}
                                                                >
                                                                    Delete
                                                                </Typography>
                                                            </ToggleButton>
                                                        </StyledToggleButtonGroup>
                                                    </Stack>
                                                </Box>
                                            </CardContent>
                                        </Card>}
                                />
                            </ListItem>
                        )
                    )}
                </List>
            </DialogContent>
            <DialogActions>
                <Button>Save</Button>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    )
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({theme}) => ({
    '& .MuiToggleButtonGroup-grouped': {
        margin: theme.spacing(0.5),
        border: 0,
        '&.Mui-disabled': {
            border: 0,
        },
        '&:not(:first-of-type)': {
            borderRadius: theme.shape.borderRadius,
        },
        '&:first-of-type': {
            borderRadius: theme.shape.borderRadius,
        },
    },
}));
