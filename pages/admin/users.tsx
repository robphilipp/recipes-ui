import React, {JSX, useMemo, useState} from "react"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import axios from "axios"
import {useRouter} from "next/router"
import Centered from "../../components/Centered"
import {Typography} from "@mui/material"
import {emptyUser, RecipesUser} from "../../components/users/RecipesUser"
import {DateTime} from "luxon"
import {Long} from "mongodb"
import UsersTable, {UsersTableRow} from "../../components/users/manage/UsersTable";
import AddUserForm, {AddUserFormUser} from "../../components/users/manage/AddUserForm";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Paper, {PaperProps} from "@mui/material/Paper";
import Draggable from "react-draggable";
import {Role} from "../../components/users/Role";

function PaperComponent(props: PaperProps) {
    return (
        <Draggable
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props}/>
        </Draggable>
    );
}

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

    // const addPasswordResetTokenQuery = useMutation(
    //     ['add-password-reset-token'],
    //     (userId: string) => axios.put(`/api/passwords/tokens/${userId}`)
    // )

    const deleteUsersQuery = useMutation(
        ['delete-users'],
        (users: Array<UsersTableRow>) => axios.patch(
            "/api/users",
            {action: "delete", emails: users.map(user => user.email)}
        )
    )

    const rolesQuery = useQuery(
        ['roles-all'],
        () => axios.get<Array<Role>>(`/api/roles`)
            .catch(async reason => {
                console.error(reason)
                await router.push("/api/auth/signin")
                return Promise.reject([])
            })
    )

    const [isAddUserFormVisible, setAddUserFormVisibility] = useState(false)

    async function handleSaveNewUser(user: AddUserFormUser): Promise<void> {
        const role = {name: user.role, description: user.roleDescription || ""}
        const recipeUser: RecipesUser = {...emptyUser(), name: user.username, email: user.email, role}
        const response = await addNewUserQuery.mutateAsync(recipeUser)
        if (response.status !== 200) {
            const message = `Failed to add new user; http_status_code: ${response.status}`
            console.error(message)
            return Promise.reject(message)
        }
        console.log(`Added user`, response.data)
        setAddUserFormVisibility(false)
        return await queryClient.invalidateQueries(['users-all'])
    }

    const rows: Array<UsersTableRow> = useMemo(
        () => {
            // don't do anything if the users are still being loaded or there
            // was an error loading the users
            if (isLoading || error) return []

            const users: Array<RecipesUser> = data?.data || []
            return users.map(user => ({
                email: user.email || "",
                username: user.name || "",
                role: user.role.description || "",
                emailVerified: user.emailVerified !== null && user.emailVerified as number > 0,
                emailVerifiedOn: convertTimestamp(user.emailVerified),
                createdOn: convertTimestamp(user.createdOn) || DateTime.utc(),
                modifiedOn: convertTimestamp(user.modifiedOn),
                deletedOn: convertTimestamp(user.deletedOn)
            }))
        },
        [data?.data, error, isLoading]
    )

    if (isLoading || addNewUserQuery.isLoading || rolesQuery.isLoading) {
        return <Centered><Typography>Looking for Booboo&apos;s friends...</Typography></Centered>
    }
    if (error || addNewUserQuery.isError || rolesQuery.isError) {
        return <Centered><Typography>Unable to locate Booboo&apos;s friends!</Typography></Centered>
    }

    function convertTimestamp(time: number | Long | null): DateTime | null {
        return time === null || time === -1 ? null : DateTime.fromMillis(time as number)
    }

    const roles = rolesQuery.data.data

    function handleResendEmail(userRow: UsersTableRow): void {

    }

    function handleEditUser(userRow: UsersTableRow): void {

    }

    async function handleDeleteUsers(users: Array<UsersTableRow>): Promise<void> {
        const response = await deleteUsersQuery.mutateAsync(users)
        if (response.status !== 200) {
            const message = `Failed to delete users; http_status_code: ${response.status}`
            console.error(message)
            return Promise.reject(message)
        }
        console.log(`Deleted users: [${users.map(user => user.email)}]`)
        return await queryClient.invalidateQueries(['users-all'])
    }

    return (<>
        <Typography variant="h5">Manage Users</Typography>
        <UsersTable
            rows={rows}
            onResendEmail={handleResendEmail}
            onAddUser={() => setAddUserFormVisibility(!isAddUserFormVisible)}
            onEdit={handleEditUser}
            onDeleteUsers={handleDeleteUsers}
            isAddingUser={isAddUserFormVisible}
        />
        <Dialog
            open={isAddUserFormVisible}
            onClose={() => setAddUserFormVisibility(false)}
            PaperComponent={PaperComponent}
            aria-labelledby="draggable-dialog-title"
            fullWidth={true}
            maxWidth='sm'
        >
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">Add User</DialogTitle>
            <DialogContent>
                <AddUserForm
                    onSave={handleSaveNewUser}
                    onCancel={() => setAddUserFormVisibility(false)}
                />
            </DialogContent>
        </Dialog>
    </>)
}
