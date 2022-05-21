import {copyStep, emptyStep, Step} from "./Recipe";
import {Button, List, ListItem} from "@mui/material";
import {StepForm} from "./StepForm";
import {DisplayMode} from "./FormMode";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import React, {useState} from "react";
import {ItemPosition, Movement} from "./RecipeEditor";

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

    function handleAddingStep(): void {
        setAddingStep(true)
    }

    function handleSubmittedNewStep(step: Step, andAgain: boolean): void {
        onUpdateSteps([...steps, step])
        // setRecipe(current => ({...current, steps: [...current.steps, step]}))
        setAddingStep(andAgain)
    }

    function handleUpdatedStep(step: Step): void {
        const index = steps.findIndex(item => item.id === step.id)
        if (index >= 0) {
            const updated = steps.map(step => copyStep(step))
            updated[index] = step
            onUpdateSteps(updated)
            // setRecipe(current => {
            //     const updated = current.steps.slice()
            //     updated[index] = step
            //     return {...current, steps: updated}
            // })
        }
    }

    function handleDeleteStep(id: string): void {
        onUpdateSteps(steps.filter(ing => ing.id !== id))
        // setRecipe(current => ({...current, steps: current.steps.filter(ing => ing.id !== id)}))
    }

    function handleCancelStep(): void {
        setAddingStep(false)
    }

    function handleMoveStep(step: Step, stepNumber: number, direction: Movement): void {
        const index = stepNumber - 1
        if (index >= 0 && index < steps.length) {
            onUpdateSteps(swapItem(steps, index, direction))
            // setRecipe(current => ({...current, steps: swapItem(current.steps, index, direction)}))
        }
    }

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
                    key={`new-step-${steps.length+1}`}
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
