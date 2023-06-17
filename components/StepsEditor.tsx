import {copyStep, emptyStep, Step} from "./Recipe";
import {Button, List, ListItem, RadioGroup} from "@mui/material";
import {StepForm} from "./StepForm";
import {DisplayMode} from "./FormMode";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import React, {useState, JSX} from "react";
import {ItemPosition, Movement} from "./RecipeEditor";
import {EditorMode, EditorModelLabel, EditorModeRadio} from "./EditorMode";
import {FreeFormStepsEditor} from "./FreeFormStepsEditor";

type Props = {
    /**
     * The current steps in the recipe
     */
    steps: Array<Step>
    /**
     * The callback function to update the list of steps.
     * @param steps The updated list of steps
     */
    onUpdateSteps: (steps: Array<Step>) => void
}

export function StepsEditor(props: Props): JSX.Element {
    const {steps, onUpdateSteps} = props

    const [addingStep, setAddingStep] = useState<boolean>(false)
    const [editorMode, setEditorMode] = useState<EditorMode>(EditorMode.FORM_BASED)

    function handleAddingStep(): void {
        setAddingStep(true)
    }

    function handleSubmittedNewStep(step: Step, andAgain: boolean): void {
        onUpdateSteps([...steps, step])
        setAddingStep(andAgain)
    }

    function handleUpdatedStep(step: Step): void {
        const index = steps.findIndex(item => item.id === step.id)
        if (index >= 0) {
            const updated = steps.map(step => copyStep(step))
            updated[index] = step
            onUpdateSteps(updated)
        }
    }

    function handleDeleteStep(id: string): void {
        onUpdateSteps(steps.filter(ing => ing.id !== id))
    }

    function handleCancelStep(): void {
        setEditorMode(EditorMode.FORM_BASED)
        setAddingStep(false)
    }

    function handleMoveStep(step: Step, stepNumber: number, direction: Movement): void {
        const index = stepNumber - 1
        if (index >= 0 && index < steps.length) {
            onUpdateSteps(swapItem(steps, index, direction))
        }
    }

    function handleApplyParsedSteps(parsed: Array<Step>): void {
        onUpdateSteps(parsed)
        setEditorMode(EditorMode.FORM_BASED)
    }

    function handleParsedStepsChanged(parsed: Array<Step>): void {
        onUpdateSteps(parsed)
    }

    function FormBasedEditor(): JSX.Element {
        return (
            <>
                <List sx={{width: '100%', maxWidth: 900, bgcolor: 'background.paper'}}>
                    {steps.map((step, index) => (
                        <ListItem key={step.text} disablePadding>
                            <StepForm
                                position={itemPosition(index + 1, steps.length)}
                                step={step}
                                onSubmit={handleUpdatedStep}
                                onCancel={handleCancelStep}
                                onDelete={handleDeleteStep}
                                onMove={handleMoveStep}
                            />
                        </ListItem>))}
                </List>
                {addingStep ?
                    <StepForm
                        key={`new-step-${steps.length + 1}`}
                        step={emptyStep()}
                        initialMode={DisplayMode.EDIT}
                        onSubmit={handleSubmittedNewStep}
                        onCancel={handleCancelStep}
                        onMove={handleMoveStep}
                    /> :
                    <span/>}
                {!addingStep ?
                    <Button
                        onClick={handleAddingStep}
                        disabled={addingStep}
                        startIcon={<AddCircleIcon/>}
                        variant='outlined'
                        size='small'
                        sx={{textTransform: 'none'}}
                    >
                        Add Step
                    </Button> :
                    <span/>
                }
            </>
        )
    }

    return (
        <>
            {editorMode === EditorMode.FORM_BASED ?
                <RadioGroup
                    aria-labelledby="steps editor mode"
                    value={editorMode}
                    name="ingredients-editor-mode-radio-buttons"
                    row={true}
                >
                    <EditorModelLabel
                        label="Form-Based"
                        value={EditorMode.FORM_BASED}
                        control={<EditorModeRadio/>}
                        onChange={() => setEditorMode(EditorMode.FORM_BASED)}
                    />
                    <EditorModelLabel
                        label="Free-Form"
                        value={EditorMode.FREE_FORM}
                        control={<EditorModeRadio/>}
                        onChange={() => setEditorMode(EditorMode.FREE_FORM)}
                    />
                </RadioGroup> :
                <></>
            }
            {editorMode === EditorMode.FORM_BASED ?
                <FormBasedEditor/> :
                <FreeFormStepsEditor
                    initialSteps={stepsToText(steps)}
                    onApply={handleApplyParsedSteps}
                    onChange={handleParsedStepsChanged}
                    onCancel={handleCancelStep}
                />
            }
        </>
    )
}


function swapItem<T>(items: Array<T>, index: number, direction: Movement): Array<T> {
    const updated = items.slice()
    const otherIndex = direction === Movement.UP ? index - 1 : index + 1
    const item = updated[index]
    updated[index] = updated[otherIndex]
    updated[otherIndex] = item
    return updated
}

/**
 * Factory function for creating {@link ItemPosition} objects
 * @param itemNumber The number of the item in the list (first item is 1 rather than 0)
 * @param numItems The number of items in the list
 * @return An {@link ItemPosition}
 */
function itemPosition(itemNumber: number, numItems: number): ItemPosition {
    return {
        itemNumber,
        numItems,
        isFirst: itemNumber <= 1,
        isLast: itemNumber >= numItems
    }
}

function stepsToText(steps: Array<Step>): string {
    return steps
        .map((step, index) => step.title !== null ?
            `${step.title}\n${index+1}. ${step.text}` :
            `${index+1}. ${step.text}`
        )
        .join("\n")
}
