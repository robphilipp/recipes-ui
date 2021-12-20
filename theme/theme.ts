import {createTheme, ThemeOptions} from '@mui/material/styles';

export const lightTheme = createTheme({
    palette: {
        type: 'light',
        primary: {
            main: '#f55404',
        },
        secondary: {
            main: '#f50057',
        },
        background: {
            default: '#fff',
            paper: '#fff',
        },
    },
} as ThemeOptions)