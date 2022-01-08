import {createTheme, ThemeOptions} from '@mui/material/styles';

export const lightTheme = createTheme({
    palette: {
        type: 'light',
        primary: {
            main: '#081f3a',
        },
        secondary: {
            main: '#f36215',
        },
        background: {
            default: '#fff',
            paper: '#fff',
        },
    },
} as ThemeOptions)