import {
    Button,
    FormControl,
    FormGroup,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    styled,
    TextField,
    Typography
} from "@mui/material";
import {Role, roleAtLeast, RoleType, roleTypeFrom} from "../Role";
import React, {useReducer, useState} from "react";
import {useRecipeSession} from "../../../lib/RecipeSessionProvider";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {useRouter} from "next/router";
import Centered from "../../Centered";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import useThrottling from "../../../lib/useThrottling";
import {emailFormatConstraint, stringLengthConstraint} from "./constraints";
import {isEmptyUser, RecipesUser} from "../RecipesUser";
import {Mail} from "@mui/icons-material";

const UserFormControl = styled(FormControl)(() => ({
    marginTop: 10,
}))

/**
 * The user representation for this edit-user form
 */
export type EditUserFormUser = {
    username: string
    email: string
    role: RoleType
    roleDescription?: string
}

export const emptyEditFormUser = (): EditUserFormUser => ({
    username: "",
    email: "",
    role: RoleType.USER,
    roleDescription: ""
})

// the initial user for this add-user form
function asFormUser(user: RecipesUser): EditUserFormUser {
    if (isEmptyUser(user)) {
        return emptyEditFormUser()
    }
    return {
        username: user.name || "",
        email: user.email || "",
        role: user.role.name,
        roleDescription: user.role.description
    }
}

/**
 * Reducer for the user accepts a current state, an action, and returns the updated state
 * @param user The current user
 * @param action The action to apply to the user (which, in this case, is the partial, updated user)
 * @return The updated user
 */
const reducer = (user: EditUserFormUser, action: Partial<EditUserFormUser>): EditUserFormUser => ({...user, ...action})

// used as the query-string for making REST call to determine the existence
// of username and email
export const NAME_EXISTENCE = "name_existence"
export const EMAIL_EXISTENCE = "email_existence"

type Props = {
    user: RecipesUser
    maxWidth?: number
    onResendEmail: (userId: string, userEmail: string) => void
    onSave: (user: RecipesUser) => void
    onCancel: () => void
}

/**
 * Form for editing an existing user
 * @param props The component properties
 * @return A {@link JSX.Element}
 * @constructor
 */
export default function EditUserForm(props: Props): JSX.Element {
    const {user, maxWidth = 600, onResendEmail, onSave, onCancel} = props

    const router = useRouter()
    const {role: adminRole} = useRecipeSession()
    const [formUser, updateUser] = useReducer(reducer, asFormUser(user))

    // need the roles for the role selection dropdown
    const {isLoading, error, data} = useQuery(
        ['roles-all'],
        () => axios.get<Array<Role>>(`/api/roles`)
            .catch(async reason => {
                console.error(reason)
                await router.push("/api/auth/signin")
                return Promise.reject([])
            })
    )

    /*
     * Holds the error state for username and email validity (empty error means there
     * is no error)
     */
    const [usernameError, setUsernameError] = useState("")
    const [emailError, setEmailError] = useState("")

    /*
     * Throttles the lookup of the username and email to ensure that the ones the user
     * is attempting to add don't already exist in the system (these lookups sare REST calls)
     */
    const usernameThrottle = useThrottling<string>(100, "", "username")
    const emailThrottle = useThrottling<string>(100, "", "email")

    /**
     * Throttled handler that checks the validity of the username and reports when
     * the username already exists in the system, and updates the user (locally) with the
     * new username. When the username already exists, but is the current username of this user,
     * then no error is reported.
     * @param username The username to update
     * @return An empty {@link Promise}
     */
    async function handleUpdateUsername(username: string): Promise<void> {
        usernameThrottle(username, async name => {
            const response = await axios.get(`/api/users?${NAME_EXISTENCE}=${name}`)
            const error = stringLengthConstraint("username", name) +
                ((response.data.exists && username !== user.name) ? "Username already exists" : "")
            setUsernameError(error)
        })
        updateUser({username})
    }

    /**
     * Throttled handler that checks the validity of the email and reports when
     * the email already exists in the system, and updates the user (locally) with the
     * new email.When the email already exists, but is the current email of this user,
     * then no error is reported.
     * @param email The email to update
     * @return An empty {@link Promise}
     */
    async function handleUpdateEmail(email: string): Promise<void> {
        emailThrottle(email, async email => {
            const response = await axios.get(`/api/users?${EMAIL_EXISTENCE}=${email}`)
            // const error = stringLengthConstraint("email address", email) +
            const error = emailFormatConstraint(email) +
                ((response.data.exists && email !== user.email) ? "Email already exists" : "")
            setEmailError(error)
        })
        updateUser({email})
    }

    /**
     * Handles updating the (local) user with the new role
     * @param event The event holding the new role value
     * @return An empty {@link Promise}
     */
    function handleRoleSelected(event: SelectChangeEvent): void {
        roleTypeFrom(event.target.value)
            .onSuccess(selection => updateUser({role: selection}))
    }

    if (isLoading) {
        return <Centered><Typography>Looking for Booboo&apos;s friends...</Typography></Centered>
    }
    if (error) {
        return <Centered><Typography>Unable to locate Booboo&apos;s friends!</Typography></Centered>
    }

    const roles: Array<Role> = data?.data || []

    /**
     * Updates the user with the values from the form, and the role with the full role
     * @return An updated user
     */
    function enrichUser(): RecipesUser {
        const role = roles.find(role => role.name === formUser.role)
        if (role === undefined) {
            return user
        }
        return {...user, role, name: formUser.username, email: formUser.email}
    }

    /**
     * @return `true` if the "save" button is disable; `false` otherwise
     */
    function saveDisabled(): boolean {
        return usernameError.length > 0 ||
            emailError.length > 0 ||
            formUser.username.length === 0 ||
            formUser.email.length === 0
    }

    return (<>
        <FormGroup style={{maxWidth}}>
            <UserFormControl>
                <TextField
                    label="Username"
                    defaultValue={formUser.username}
                    error={usernameError.length > 0}
                    maxRows={40}
                    onChange={event => handleUpdateUsername(event.target.value)}
                    helperText={usernameError.length === 0 ?
                        "Please enter the name of the user that will be displayed on the recipes" :
                        usernameError}
                />
            </UserFormControl>

            <UserFormControl>
                <TextField
                    label="Email"
                    defaultValue={formUser.email}
                    error={emailError.length > 0}
                    helperText={emailError.length === 0 ?
                        "Please enter a unique email address for the new user" :
                        emailError}
                    maxRows={40}
                    onChange={event => handleUpdateEmail(event.target.value)}
                />
            </UserFormControl>

            <UserFormControl>
                <InputLabel htmlFor="role">Role</InputLabel>
                <Select
                    labelId="role-select-label"
                    id="role-select"
                    value={formUser.role}
                    label="Role"
                    onChange={handleRoleSelected}
                >
                    {roles
                        .filter(availRole => roleAtLeast(availRole.name)(adminRole))
                        .map(role => (
                            <MenuItem
                                key={role.name}
                                value={role.name}
                            >
                                {role.description}
                            </MenuItem>
                        ))
                    }
                </Select>
            </UserFormControl>

            <Stack direction='row' style={{paddingTop: 20}}>
                <Button
                    startIcon={<Mail/>}
                    size='small'
                    sx={{textTransform: 'none'}}
                    onClick={event => {
                        event.preventDefault()
                        onResendEmail(user.id, formUser.email)
                    }}
                    disabled={emailError.length > 0}
                >
                    Send Reset Password Email
                </Button>
            </Stack>

            <Stack direction='row' style={{justifyContent: 'right', paddingTop: 20}}>
                <Button
                    startIcon={<CancelIcon/>}
                    sx={{textTransform: 'none'}}
                    size='small'
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    startIcon={<SaveIcon/>}
                    size='small'
                    sx={{textTransform: 'none'}}
                    onClick={() => onSave(enrichUser())}
                    disabled={saveDisabled()}
                >
                    Save
                </Button>
            </Stack>
        </FormGroup>
    </>)
}