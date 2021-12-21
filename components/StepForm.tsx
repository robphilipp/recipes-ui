import React, {useRef, useState} from 'react'
import {IconButton, ListItem, TextField} from "@mui/material";
import {copyStep, emptyStep, isEmptyStep, Step} from "./Recipe";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CancelIcon from '@mui/icons-material/Cancel';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import {DisplayMode} from "./FormMode";

function noop() {
}

export enum StepMode {VIEW, EDIT}

type Props = {
    step: Step
    initialMode?: DisplayMode
    onSubmit?: (step: Step, andAgain: boolean) => void
    onCancel?: () => void
    onDelete?: (id: string) => void
}

export function StepForm(props: Props): JSX.Element {
    const {
        initialMode = DisplayMode.VIEW,
        onSubmit = noop,
        onCancel = noop,
        onDelete = noop
    } = props

    const [step, setStep] = useState<Step>(() => copyStep(props.step))
    const newItemRef = useRef<boolean>(isEmptyStep(props.step))

    const [mode, setMode] = useState<DisplayMode>(initialMode)

    function canSubmit(): boolean {
        return step.text !== undefined && step.text !== null && step.text !== ''
    }

    function handleSubmit(andAgain: boolean): void {
        if (andAgain) {
            onSubmit(step, andAgain)
            setStep(emptyStep())
        } else {
            setMode(DisplayMode.VIEW)
            onSubmit(step, andAgain)
        }
    }

    function handleCancel(): void {
        setMode(DisplayMode.VIEW)
        setStep(props.step)
        onCancel()
    }

    function renderEditDelete(step: Step): JSX.Element {
        return (
            <>
                <IconButton
                    onClick={() => setMode(DisplayMode.EDIT)}
                    color='primary'
                    size='small'
                >
                    <ModeEditIcon sx={{width: 18, height: 18}}/>
                </IconButton>
                <IconButton
                    onClick={() => onDelete(step.id)}
                    color='primary'
                    size='small'
                >
                    <DeleteIcon sx={{width: 18, height: 18}}/>
                </IconButton>
            </>
        )
    }

    if (mode === DisplayMode.VIEW) {
        return (
            <ListItem
                key={`${props.step.id}-li`}
                secondaryAction={renderEditDelete(step)}
                sx={{
                    width: '100%',
                    maxWidth: {
                        xs: 500,
                        sm: 550,
                        md: 600,
                    }
                }}
            >
                {step.text}
            </ListItem>
        )
    }

    return (
        <>
            <TextField
                id="recipe-step-title"
                label="Title"
                size='small'
                value={step.title}
                sx={{"& .MuiOutlinedInput-root": {minWidth: 200, maxWidth: 400}}}
                onChange={event => setStep(current => ({...current, title: event.target.value}))}
            />
            <TextField
                id="recipe-step-text"
                label="Instruction"
                multiline
                maxRows={10}
                size='small'
                value={step.text}
                sx={{"& .MuiOutlinedInput-root": {minWidth: 500, maxWidth: 800}}}
                onChange={event => setStep(current => ({...current, text: event.target.value}))}
            />
            <IconButton onClick={() => handleSubmit(false)} color='primary' disabled={!canSubmit()}>
                <SaveIcon/>
            </IconButton>
            <IconButton onClick={handleCancel} color='secondary'>
                <CancelIcon/>
            </IconButton>
            {newItemRef.current ?
                <IconButton onClick={() => handleSubmit(true)} color='primary' disabled={!canSubmit()}>
                    <AddCircleIcon/>
                </IconButton> :
                <span/>
            }
        </>
    )
}