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

const UserFormControl = styled(FormControl)(() => ({
    marginTop: 10,
}))

export type AddUserFormUser = {
    username: string
    email: string
    role: RoleType
    roleDescription?: string
}

const INITIAL_USER = {username: "", email: "", role: RoleType.USER}

const reducer = (user: AddUserFormUser, action: Partial<AddUserFormUser>): AddUserFormUser => ({...user, ...action})
const stringLengthConstraint = (name: string, value: string, min: number = 6, max: number = 30): string =>
    (value.length > 0 && (value.length < min || value.length > max)) ?
        `length (${value.length}) of the ${name} must be between ${min} and ${max} characters` :
        ""
const EMAIL_REGEX: RegExp = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)$/

type Props = {
    maxWidth?: number
    onSave: (user: AddUserFormUser) => void
    onCancel: () => void
}

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

    const [emailError, setEmailError] = useState("")


    function handleUpdateEmail(email: string): void {
        let error = stringLengthConstraint("email address", email)
        setEmailError(error)
        updateUser({email})
    }

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


    function enrichUser(): AddUserFormUser {
        const role = roles.find(role => role.name === user.role)
        if (role === undefined) {
            return user
        }
        return {...user, roleDescription: role.description}
    }

    return (<>
        <FormGroup style={{maxWidth}}>
            <UserFormControl>
                <TextField
                    label="Username"
                    maxRows={40}
                    onChange={event => updateUser({username: event.target.value})}
                    helperText="Please enter the name of the user that will be displayed on the recipes"
                />
            </UserFormControl>

            <UserFormControl>
                <TextField
                    label="Email"
                    error={emailError.length > 0}
                    helperText={emailError.length === 0 ? "Please enter a unique email address for the new user" : emailError}
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
                >
                    Save
                </Button>
            </Stack>
        </FormGroup>
    </>)
}