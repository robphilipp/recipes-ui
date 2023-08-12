import React, {JSX, useMemo, useState} from "react"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import axios from "axios"
import {useRouter} from "next/router"
import Centered from "../../components/Centered"
import {Button, Typography} from "@mui/material"
import {emptyUser, RecipesUser} from "../../components/users/RecipesUser"
import {DateTime} from "luxon"
import {Long} from "mongodb"
import {PersonAdd} from "@mui/icons-material";
import UsersTable, {UsersTableRow} from "../../components/users/UsersTable";
import AddUserForm, {AddUserFormUser} from "../../components/users/AddUserForm";

export default function ManageUsers(): JSX.Element {
    const router = useRouter()
    const queryClient = useQueryClient()
    const {isLoading, error, data} = useQuery(
        ['users-all'],
        () => axios.get<Array<RecipesUser>>(`/api/users`)
            .catch(async reason => {
                console.error(reason)
                await router.push("/api/auth/signin")
                return Promise.reject([])
            })
    )
    const addNewUserQuery = useMutation(
        ['add-new-user'],
        (user: RecipesUser) => axios.put("/api/users", user)
    )
    const addPasswordResetTokenQuery = useMutation(
        ['add-password-reset-token'],
        (userId: string) => axios.put(`/api/passwords/tokens/${userId}`)
    )

    const [isAddUserFormVisible, setAddUserFormVisibility] = useState(false)

    async function handleSaveNewUser(user: AddUserFormUser): Promise<void> {
        const role = {name: user.role, description: ""}
        const recipeUser: RecipesUser = {...emptyUser(), name: user.username, email: user.email, role}
        const response = await addNewUserQuery.mutateAsync(recipeUser)
        if (response.status !== 200) {
            console.error(`Failed to add new user; http_status_code: ${response.status}`)
            return Promise.reject(`Failed to add new user; http_status_code: ${response.status}`)
        }
        const tokenResponse = await addPasswordResetTokenQuery.mutateAsync((response.data as RecipesUser).id)
        if (tokenResponse.status !== 200) {
            console.error(`Failed to add password reset token; http_status_code: ${tokenResponse.status}`)
            return Promise.reject(`Failed to add password reset token; http_status_code: ${tokenResponse.status}`)
        }
        return await queryClient.invalidateQueries(['users-all'])
    }
    // async function handleSaveNewUser(user: AddUserFormUser): Promise<void> {
    //     const role = {name: user.role, description: ""}
    //     const recipeUser: RecipesUser = {...emptyUser(), name: user.username, email: user.email, role}
    //     const response = await addNewUserQuery.mutateAsync(recipeUser)
    //     if (response.status !== 200) {
    //         console.error(`Failed to add new user; http_status_code: ${response.status}`)
    //         return Promise.reject(`Failed to add new user; http_status_code: ${response.status}`)
    //     }
    //     const tokenResponse = await addPasswordResetTokenQuery.mutateAsync((response.data as RecipesUser).id)
    //     if (tokenResponse.status !== 200) {
    //         console.error(`Failed to add password reset token; http_status_code: ${tokenResponse.status}`)
    //         return Promise.reject(`Failed to add password reset token; http_status_code: ${tokenResponse.status}`)
    //     }
    //     return await queryClient.invalidateQueries(['users-all'])
    // }

    const rows: Array<UsersTableRow> = useMemo(
        () => {
            // don't do anything if the users are still being loaded or there
            // was an error loading the users
            if (isLoading || error) return []

            const users: Array<RecipesUser> = data?.data || []
            return users.map(user => ({
                email: user.email || "",
                username: user.name || "",
                role: user.role.name || "",
                emailVerified: user.emailVerified !== null,
                emailVerifiedOn: convertTimestamp(user.emailVerified),
                createdOn: convertTimestamp(user.createdOn) || DateTime.utc(),
                modifiedOn: convertTimestamp(user.modifiedOn),
                deletedOn: convertTimestamp(user.deletedOn)
            }))
        },
        [data?.data, error, isLoading]
    )

    if (isLoading || addNewUserQuery.isLoading) {
        return <Centered><Typography>Looking for Booboo&apos;s friends...</Typography></Centered>
    }
    if (error || addNewUserQuery.isLoading) {
        return <Centered><Typography>Unable to locate Booboo&apos;s friends!</Typography></Centered>
    }

    function convertTimestamp(time: number | Long | null): DateTime | null {
        return time === null || time === -1 ? null : DateTime.fromMillis(time as number)
    }

    return (<>
        <Typography variant="h5">Manage Users</Typography>
        <UsersTable rows={rows}/>
        {!isAddUserFormVisible && <Button
            variant="outlined"
            startIcon={<PersonAdd/>}
            sx={{textTransform: 'none'}}
            onClick={() => setAddUserFormVisibility(!isAddUserFormVisible)}
        >
            Add User
        </Button>}
        {isAddUserFormVisible && <AddUserForm
            onSave={handleSaveNewUser}
            onCancel={() => setAddUserFormVisibility(false)}
        />}
    </>)
}
