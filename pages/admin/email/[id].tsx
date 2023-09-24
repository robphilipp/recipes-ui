import SetPassword from "../../../emails/SetPassword";
import {useRouter} from "next/router";
import {useQuery} from "@tanstack/react-query";
import axios, {AxiosResponse} from "axios";
import {emptyUser, RecipesUser} from "../../../components/users/RecipesUser";
import {Typography} from "@mui/material";
import React from "react";
import {PasswordResetToken} from "../../../components/passwords/PasswordResetToken";

// todo temporary until I can get the host in here for real
const HOST: string = "http://localhost:3000"

export default function EmailViewer(): JSX.Element {
    const router = useRouter()

    const userId = router.query.id as string
    const userByIdQuery = useQuery<AxiosResponse<RecipesUser>>(
        ['users-by-id'],
        () => axios.get<RecipesUser>(`/api/users?user_id=${userId}`)
            .catch(async reason => {
                console.error(reason)
                await router.push("/api/auth/signin")
                return Promise.reject(emptyUser())
            })
    )

    const tokenByIdQuery = useQuery<AxiosResponse<Array<PasswordResetToken>>>(
        ['user-by-token-id'],
        () => axios
            .get<Array<PasswordResetToken>>(`/api/passwords/tokens/${userId}`)
            .catch(async reason => {
                console.error(reason)
                await router.push("/api/auth/signin")
                return Promise.reject("")
            })
    )

    if (userByIdQuery.isLoading || tokenByIdQuery.isLoading) {
        return <Typography>Looking for the user that Booboo bit...</Typography>
    }
    if (userByIdQuery.isError || tokenByIdQuery.isError) {
        return <Typography>Looking for a band-aide...</Typography>
    }

    const username = userByIdQuery.data?.data.name
    if (username === undefined || username === null) {
        return <Typography>Could not find user...</Typography>
    }
    const resetPasswordTokens = tokenByIdQuery.data.data
    if (resetPasswordTokens.length === 0) {
        return <Typography>Could not find reset token...</Typography>
    }

    // grab the most recent token
    const resetToken = resetPasswordTokens
        .sort((t1, t2) => t2.expiration - t1.expiration)[0].resetToken

    const resetPasswordLink = new URL(`${HOST}/passwords/token/${resetToken}`)
    return <SetPassword resetPasswordLink={resetPasswordLink} username={username}/>
}