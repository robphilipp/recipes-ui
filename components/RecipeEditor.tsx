import Head from "next/head";
import React, {ChangeEvent, useEffect, useState} from "react";
import {Box, Button, ButtonGroup, List, ListItem, TextField, Typography} from "@mui/material";
import {
    emptyIngredient,
    emptyRecipe,
    emptyStep,
    Ingredient,
    isValidRecipe,
    Recipe,
    RequiredTime,
    Step,
    Yield
} from "./Recipe";
import {IngredientForm} from "./IngredientForm";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {StepForm} from "./StepForm";
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import {useRouter} from "next/router";
import {RequiredTimeForm} from "./RequiredTimeForm";
import {DisplayMode} from "./FormMode";
import {TagsForm} from "./TagsForm";

/**
 * Represents the movement an item in the list (visually). Visually, the item list starts with the
 * first item at the top and the last item at the bottom. So moving an item "up" the list means moving
 * it towards the top of the list, and this means moving it from index `n` to index `n-1`. Moving an
 * item "down" the list means moving it towards the bottom, and this means moving it from an index `n`
 * to and index `n+1`.
 */
export enum Movement {
    // moves item up the list (visually) from step n+1 to step n
    UP,
    // moves item down the list (visually) from step n to step n+1
    DOWN
}

export type ItemPosition = {
    // first item has a number 1 (not zero based)
    itemNumber: number
    numItems: number
    isFirst: boolean
    isLast: boolean
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

enum EditMode {ADD, UPDATE }

type Props = {
    /**
     * Optional recipe. When the recipe is not specified (i.e. undefined), then signal to the
     * editor that it should be in "add" mode. Otherwise, editor is in "update" mode.
     */
    recipe?: Recipe
    /**
     * Callback function when the recipe is submitted
     * @param recipe The updated or new recipe
     */
    onSubmit: (recipe: Recipe) => void
}

/**
 * Recipe editor for modifying existing recipes or adding new ones. When the recipe is undefined,
 * then editor is in "add" mode. When the recipe is specified, then editor is in "update" mode.
 *
 * The recipe editor manages the state of the basic elements: recipe name, story, yield, and, notes.
 * For the more complex parts of the recipe, it relies on {@link TagsForm}, {@link RequiredTimeForm},
 * {@link IngredientForm}, and {@link StepForm}.
 * @param props The properties defining the editors behavior
 * @return The recipe editor component
 * @constructor
 */
export function RecipeEditor(props: Props): JSX.Element {
    const {onSubmit} = props

    const router = useRouter()

    const editMode = props.recipe ? EditMode.UPDATE : EditMode.ADD

    const [recipe, setRecipe] = useState<Recipe>(() => props.recipe || emptyRecipe())
    // because yield has a value and unit, and because in the recipe the value is a number
    // and because numbers and text are hard to mix in an input field, we store the value
    // of yield.value as a string
    const [yieldValue, setYieldValue] = useState<string>(
        () => props.recipe ? `${props.recipe.yield.value}` : undefined
    )

    const [addingIngredient, setAddingIngredient] = useState<boolean>(false)
    const [addingStep, setAddingStep] = useState<boolean>(false)

    useEffect(
        () => {
            // todo this works well when the recipe is initially empty, however, when the
            //      recipes has been modified in this editor, and the recipe changes outside,
            //      then the local modifications will be lost.
            if (props.recipe !== undefined) {
                setRecipe(props.recipe)
                setYieldValue(`${props.recipe.yield.value}`)
            }
        },
        [props.recipe]
    )

    function handleNameChange(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void {
        setRecipe(rec => ({...rec, name: event.target.value}))
    }

    function handleAddTag(tag: string): void {
        if (recipe.tags.findIndex(t => t === tag) < 0) {
            setRecipe(current => ({...current, tags: [...current.tags, tag]}))
        }
    }

    function handleRemoveTag(tag: string): void {
        setRecipe(current => ({...current, tags: current.tags.filter(t => t !== tag)}))
    }

    function handleUpdateRequiredTime(requiredTime: RequiredTime): void {
        setRecipe(current => ({
            ...current,
            requiredTime: {...requiredTime}
        }))
    }

    function handleAddingIngredient(): void {
        setAddingIngredient(true)
    }

    function handleSubmittedNewIngredient(ingredient: Ingredient, andAgain: boolean): void {
        console.log("ingredient", ingredient)
        setRecipe(current => ({...current, ingredients: [...current.ingredients, ingredient]}))
        setAddingIngredient(andAgain)
    }

    function handleUpdatedIngredient(ingredient: Ingredient): void {
        const index = recipe.ingredients.findIndex(item => item.id === ingredient.id)
        if (index >= 0) {
            setRecipe(current => {
                const updated = current.ingredients.slice()
                updated[index] = ingredient
                return {...current, ingredients: updated}
            })
        }
    }

    function handleDeleteIngredient(id: string): void {
        setRecipe(current => ({...current, ingredients: current.ingredients.filter(ing => ing.id !== id)}))
    }

    function handleCancelIngredient(): void {
        setAddingIngredient(false)
    }

    function handleMoveIngredient(ingredient: Ingredient, ingredientNumber: number, direction: Movement): void {
        const index = ingredientNumber - 1
        if (index >= 0 && index < recipe.ingredients.length) {
            setRecipe(current => ({
                ...current,
                ingredients: swapItem(current.ingredients, index, direction)
            }))
        }
    }

    function handleAddingStep(): void {
        setAddingStep(true)
    }

    function handleSubmittedNewStep(step: Step, andAgain: boolean): void {
        console.log("step", step)
        setRecipe(current => ({...current, steps: [...current.steps, step]}))
        setAddingStep(andAgain)
    }

    function handleUpdatedStep(step: Step): void {
        const index = recipe.steps.findIndex(item => item.id === step.id)
        if (index >= 0) {
            setRecipe(current => {
                const updated = current.steps.slice()
                updated[index] = step
                return {...current, steps: updated}
            })
        }
    }

    function handleDeleteStep(id: string): void {
        setRecipe(current => ({...current, steps: current.steps.filter(ing => ing.id !== id)}))
    }

    function handleCancelStep(): void {
        setAddingStep(false)
    }

    function handleMoveStep(step: Step, stepNumber: number, direction: Movement): void {
        const index = stepNumber - 1
        if (index >= 0 && index < recipe.steps.length) {
            setRecipe(current => ({...current, steps: swapItem(current.steps, index, direction)}))
        }
    }

    function swapItem<T>(items: Array<T>, index: number, direction: Movement): Array<T> {
        const updated = items.slice()
        const otherIndex = direction === Movement.UP ? index - 1 : index + 1
        const item = updated[index]
        updated[index] = updated[otherIndex]
        updated[otherIndex] = item
        return updated
    }

    function handleSubmitRecipe(): void {
        onSubmit(recipe)
    }

    return (
        <>
            <Head><title>New Recipe</title></Head>
            <Box
                component="form"
                sx={{'& .MuiTextField-root': {mt: 1.2, mr: 0.5}}}
                noValidate
                autoComplete="off"
            >
                <div>
                    <TextField
                        id="recipe-name"
                        label="Recipe Name"
                        size='small'
                        autoFocus={true}
                        value={recipe.name}
                        onChange={handleNameChange}
                    />
                </div>
                <div>
                    <TagsForm
                        tags={recipe.tags}
                        displayMode={DisplayMode.EDIT}
                        onAdd={handleAddTag}
                        onRemove={handleRemoveTag}
                    />
                </div>
                <div>
                    <TextField
                        id="recipe-story"
                        label="Story"
                        multiline
                        maxRows={20}
                        size='small'
                        value={recipe.story}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                minWidth: {
                                    xs: 450,
                                    sm: 380,
                                    md: 600,
                                },
                                maxWidth: 800
                            }
                        }}
                        onChange={event => setRecipe(current => ({...current, story: event.target.value}))}
                    />
                </div>
                <div>
                    <TextField
                        id="recipe-author"
                        label="Author"
                        size="small"
                        value={recipe.author || ''}
                        onChange={event => setRecipe(current => ({...current, author: event.target.value}))}
                    />
                </div>
                <div>
                    <TextField
                        id="recipe-added-by"
                        label="Added By"
                        size="small"
                        value={recipe.addedBy || ''}
                        onChange={event => setRecipe(current => ({...current, addedBy: event.target.value}))}
                    />
                </div>
                <div>
                    <TextField
                        id="recipe-yield-amount"
                        label="Yield"
                        size='small'
                        type='number'
                        value={recipe.yield.value}
                        onChange={event => setRecipe(current => ({...current, yield: {...current.yield, value: parseFloat(event.target.value)}}))}
                        sx={{'& .MuiTextField-root': {m: 1.1, width: '5ch'}}}
                    />
                    <TextField
                        id="recipe-yield-unit"
                        label="Yield"
                        size='small'
                        value={recipe.yield.unit}
                        onChange={event => setRecipe(current => ({...current, yield: {...current.yield, unit: event.target.value}}))}
                        sx={{'& .MuiTextField-root': {m: 1.1, width: '5ch'}}}
                    />
                </div>
                <div>
                    <RequiredTimeForm
                        requiredTime={recipe.requiredTime}
                        onSubmit={handleUpdateRequiredTime}
                    />
                </div>

                <Typography sx={{fontSize: `1.25em`, marginTop: 2}}>Ingredients</Typography>
                <List sx={{width: '100%', maxWidth: 900, bgcolor: 'background.paper'}}>
                    {recipe.ingredients.map((ingredient, index) => (
                        <ListItem key={ingredient.name} disablePadding>
                            <IngredientForm
                                position={itemPosition(index + 1, recipe.ingredients.length)}
                                ingredient={ingredient}
                                onSubmit={handleUpdatedIngredient}
                                onCancel={handleCancelIngredient}
                                onDelete={handleDeleteIngredient}
                                onMove={handleMoveIngredient}
                            />
                        </ListItem>))}
                </List>
                {addingIngredient ?
                    <IngredientForm
                        ingredient={emptyIngredient()}
                        initialMode={DisplayMode.EDIT}
                        onSubmit={handleSubmittedNewIngredient}
                        onCancel={handleCancelIngredient}
                    /> :
                    <span/>}
                {!addingIngredient ?
                    <Button
                        onClick={handleAddingIngredient}
                        disabled={addingIngredient}
                        startIcon={<AddCircleIcon/>}
                        variant='outlined'
                        size='small'
                        sx={{textTransform: 'none'}}
                    >
                        Add Ingredient
                    </Button> :
                    <span/>
                }

                <Typography sx={{fontSize: `1.25em`, marginTop: 2}}>Steps</Typography>
                <List sx={{width: '100%', maxWidth: 900, bgcolor: 'background.paper'}}>
                    {recipe.steps.map((step, index) => (
                        <ListItem key={step.text} disablePadding>
                            <StepForm
                                position={itemPosition(index + 1, recipe.steps.length)}
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

                <Typography sx={{fontSize: `1.25em`, marginTop: 2}}>Notes</Typography>
                <TextField
                    id="recipe-notes"
                    label="Notes"
                    multiline
                    maxRows={20}
                    size='small'
                    value={recipe.notes}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            minWidth: {
                                xs: 450,
                                sm: 380,
                                md: 600,
                            },
                            maxWidth: 800
                        }
                    }}
                    onChange={event => setRecipe(current => ({...current, notes: event.target.value}))}
                />
                <div>
                    <ButtonGroup sx={{marginTop: 5}}>
                        <Button
                            startIcon={<SaveIcon/>}
                            sx={{textTransform: 'none'}}
                            disabled={!isValidRecipe(recipe)}
                            onClick={handleSubmitRecipe}
                        >
                            Save
                        </Button>
                        {editMode === EditMode.ADD ?
                            <Button
                                startIcon={<AddCircleIcon/>}
                                sx={{textTransform: 'none'}}
                                disabled={!isValidRecipe(recipe)}
                            >
                                Save And Add
                            </Button> :
                            <span/>
                        }
                        <Button
                            startIcon={<CancelIcon/>}
                            sx={{textTransform: 'none'}}
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                    </ButtonGroup>
                </div>
            </Box>
        </>
    )
}

