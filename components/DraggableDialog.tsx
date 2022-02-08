import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Paper, { PaperProps } from '@mui/material/Paper';
import Draggable from 'react-draggable';

function PaperComponent(props: PaperProps) {
    return (
        <Draggable
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props} />
        </Draggable>
    );
}


type Props = {
    buttonText: string
    title: string
    children: Array<JSX.Element> | JSX.Element
}

export default function DraggableDialog(props: Props): JSX.Element {
    const {buttonText, title, children} = props

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Button
                onClick={handleClickOpen}
                variant='outlined'
                size='small'
                sx={{textTransform: 'none'}}
            >
                {buttonText}
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                PaperComponent={PaperComponent}
                aria-labelledby="draggable-dialog-title"
            >
                <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
                    {title}
                </DialogTitle>
                <DialogContent>
                    {children}
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleClose}>
                        Done
                    </Button>
                    {/*<Button onClick={handleClose}>Subscribe</Button>*/}
                </DialogActions>
            </Dialog>
        </div>
    );
}
