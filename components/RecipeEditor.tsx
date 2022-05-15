import Head from "next/head";
import React, {ChangeEvent, useEffect, useState} from "react";
import {Box, Button, ButtonGroup, TextField, Typography} from "@mui/material";
import {emptyRecipe, Ingredient, isValidRecipe, Recipe, RequiredTime, Step} from "./Recipe";
import {IngredientForm} from "./IngredientForm";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {StepForm} from "./StepForm";
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import {useRouter} from "next/router";
import {RequiredTimeForm} from "./RequiredTimeForm";
import {DisplayMode} from "./FormMode";
import {TagsForm} from "./TagsForm";
import {IngredientsEditor} from "./IngredientsEditor";
import {StepsEditor} from "./StepsEditor";

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

// /**
//  * Factory function for creating {@link ItemPosition} objects
//  * @param itemNumber The number of the item in the list (first item is 1 rather than 0)
//  * @param numItems The number of items in the list
//  * @return An {@link ItemPosition}
//  */
// function itemPosition(itemNumber: number, numItems: number): ItemPosition {
//     return {
//         itemNumber,
//         numItems,
//         isFirst: itemNumber <= 1,
//         isLast: itemNumber >= numItems
//     }
// }

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


    function onUpdateIngredients(ingredients: Array<Ingredient>): void {
        setRecipe(current => ({...current, ingredients}))
    }

    function onUpdateSteps(steps: Array<Step>): void {
        setRecipe(current => ({...current, steps}))
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
                <IngredientsEditor ingredients={recipe.ingredients} onUpdateIngredients={onUpdateIngredients}/>

                <Typography sx={{fontSize: `1.25em`, marginTop: 2}}>Steps</Typography>
                <StepsEditor steps={recipe.steps} onUpdateSteps={onUpdateSteps}/>

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

