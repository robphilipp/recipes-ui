import {styled} from "@mui/system";
import {FormControlLabel, Radio} from "@mui/material";

export enum EditorMode {
    FORM_BASED,
    FREE_FORM
}

export const EditorModelLabel = styled(FormControlLabel)(({theme}) => ({
    color: theme.palette.primary.color,
    '& .Mui-checked': {color: theme.palette.primary.color},
    '& .MuiFormControlLabel-label': {fontSize: '0.8em'}
})) as typeof FormControlLabel

export const EditorModeRadio = styled(Radio)(({theme}) => ({
    color: theme.palette.primary.color,
    '& .MuiSvgIcon-root': {fontSize: '1em'},
    '& .Mui-checked': {color: theme.palette.primary.color}
})) as typeof Radio