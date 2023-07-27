import {useRouter} from "next/router";
import Centered from "../../../components/Centered";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {Typography} from "@mui/material";
import {emptyUser} from "../../../components/users/RecipesUser";

export default function PasswordByToken(): JSX.Element {
    const router = useRouter()

    const token = router.query.id as string

    // grab the user associated with the password reset token, and if
    // no user is associated with that token, or the token has expired,
    // then report back
    const {isLoading, error, data} = useQuery(
        ['user-by-token-id'],
        () => axios
            .get(`/api/passwords/${token}`)
            .catch(async reason => {
                console.error(reason)
                await router.push("/api/auth/signin")
                return Promise.reject(emptyUser())
            })
    )

    if (isLoading) {
        return <Centered><Typography>Looking for Booboo&apos;s friends...</Typography></Centered>
    }
    if (error) {
        return <Centered><Typography>Invalid password reset token!</Typography></Centered>
    }

    return (
        <Centered>
            <div>Hey {data?.data.name}, this is your token: {token ?? router.query.id}</div>
        </Centered>
    )
}