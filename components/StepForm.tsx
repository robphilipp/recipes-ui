import React, {useRef, useState} from 'react'
import {IconButton, TextField} from "@mui/material";
import {copyStep, emptyStep, isEmptyStep, Step} from "./Recipe";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CancelIcon from '@mui/icons-material/Cancel';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';

function noop() {
}

export enum StepMode {VIEW, EDIT}

type Props = {
    step: Step
    initialMode?: StepMode
    onSubmit?: (step: Step, andAgain: boolean) => void
    onCancel?: () => void
    onDelete?: (id: string) => void
}

export function StepForm(props: Props): JSX.Element {
    const {
        initialMode = StepMode.VIEW,
        onSubmit = noop,
        onCancel = noop,
        onDelete = noop
    } = props

    const [step, setStep] = useState<Step>(() => copyStep(props.step))
    const newItemRef = useRef<boolean>(isEmptyStep(props.step))

    const [mode, setMode] = useState<StepMode>(initialMode)

    function canSubmit(): boolean {
        return step.text !== undefined && step.text !== null && step.text !== ''
    }

    function handleSubmit(andAgain: boolean): void {
        if (andAgain) {
            onSubmit(step, andAgain)
            setStep(emptyStep())
        } else {
            setMode(StepMode.VIEW)
            onSubmit(step, andAgain)
        }
    }

    function handleCancel(): void {
        setMode(StepMode.VIEW)
        setStep(props.step)
        onCancel()
    }

    if (mode === StepMode.VIEW) {
        return (
            <>
                <IconButton
                    onClick={() => setMode(StepMode.EDIT)}
                    color='primary'
                    size='small'
                >
                    <ModeEditIcon sx={{width: 18, height: 18}}/>
                </IconButton>
                <IconButton
                    onClick={() => onDelete(step._id)}
                    color='primary'
                    size='small'
                >
                    <DeleteIcon sx={{width: 18, height: 18}}/>
                </IconButton>
                {step.text}
            </>
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
                <CheckBoxIcon/>
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