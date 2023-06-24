import React, {useState} from 'react'
import {IconButton, TextField} from "@mui/material";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CancelIcon from '@mui/icons-material/Cancel';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import {JSX} from "react";

function noop() {
}

export enum NotesMode {VIEW, EDIT}

type Props = {
    notes: string
    initialMode?: NotesMode
    onSubmit?: (notes: string) => void
    onCancel?: () => void
}

export function NotesForm(props: Props): JSX.Element {
    const {
        initialMode = NotesMode.VIEW,
        onSubmit = noop,
        onCancel = noop,
    } = props

    const [notes, setNotes] = useState<string>(props.notes)
    // const newItemRef = useRef<boolean>(isEmptyStep(props.notes))

    const [mode, setMode] = useState<NotesMode>(initialMode)

    function canSubmit(): boolean {
        return notes !== undefined && notes !== null && notes !== ''
    }

    function handleSubmit(andAgain: boolean): void {
        if (andAgain) {
            onSubmit(notes)
            setNotes('')
        } else {
            setMode(NotesMode.VIEW)
            onSubmit(notes)
        }
    }

    function handleCancel(): void {
        setMode(NotesMode.VIEW)
        setNotes(props.notes)
        onCancel()
    }

    if (mode === NotesMode.VIEW) {
        return (
            <>
                <IconButton
                    onClick={() => setMode(NotesMode.EDIT)}
                    color='secondary'
                    size='small'
                >
                    <ModeEditIcon/>
                </IconButton>
                {notes}
            </>
        )
    }

    return (
        <>
            <TextField
                id="recipe-step-text"
                label="Instruction"
                multiline
                maxRows={10}
                size='small'
                value={notes}
                sx={{"& .MuiOutlinedInput-root": {minWidth: 500, maxWidth: 800}}}
                onChange={event => setNotes(event.target.value)}
            />
            <IconButton
                onClick={() => handleSubmit(false)}
                color='primary'
                disabled={!canSubmit()}
            >
                <CheckBoxIcon/>
            </IconButton>
            <IconButton onClick={handleCancel} color='secondary'>
                <CancelIcon/>
            </IconButton>
        </>
    )
}