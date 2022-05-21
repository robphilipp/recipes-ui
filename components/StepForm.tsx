import React, {useRef, useState} from 'react'
import {
    Avatar,
    Box,
    Grid,
    IconButton,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    TextField
} from "@mui/material";
import {copyStep, emptyStep, isEmptyStep, Step} from "./Recipe";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CancelIcon from '@mui/icons-material/Cancel';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import MoveDownIcon from '@mui/icons-material/MoveDown';
import MoveUpIcon from '@mui/icons-material/MoveUp';
import {DisplayMode} from "./FormMode";
import {ItemPosition, Movement} from "./RecipeEditor";

function noop() {
}

type Props = {
    position?: ItemPosition
    step: Step
    initialMode?: DisplayMode
    onSubmit?: (step: Step, andAgain: boolean) => void
    onCancel?: () => void
    onDelete?: (id: string) => void
    onMove?: (step: Step, stepNumber: number, direction: Movement) => void
}

export function StepForm(props: Props): JSX.Element {
    const {
        position,
        initialMode = DisplayMode.VIEW,
        onSubmit = noop,
        onCancel = noop,
        onDelete = noop,
        onMove = noop,
    } = props

    const [step, setStep] = useState<Step>(() => copyStep(props.step))
    const isNewItemRef = useRef<boolean>(isEmptyStep(props.step))

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

    function handleKeyPress(event: React.KeyboardEvent<HTMLDivElement>): void {
        switch (event.key) {
            case 'Enter':
                if (canSubmit()) {
                    handleSubmit(event.ctrlKey && isNewItemRef.current)
                }
                break
            case 'Escape':
                handleCancel()
                break
        }
    }

    function renderControls(step: Step): JSX.Element {
        return (
            <>
                {position ? <IconButton
                    onClick={() => onMove(step, position.itemNumber, Movement.UP)}
                    color='primary'
                    size='small'
                    disabled={position.isFirst}
                >
                    <MoveUpIcon sx={{width: 18, height: 18}}/>
                </IconButton> : <span/>}
                {position ? <IconButton
                    onClick={() => onMove(step, position.itemNumber, Movement.DOWN)}
                    color='primary'
                    size='small'
                    disabled={position.isLast}
                >
                    <MoveDownIcon sx={{width: 18, height: 18}}/>
                </IconButton> : <span/>}
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
                secondaryAction={renderControls(step)}
                sx={{
                    maxWidth: {
                        xs: 500,
                        sm: 550,
                        md: 800,
                    }
                }}
            >
                {position ?
                    <ListItemAvatar>
                        <Avatar sx={{fontSize: 12, fontWeight: 700}}>
                            {position.itemNumber}/{position.numItems}
                        </Avatar>
                    </ListItemAvatar> :
                    <span/>
                }
                <ListItemText
                    sx={{
                        maxWidth: {
                            //
                            xs: 250,
                            // 600 px
                            sm: 175,
                            // 900 px
                            md: 375,
                            // 1200 px
                            lg: 575
                        }
                    }}
                >
                    {step.title !== null ?
                        <div style={{
                            fontWeight: 600,
                            fontSize: '1.1em'
                        }}>
                            {step.title.toUpperCase()}
                        </div> :
                        <span/>
                    }
                    <div>{step.text}</div>
                </ListItemText>
                {/*<ListItemButton>*/}
                {/*    {renderControls(step)}*/}
                {/*</ListItemButton>*/}
            </ListItem>
        )
    }

    return (
        <Box onKeyDown={handleKeyPress}>
            <Grid container sx={{
                maxWidth: {xs: 500, sm: 500, md: 800}
            }}>
                <Grid item xs={4} md={3}>
                    <TextField
                        id="recipe-step-title"
                        label="Title"
                        size='small'
                        autoFocus={true}
                        value={step.title}
                        onChange={event => setStep(current => ({...current, title: event.target.value}))}
                    />
                </Grid>
                <Grid item xs={8} md={6}>
                    <TextField
                        id="recipe-step-text"
                        label="Instruction"
                        multiline
                        size='small'
                        autoFocus={true}
                        value={step.text}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                minWidth: {
                                    xs: 290,
                                    sm: 290,
                                    md: 300,
                                    lg: 400
                                },
                                maxWidth: 500
                            }
                        }}
                        onChange={event => setStep(current => ({...current, text: event.target.value}))}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <IconButton
                        onClick={() => handleSubmit(false)}
                        color='primary'
                        disabled={!canSubmit()}
                    >
                        <SaveIcon sx={{width: 18, height: 18}}/>
                    </IconButton>
                    <IconButton
                        onClick={handleCancel}
                        color='secondary'
                    >
                        <CancelIcon sx={{width: 18, height: 18}}/>
                    </IconButton>
                    {isNewItemRef.current ?
                        <IconButton
                            onClick={() => handleSubmit(true)}
                            color='primary'
                            disabled={!canSubmit()}
                        >
                            <AddCircleIcon sx={{width: 18, height: 18}}/>
                        </IconButton> :
                        <span/>
                    }
                </Grid>
            </Grid>
        </Box>
    )
}