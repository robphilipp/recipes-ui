import {createTheme, ThemeOptions} from '@mui/material/styles';

export const lightTheme = createTheme({
    palette: {
        type: 'light',
        primary: {
            main: '#157df3',
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