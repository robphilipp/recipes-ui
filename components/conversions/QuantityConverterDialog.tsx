import * as React from 'react';
import {useState} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper, {PaperProps} from '@mui/material/Paper';
import Draggable from 'react-draggable';
import {ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";

function PaperComponent(props: PaperProps) {
    return (
        <Draggable
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props}/>
        </Draggable>
    );
}


type Props = {
    buttonText: string
    title: string
    icon: JSX.Element
    children: Array<JSX.Element> | JSX.Element
}

export default function QuantityConverterDialog(props: Props): JSX.Element {
    const {buttonText, icon, title, children} = props

    const [open, setOpen] = useState(false)

    const handleClickOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    return (
        <>
            <ListItemButton onClick={handleClickOpen}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={buttonText}/>
            </ListItemButton>
            <Dialog
                open={open}
                onClose={handleClose}
                PaperComponent={PaperComponent}
                aria-labelledby="draggable-dialog-title"
            >
                <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    {children}
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleClose}>Done</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
