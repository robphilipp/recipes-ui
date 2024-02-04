import {Box, Stack, styled, ToggleButton, ToggleButtonGroup, Typography} from "@mui/material";
import {AccessRight, accessRightArrayFor, accessRightsEqual, accessRightsWith} from "../RecipePermissions";
import React, {useRef, useState} from "react";
import {UserWithPermissions} from "../../../lib/recipes";
import {roleLiteralFrom, RoleType} from "../../users/Role";

type Action = "added" | "removed" | "none"
type AccessChanges = {
    create: Action
    read: Action
    update: Action
    delete: Action
}

/**
 * Calculates whether the {@link accessRight} was added, removed, or neither. The {@link originalRights} holds the
 * user's rights before any changes were made. The {@link updatedRights} holds the current (unsaved) rights
 * as updated in the UI.
 * @param originalRights The user's rights before any changes were made
 * @param updatedRights The current (unsaved) rights as updated in the UI
 * @param accessRight The access right for which to determine whether it was added or removed
 * @return The action (added, removed, or none)
 */
function calculateChange(originalRights: Array<AccessRight>, updatedRights: Array<AccessRight>, accessRight: AccessRight): Action {
    if (originalRights.indexOf(accessRight) === -1 && updatedRights.indexOf(accessRight) > -1) {
        return "added"
    }
    if (originalRights.indexOf(accessRight) > -1 && updatedRights.indexOf(accessRight) === -1) {
        return "removed"
    }
    return "none"
}

/**
 * Calculates the actions (added, removed, none) for each of the {@link originalRights} to get to the
 * {@link updatedRights}.
 * @param originalRights The user's original access rights
 * @param updatedRights The user's update access rights
 * @return The action applied to each access right to move from the {@link originalRights} to the
 * {@link updatedRights}.
 */
function calculateChanges(originalRights: Array<AccessRight>, updatedRights: Array<AccessRight>): AccessChanges {
    return {
        create: calculateChange(originalRights, updatedRights, AccessRight.CREATE),
        read: calculateChange(originalRights, updatedRights, AccessRight.READ),
        update: calculateChange(originalRights, updatedRights, AccessRight.UPDATE),
        delete: calculateChange(originalRights, updatedRights, AccessRight.DELETE)
    }
}

type Props = {
    user: UserWithPermissions
    onChange: (changes: AccessChanges, accessRights: Array<AccessRight>) => void
}

export function AccessRightsEditor(props: Props): JSX.Element {

    const {user, onChange} = props

    const original = useRef<Array<AccessRight>>(accessRightArrayFor(user.accessRights))
    const changes = useRef<AccessChanges>()
    const [access, setAccess] = useState<Array<AccessRight>>(() => accessRightArrayFor(user.accessRights))
    const [accessChanges, setAccessChanges] = useState(false)

    const calculateAccessChanges = (current: Array<AccessRight>): Array<AccessRight>  =>
        original.current !== undefined && !accessRightsEqual(original.current, current) ? current : original.current

    function handlePermissionChange(event: React.MouseEvent<HTMLElement>, newAccess: Array<AccessRight>, user: UserWithPermissions): void {
        changes.current = calculateChanges(original.current!, newAccess)

        // set the new access
        setAccess(newAccess)
        // calculate if there are any actual changes
        setAccessChanges(calculateAccessChanges(newAccess).length > 0)

        // report the changes and new permissions
        onChange(changes.current, newAccess)
    }

    function colorFor(user: UserWithPermissions, permission: "create" | "read" | "update" | "delete"): "green" | "error" | "primary" {
        const change = changes.current
        if (change?.[permission] === "added") return "green"
        if (change?.[permission] === "removed") return "error"
        return "primary"
    }

    return (<>
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
                    value={access}
                    onChange={(event, newAccess) => handlePermissionChange(event, newAccess, user)}
                    size="small"
                    sx={{marginLeft: '-5px'}}
                >
                    <ToggleButton
                        value={AccessRight.READ}
                        aria-label="read"
                        sx={{textTransform: 'none'}}
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
                        sx={{textTransform: 'none'}}
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
                        sx={{textTransform: 'none'}}
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
    </>)
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
