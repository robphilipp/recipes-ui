import {
    Button,
    ButtonGroup,
    FormControl,
    FormGroup,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    styled,
    Typography
} from "@mui/material";
import {Role, roleAtLeast, RoleType, roleTypeFrom} from "./Role";
import React, {useReducer} from "react";
import {useRecipeSession} from "../../lib/RecipeSessionProvider";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {useRouter} from "next/router";
import Centered from "../Centered";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import {RecipesUser} from "./RecipesUser";

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

type Props = {
    maxWidth?: number
    onSave: (user: AddUserFormUser) => void
    onCancel: () => void
}

export default function AddUserForm(props: Props): JSX.Element {
    const {maxWidth = 400, onSave, onCancel} = props

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
            <ButtonGroup style={{justifyContent: 'left', paddingTop: 0}}>
                <Button
                    variant="outlined"
                    startIcon={<CancelIcon/>}
                    sx={{textTransform: 'none'}}
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<SaveIcon/>}
                    sx={{textTransform: 'none'}}
                    onClick={() => onSave(enrichUser())}
                >
                    Save
                </Button>
            </ButtonGroup>
            <UserFormControl>
                <InputLabel htmlFor="username">Username</InputLabel>
                <OutlinedInput
                    label="Username"
                    onChange={event => updateUser({username: event.target.value})}
                />
            </UserFormControl>

            <UserFormControl>
                <InputLabel htmlFor="email">Email</InputLabel>
                <OutlinedInput
                    label="Email"
                    onChange={event => updateUser({email: event.target.value})}
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
        </FormGroup>
    </>)
}