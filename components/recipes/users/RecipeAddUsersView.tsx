import {emptyUser, RecipesUser} from "../../users/RecipesUser";
import {UserWithPermissions} from "../../../lib/recipes";
import React, {JSX, useState} from "react";
import {AccessRight, accessRightsWith, RecipePermission} from "../RecipePermissions";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import {
    Box, Button,
    Card,
    CardContent,
    CardHeader,
    Divider, FormControl, FormGroup, InputLabel,
    List,
    ListItem,
    ListItemText, MenuItem, Select,
    Stack, styled, TextField, ToggleButton,
    Typography
} from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import {roleAtLeast, roleLiteralFrom, RoleType} from "../../users/Role";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import axios from "axios";
import {emailFormatConstraint} from "../../users/manage/constraints";
import {EMAIL_EXISTENCE} from "../../users/manage/AddUserForm";
import useThrottling from "../../../lib/useThrottling";
import {AccessRightsEditor} from "./AccessRightsEditor";

const UserFormControl = styled(FormControl)(() => ({
    marginTop: 10,
}))

function userWithPermissions(email: string): UserWithPermissions {
    return ({
        principalId: "",
        name: "",
        email,
        accessRights: accessRightsWith(false, true, false, false),
        role: roleLiteralFrom(RoleType.USER)
    })
}

type Props = {
    recipeName?: string
    requester: RecipesUser
    open: boolean
    onClose: () => void
    onSave: (permissions: RecipePermission) => void
}

export function RecipeAddUsersView(props: Props): JSX.Element {
    const {
        recipeName = "this recipe",
        requester,
        open,
        onClose,
        onSave
    } = props

    const emailThrottle = useThrottling<string>(100, "", "email")

    const [emailError, setEmailError] = useState("")
    const [email, setEmail] = useState<string>("")
    const [user, setUser] = useState<UserWithPermissions>(userWithPermissions(email))

    function handleSave(): void {

    }

    /**
     * Throttled handler that checks the validity of the email and reports when
     * the email already exists in the system, and updates the user (locally) with the
     * new email.
     * @param email The email to update
     * @return An empty {@link Promise}
     */
    async function handleUpdateEmail(email: string): Promise<void> {
        emailThrottle(email, async email => {
            const response = await axios.get(`/api/users?${EMAIL_EXISTENCE}=${email}`)
            // const error = stringLengthConstraint("email address", email) +
            const error = emailFormatConstraint(email) +
                (response.data.exists ? "Email already exists" : "")
            setEmailError(error)
        })
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Give user access to {recipeName}</DialogTitle>
            <Divider/>
            <DialogContent>
                <FormGroup style={{maxWidth: 300}}>
                    <UserFormControl>
                        <TextField
                            label="Email"
                            error={emailError.length > 0}
                            helperText={emailError.length === 0 ?
                                "Please enter a unique email address for the new user" :
                                emailError}
                            maxRows={40}
                            onChange={event => handleUpdateEmail(event.target.value)}
                        />
                    </UserFormControl>
                    {/*{
                        todo create a permission component, taken from the RecipeUsersView, and then update the
                             RecipeUsersView to use that component
                     }*/}
                    <AccessRightsEditor user={user} onChange={() => {}}/>
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