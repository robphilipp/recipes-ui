import {useRouter} from "next/router";
import Centered from "../../../components/Centered";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {Button, FormControl, FormGroup, Typography} from "@mui/material";
import {emptyUser} from "../../../components/users/RecipesUser";
import {useState} from "react";
import UnmanagedPassword, {
    PasswordToggleState,
    togglePasswordState
} from "../../../components/passwords/UnmanagedPassword";

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

    const [passwordVisibility, setPasswordVisibility] = useState(PasswordToggleState.HIDDEN)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    function onToggleShowPassword(): void {
        setPasswordVisibility(state => togglePasswordState(state))
    }

    if (isLoading) {
        return <Centered><Typography>Looking for Booboo&apos;s friends...</Typography></Centered>
    }
    if (error) {
        return <Centered><Typography>Invalid password reset token!</Typography></Centered>
    }

    return (
        <Centered>
            <FormGroup style={{maxWidth: 400}}>
                <Typography style={{padding: 10}}>
                    Hi {data?.data.name}. You&apos;ve been invited to join City Recipes.
                    Please set your password.
                </Typography>
                <UnmanagedPassword
                    id="enter-password"
                    label="Enter Password"
                    onTogglePassword={onToggleShowPassword}
                    passwordToggleState={passwordVisibility}
                    onPasswordChange={passwd => setPassword(passwd)}
                    password={password}
                />
                <UnmanagedPassword
                    id="confirm-password"
                    label="Confirm Password"
                    onTogglePassword={onToggleShowPassword}
                    passwordToggleState={passwordVisibility}
                    onPasswordChange={passwd => setConfirmPassword(passwd)}
                    password={confirmPassword}
                />
                <FormControl style={{padding: 10}}>
                    <Button
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            width: 200,
                            alignSelf: 'center',
                        }}
                    >
                        Set Password
                    </Button>
                </FormControl>
            </FormGroup>
        </Centered>
    )
}