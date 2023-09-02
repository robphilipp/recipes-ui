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

const UserFormControl = styled(FormControl)(() => ({
    marginTop: 10,
}))

/**
 * The user representation for this add-user form
 */
export type AddUserFormUser = {
    username: string
    email: string
    role: RoleType
    roleDescription?: string
}

// the initial user for this add-user form
const INITIAL_USER: AddUserFormUser = {username: "", email: "", role: RoleType.USER}

/**
 * Reducer for the user accepts a current state, an action, and returns the updated state
 * @param user The current user
 * @param action The action to apply to the user (which, in this case, is the partial, updated user)
 * @return The updated user
 */
const reducer = (user: AddUserFormUser, action: Partial<AddUserFormUser>): AddUserFormUser => ({...user, ...action})

// used as the query-string for making REST call to determine the existence
// of username and email
export const NAME_EXISTENCE = "name_existence"
export const EMAIL_EXISTENCE = "email_existence"

type Props = {
    maxWidth?: number
    onSave: (user: AddUserFormUser) => void
    onCancel: () => void
}

/**
 * Form for adding a new user
 * @param props The component properties
 * @return A {@link JSX.Element}
 * @constructor
 */
export default function AddUserForm(props: Props): JSX.Element {
    const {maxWidth = 600, onSave, onCancel} = props

    const router = useRouter()
    const {role: adminRole} = useRecipeSession()
    const [user, updateUser] = useReducer(reducer, INITIAL_USER)

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
     * new username.
     * @param username The username to update
     * @return An empty {@link Promise}
     */
    async function handleUpdateUsername(username: string): Promise<void> {
        usernameThrottle(username, async name => {
            const response = await axios.get(`/api/users?${NAME_EXISTENCE}=${name}`)
            const error = stringLengthConstraint("username", name) +
                (response.data.exists ? "Username already exists" : "")
            setUsernameError(error)
        })
        updateUser({username})
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
        updateUser({email})
    }

    /**
     * Handles updating the (local) user with the new role
     * @param event The event holding the new role value
     * @return An empty {@link Promise}     */
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
     * Enriches the user with the role description based on the user's role name
     * @return An enriched (spiritually) user
     */
    function enrichUser(): AddUserFormUser {
        const role = roles.find(role => role.name === user.role)
        if (role === undefined) {
            return user
        }
        return {...user, roleDescription: role.description}
    }

    /**
     * @return `true` if the "save" button is disable; `false` otherwise
     */
    function saveDisabled(): boolean {
        return usernameError.length > 0 ||
            emailError.length > 0 ||
            user.username.length === 0 ||
            user.email.length === 0
    }

    return (<>
        <FormGroup style={{maxWidth}}>
            <UserFormControl>
                <TextField
                    label="Username"
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
                    value={user.role}
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