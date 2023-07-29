import {FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, OutlinedInput} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {ChangeEvent, MouseEvent} from "react";

export enum PasswordToggleState {
    VISIBLE,
    HIDDEN
}

export function togglePasswordState(state: PasswordToggleState): PasswordToggleState {
    return state === PasswordToggleState.HIDDEN ? PasswordToggleState.VISIBLE : PasswordToggleState.HIDDEN
}

type Props = {
    id: string
    label?: string
    ariaDescribedBy?: string
    onTogglePassword: (state: PasswordToggleState) => void
    passwordToggleState: PasswordToggleState
    onPasswordChange: (password: string) => void
    password: string
    error: boolean
}

export default function UnmanagedPassword(props: Props): JSX.Element {
    const {
        id,
        label = "Enter Password",
        ariaDescribedBy = label,
        onTogglePassword,
        passwordToggleState,
        onPasswordChange,
        password,
        error
    } = props

    // const [showPassword, setShowPassword] = useState(props.passwordToggleState ?? PasswordToggleState.HIDDEN);

    function handleClickShowPassword() {
        onTogglePassword(passwordToggleState)
    }

    function handleMouseDownPassword(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
    }

    function handlePasswordChanged(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void {
        onPasswordChange(event.target.value)
    }

    const isPasswordVisible: boolean = passwordToggleState === PasswordToggleState.VISIBLE

    return (
        <FormControl style={{margin: 10}}>
            <InputLabel htmlFor="enter-password">{label}</InputLabel>
            <OutlinedInput
                id={id}
                aria-describedby={ariaDescribedBy}
                type={isPasswordVisible ? 'text' : 'password'}
                label={label}
                onChange={handlePasswordChanged}
                value={password}
                error={error}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                        >
                            {isPasswordVisible ? <Visibility/> : <VisibilityOff />}
                        </IconButton>
                    </InputAdornment>
                }
            />
            {error ? <FormHelperText>Passwords do not match</FormHelperText> : <FormHelperText>&nbsp;</FormHelperText>}
        </FormControl>
    )
}