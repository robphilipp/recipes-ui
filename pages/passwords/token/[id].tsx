import {useRouter} from "next/router";
import Centered from "../../../components/Centered";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {
    Button,
    FormControl,
    FormControlLabel,
    FormGroup, IconButton,
    Input, InputAdornment,
    InputLabel, OutlinedInput,
    TextField,
    Typography
} from "@mui/material";
import {emptyUser} from "../../../components/users/RecipesUser";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {useState} from "react";

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

    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

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
                <FormControl style={{margin: 10}}>
                    <InputLabel htmlFor="enter-password">Enter Password</InputLabel>
                    <OutlinedInput
                        id="enter-password"
                        aria-describedby="Enter Password"
                        type={showPassword ? 'text' : 'password'}
                        label="Enter Password"
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </FormControl>
                <FormControl style={{margin: 10}}>
                    <InputLabel htmlFor="confirm-password">Confirm Password</InputLabel>
                    <OutlinedInput
                        id="confirm-password"
                        aria-describedby="Confirm Password"
                        type={showPassword ? 'text' : 'password'}
                        label="Confirm Password"
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </FormControl>
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