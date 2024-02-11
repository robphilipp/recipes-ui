import {RecipesUser} from "../../users/RecipesUser";
import {UserWithPermissions} from "../../../lib/recipes";
import React, {JSX, useState} from "react";
import {AccessRight, AccessRights, accessRightsFrom, accessRightsWith} from "../RecipePermissions";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import {Button, Divider, FormControl, FormGroup, styled, TextField} from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import {roleLiteralFrom, RoleType} from "../../users/Role";
import {emailFormatConstraint} from "../../users/manage/constraints";
import {AccessRightsEditor} from "./AccessRightsEditor";

const UserFormControl = styled(FormControl)(() => ({
    marginTop: 10,
}))

function userWithPermissions(email: string): UserWithPermissions {
    return ({
        principalId: "",
        name: "",
        email,
        accessRights: accessRightsWith(false, false, false, false),
        role: roleLiteralFrom(RoleType.USER)
    })
}

type Props = {
    recipeName?: string
    requester: RecipesUser
    open: boolean
    onClose: () => void
    onSave: (principalId: number, accessRights: AccessRights) => void
}

export function RecipeAddUsersView(props: Props): JSX.Element {
    const {
        recipeName = "this recipe",
        requester,
        open,
        onClose,
        onSave
    } = props

    const [emailError, setEmailError] = useState("")
    const [email, setEmail] = useState<string>("")
    const [user, setUser] = useState<UserWithPermissions>(userWithPermissions(email))

    function handleSave(): void {
        // onSave()
    }

    /**
     * Handler that checks the validity of the email
     * @param email The email to update
     */
    function handleUpdateEmail(email: string): void {
        setEmailError(emailFormatConstraint(email))
    }

    function handleAccessChange(accessRights: Array<AccessRight>): void {
        setUser(prevUser => updateAccessRights(prevUser, accessRights))
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Give user access to {recipeName}</DialogTitle>
            <Divider/>
            <DialogContent>
                <FormGroup style={{maxWidth: 300}}>
                    <UserFormControl style={{paddingBottom: 20}}>
                        <TextField
                            label="Email"
                            error={emailError.length > 0}
                            helperText={emailError.length === 0 ?
                                "Email address of user to add" :
                                emailError}
                            maxRows={40}
                            onChange={event => handleUpdateEmail(event.target.value)}
                        />
                    </UserFormControl>
                    <AccessRightsEditor
                        user={user}
                        onChange={(_, a, accessRights) => handleAccessChange(accessRights)}
                    />
                </FormGroup>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleSave}
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

/**
 * Updates the users access rights and returns a new {@link UserWithPermissions} object
 * @param user The user to update
 * @param accessRights The new access rights
 * @return a new {@link UserWithPermissions} object with updated access rights
 */
function updateAccessRights(user: UserWithPermissions, accessRights: Array<AccessRight>): UserWithPermissions {
    return {
        ...user,
        accessRights: accessRightsFrom(accessRights)
    }
}
