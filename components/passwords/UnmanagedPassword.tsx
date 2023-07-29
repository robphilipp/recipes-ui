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

/**
 * Password input text field that allows the parent component to manage the password
 * state. Requires a callback to handle the user showing/hiding the password, and
 * a callback to handle when the user updates the password. The password and the
 * show/hide password state must be passed from the parent. And, any error conditions
 * must be passed from the parent
 * @param props The props
 * @constructor
 */
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

    /**
     * Toggles the show/hide state of the password
     */
    function handleClickShowPassword() {
        onTogglePassword(passwordToggleState)
    }

    /**
     * Prevents default event from bubbling up when the mouse is clicked on the
     * show/hide button
     * @param event The mouse event
     */
    function handleMouseDownPassword(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
    }

    /**
     * Handles updates to the password (as the user types), calling the provided
     * callback so that the parent can manage the state
     * @param event The change event
     */
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