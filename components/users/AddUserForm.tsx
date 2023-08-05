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
import React, {useState} from "react";
import {useRecipeSession} from "../../lib/RecipeSessionProvider";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {useRouter} from "next/router";
import Centered from "../Centered";

const UserFormControl = styled(FormControl)(({theme}) => ({
    marginTop: 10,
}))

export type AddUserFormUser = {
    username: string
    email: string
    role: RoleType
}

type Props = {
    maxWidth?: number
    onSave: (user: AddUserFormUser) => void
    onCancel: () => void
}

export default function AddUserForm(props: Props): JSX.Element {
    const {maxWidth = 400, onSave, onCancel} = props

    const router = useRouter()
    const {role: adminRole} = useRecipeSession()
    const [selectedRole, setSelectedRole] = useState(RoleType.USER as string)

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
            .onSuccess(selection => setSelectedRole(selection as string))
    }

    if (isLoading) {
        return <Centered><Typography>Looking for Booboo&apos;s friends...</Typography></Centered>
    }
    if (error) {
        return <Centered><Typography>Unable to locate Booboo&apos;s friends!</Typography></Centered>
    }

    const roles: Array<Role> = data?.data || []
    return (<>
        <FormGroup style={{maxWidth}}>
            <UserFormControl>
                <InputLabel htmlFor="username">Username</InputLabel>
                <OutlinedInput label="Username"/>
            </UserFormControl>

            <UserFormControl>
                <InputLabel htmlFor="email">Email</InputLabel>
                <OutlinedInput label="Email"/>
            </UserFormControl>

            <UserFormControl>
                <InputLabel htmlFor="role">Role</InputLabel>
                <Select
                    labelId="role-select-label"
                    id="role-select"
                    value={selectedRole}
                    label="Role"
                    onChange={handleRoleSelected}
                >
                    {roles
                        .filter(availRole => roleAtLeast(availRole.name)(adminRole))
                        .map(role => (<MenuItem key={role.name} value={role.name}>{role.description}</MenuItem>))
                    }
                </Select>
            </UserFormControl>

            <ButtonGroup style={{justifyContent: 'right', paddingTop: 20}}>
                <Button>Save</Button>
                <Button onClick={onCancel}>Cancel</Button>
            </ButtonGroup>
        </FormGroup>
    </>)
}