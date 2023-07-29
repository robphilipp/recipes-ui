import {FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {useState, MouseEvent, ChangeEvent} from "react";

type Props = {
    id: string
    label?: string
    ariaDescribedBy?: string
    onPasswordChange?: (password: string) => void
}

/**
 * Password input field that manages its own state.
 * @param props
 * @constructor
 */
export default function Password(props: Props): JSX.Element {
    const {
        id,
        label = "Enter Password",
        ariaDescribedBy = label,
        onPasswordChange = () => {}
    } = props

    const [showPassword, setShowPassword] = useState(false)

    function handleClickShowPassword() {
        setShowPassword(show => !show)
    }

    function handleMouseDownPassword(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
    }

    function handlePasswordChanged(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void {
        onPasswordChange(event.target.value)
    }
    return (
        <FormControl style={{margin: 10}}>
            <InputLabel htmlFor="enter-password">Enter Password</InputLabel>
            <OutlinedInput
                id={id}
                aria-describedby={ariaDescribedBy}
                type={showPassword ? 'text' : 'password'}
                label={label}
                onChange={handlePasswordChanged}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                        >
                            {showPassword ? <VisibilityOff/> : <Visibility/>}
                        </IconButton>
                    </InputAdornment>
                }
            />
        </FormControl>
    )
}