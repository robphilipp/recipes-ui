import {useRouter} from "next/router";
import Centered from "../../../components/Centered";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import axios, {AxiosError} from "axios";
import {Button, FormControl, FormGroup, List, ListItem, Typography} from "@mui/material";
import {emptyUser} from "../../../components/users/RecipesUser";
import {useState} from "react";
import UnmanagedPassword, {
    PasswordToggleState,
    togglePasswordState
} from "../../../components/passwords/UnmanagedPassword";
import {
    initialPasswordRequirements,
    passwordRequirementsResult,
    passwordsMatch
} from "../../../components/passwords/passwordRequirements";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {NewPassword} from "../../api/passwords/[id]";


/**
 * Page to allow the user to enter a new password based on a hash digest
 * @constructor
 */
export default function PasswordByToken(): JSX.Element {
    const router = useRouter()

    const token = router.query.id as string
    const queryClient = useQueryClient()

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

    // query for updating the recipe's rating
    const setPasswordQuery = useMutation(
        ['set-password-from-token'],
        (passwordInfo: NewPassword) => axios.put(
            `/api/passwords/${token}`,
            passwordInfo
        )
    )

    const [passwordVisibility, setPasswordVisibility] = useState(PasswordToggleState.HIDDEN)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [results, setResults] = useState(initialPasswordRequirements())
    const [matchError, setMatchError] = useState(false)

    function onToggleShowPassword(): void {
        setPasswordVisibility(state => togglePasswordState(state))
    }

    function handleUpdatePassword(password: string): void {
        setNewPassword(password)
        setResults(passwordRequirementsResult(password))
        setMatchError(!passwordsMatch(password, confirmPassword))
    }

    function handleUpdateConfirmPassword(password: string): void {
        setConfirmPassword(password)
        setMatchError(!passwordsMatch(newPassword, password))
    }

    function passwordFailed(): boolean {
        return results.filter(result => !result.met).length > 0
    }

    function handleSetPassword(passwordInfo: NewPassword): void {
        setPasswordQuery.mutate(passwordInfo, {
            onSuccess: () => {
                router.push('/')
                // authenticate({email: data?.data.email, password: passwordInfo.password})
                //     .then(() => queryClient
                //         .invalidateQueries(['user-by-token-id'])
                //         .then(() => router.push(`/`))
                //     )
            }
        })
    }


    if (isLoading) {
        return <Centered><Typography>Looking for Booboo&apos;s friends...</Typography></Centered>
    }
    if (error) {
        return <Centered><Typography>Invalid password reset token!</Typography></Centered>
    }
    if (setPasswordQuery.isError) {
        return <Centered><Typography>{(setPasswordQuery.error as AxiosError).message}</Typography></Centered>
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
                    onPasswordChange={handleUpdatePassword}
                    password={newPassword}
                    error={false}
                />
                <Typography style={{paddingLeft: 10, marginTop: -30}}>
                    Your password must:
                </Typography>
                <List style={{marginBottom: 25}}>
                    {results.map(result => (
                        <ListItem key={result.description} style={{padding: 0, paddingLeft: 25}}>
                            {result.met ?
                                <CheckCircleIcon style={{color: 'green', fontSize: 18, marginRight: 10}}/> :
                                <span style={{marginRight: 28}}/>
                            }
                            {result.description}
                        </ListItem>
                    ))}
                </List>
                <UnmanagedPassword
                    id="confirm-password"
                    label="Confirm Password"
                    onTogglePassword={onToggleShowPassword}
                    passwordToggleState={passwordVisibility}
                    onPasswordChange={handleUpdateConfirmPassword}
                    password={confirmPassword}
                    error={matchError}
                />
                <FormControl style={{padding: 10}}>
                    <Button
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            width: 200,
                            alignSelf: 'center',
                        }}
                        disabled={matchError || passwordFailed() || confirmPassword.length === 0}
                        onClick={() => handleSetPassword({password: confirmPassword, resetToken: token})}
                    >
                        Set Password
                    </Button>
                </FormControl>
            </FormGroup>
        </Centered>
    )
}