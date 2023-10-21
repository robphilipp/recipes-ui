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
import {Role, roleFrom} from "../../components/users/Role";
import EditUserForm, {EditUserFormUser} from "../../components/users/manage/EditUserForm";

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
    // const {isLoading, error, data} = useQuery(
    const getUsersQuery = useQuery(
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

    const updateUserQuery = useMutation(
        ['update-user'],
        (user: RecipesUser) => axios.post("/api/users", user)
    )

    // const addPasswordResetTokenQuery = useMutation(
    //     ['add-password-reset-token'],
    //     (userId: string) => axios.put(`/api/passwords/tokens/${userId}`)
    // )

    const generatePasswordResetTokenQuery = useMutation(
        ['generate-user-password-token'],
        (userId: string) => axios.put(`/api/passwords/tokens/${userId}`)
    )

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
    const [isEditUserFormVisible, setEditUserFormVisibility] = useState(false)
    const [editUser, setEditUser] = useState<RecipesUser>(emptyUser())

    async function handleSaveNewUser(user: AddUserFormUser): Promise<void> {
        const role = {name: user.role, description: user.roleDescription || ""}
        const recipeUser: RecipesUser = {...emptyUser(), name: user.username, email: user.email, role}
        const response = await addNewUserQuery.mutateAsync(recipeUser)
        if (response.status !== 200) {
            const message = `Failed to add new user; http_status_code: ${response.status}`
            console.error(message)
            return Promise.reject(message)
        }
        setAddUserFormVisibility(false)
        return await queryClient.invalidateQueries(['users-all'])
    }

    async function handleSaveEditedUser(user: RecipesUser): Promise<void> {
        const response = await updateUserQuery.mutateAsync(user)
        if (response.status !== 200) {
            const message = `Failed to update user; http_status_code: ${response.status}`
            console.error(message)
            return Promise.reject(message)
        }
        setEditUserFormVisibility(false)
        return await queryClient.invalidateQueries(['users-all'])
    }

    const rows: Array<UsersTableRow> = useMemo(
        () => {
            // don't do anything if the users are still being loaded or there
            // was an error loading the users
            if (getUsersQuery.isLoading || getUsersQuery.error) return []

            const users: Array<RecipesUser> = getUsersQuery.data?.data || []
            return users.map(user => ({
                id: user.id || "",
                email: user.email || "",
                username: user.name || "",
                role: user.role.description || "",
                roleType: user.role.name || "",
                emailVerified: user.emailVerified !== null && user.emailVerified as number > 0,
                emailVerifiedOn: convertTimestamp(user.emailVerified),
                createdOn: convertTimestamp(user.createdOn) || DateTime.utc(),
                modifiedOn: convertTimestamp(user.modifiedOn),
                deletedOn: convertTimestamp(user.deletedOn)
            }))
        },
        [getUsersQuery.data?.data, getUsersQuery.error, getUsersQuery.isLoading]
    )

    if (getUsersQuery.isLoading || addNewUserQuery.isLoading || rolesQuery.isLoading) {
        return <Centered><Typography>Looking for Booboo&apos;s friends...</Typography></Centered>
    }
    if (getUsersQuery.isError || addNewUserQuery.isError || rolesQuery.isError) {
        return <Centered><Typography>Unable to locate Booboo&apos;s friends!</Typography></Centered>
    }

    function convertTimestamp(time: number | Long | null): DateTime | null {
        return time === null || time === -1 ? null : DateTime.fromMillis(time as number)
    }

    const roles = rolesQuery.data.data

    // todo, this needs to display the generated email on a new page
    /**
     * Currently this function generates a new password reset token and then displays the email
     * generated by the react-email so that it can be copy-pasted into an email. Ultimately, this
     * should send an actual email.
     * @param userRow The user as represented in the user table
     */
    async function handleResendEmail(userId: string, userEmail: string): Promise<void> {
        const response = await generatePasswordResetTokenQuery.mutateAsync(userId)
        if (response.status != 200) {
            const message = `Failed to generate password reset token; http_status_code: ${response.status}; ` +
                `user_id: ${userId}; email" ${userEmail}`
            console.error(message)
            return Promise.reject(message)
        }
        await queryClient.invalidateQueries(['users-all'])
        // await router.push(`/admin/email/${userRow.id}`)
        window.open(`/passwords/email/${userId}`, '_blank')
    }
    // async function handleResendEmail(userRow: UsersTableRow): Promise<void> {
    //     const response = await generatePasswordResetTokenQuery.mutateAsync(userRow.id)
    //     if (response.status != 200) {
    //         const message = `Failed to generate password reset token; http_status_code: ${response.status}; ` +
    //             `user_id: ${userRow.id}; email" ${userRow.email}`
    //         console.error(message)
    //         return Promise.reject(message)
    //     }
    //     await queryClient.invalidateQueries(['users-all'])
    //     // await router.push(`/admin/email/${userRow.id}`)
    //     window.open(`/passwords/email/${userRow.id}`, '_blank')
    // }

    function handleEditUser(userRow: UsersTableRow): void {
        const recipeUser: RecipesUser = {
            id: userRow.id,
            name: userRow.username,
            email: userRow.email,
            role: roleFrom({name: userRow.roleType, description: userRow.role}).getOrThrow(),
            createdOn: userRow.createdOn.toMillis(),
            emailVerified: userRow.emailVerifiedOn?.toMillis() || -1,
            modifiedOn: userRow.modifiedOn?.toMillis() || -1,
            deletedOn: userRow.deletedOn?.toMillis() || -1,
            password: "",
            // todo once images are added, then need to update this
            image: ""
        }

        setEditUser(recipeUser)
        setEditUserFormVisibility(!isEditUserFormVisible && !isAddUserFormVisible)
    }

    function handleEditFormClose(reason: "backdropClick" | "escapeKeyDown") {
        // prevent the dialog from closing when the back-drop is clicked (user must
        // use the escape key, or click the cancel or save button
        if (reason === "backdropClick") return;
        setEditUserFormVisibility(false)
    }

    function handleAddFormClose(reason: "backdropClick" | "escapeKeyDown") {
        // prevent the dialog from closing when the back-drop is clicked (user must
        // use the escape key, or click the cancel or save button
        if (reason === "backdropClick") return;
        setAddUserFormVisibility(false)
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
            onAddUser={() => setAddUserFormVisibility(!isAddUserFormVisible && !isEditUserFormVisible)}
            onEdit={handleEditUser}
            onDeleteUsers={handleDeleteUsers}
            isAddingUser={isAddUserFormVisible}
        />
        <Dialog
            open={isAddUserFormVisible}
            onClose={(_, reason) => handleAddFormClose(reason)}
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
        <Dialog
            open={isEditUserFormVisible}
            onClose={(_, reason) => handleEditFormClose(reason)}
            PaperComponent={PaperComponent}
            aria-labelledby="draggable-dialog-title"
            fullWidth={true}
            maxWidth='sm'
        >
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">Edit User</DialogTitle>
            <DialogContent>
                <EditUserForm
                    onSave={handleSaveEditedUser}
                    onCancel={() => setEditUserFormVisibility(false)}
                    user={editUser}
                    onResendEmail={handleResendEmail}
                />
            </DialogContent>
        </Dialog>
    </>)
}
