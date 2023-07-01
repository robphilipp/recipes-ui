import {createTheme, ThemeOptions} from '@mui/material/styles';

export const lightTheme = createTheme({
    palette: {
        type: 'light',
        primary: {
            main: 'rgb(59,59,56)',
        },
        secondary: {
            main: '#f36215',
        },
        background: {
            default: '#fff',
            paper: 'rgb(247,247,247)',
        },
    },
} as ThemeOptions)
