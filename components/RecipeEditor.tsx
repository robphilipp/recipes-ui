import Layout from "./Layout";
import Head from "next/head";
import utilStyles from "../styles/utils.module.css";
import React, {ChangeEvent, useEffect, useState} from "react";
import {Box, Button, ButtonGroup, List, ListItem, TextField} from "@mui/material";
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
import {IngredientForm, IngredientMode} from "./IngredientForm";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {StepForm, StepMode} from "./StepForm";
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from "axios";
import {useRouter} from "next/router";
import {RequiredTimeForm} from "./RequiredTimeForm";
import {DisplayMode} from "./FormMode";
import {TagsForm} from "./TagsForm";

const YIELD_REGEX: RegExp = /^([0-9]+[.]?[0-9]*)([a-zA-Z \t]*)$/
const YIELD_UNIT_REGEX: RegExp = /([a-zA-Z \t]*)$/

enum EditMode {ADD, UPDATE }

type Props = {
    recipe?: Recipe
    onSubmit: (recipe: Recipe) => void
}

export function RecipeEditor(props: Props): JSX.Element {
    const router = useRouter()

    const editMode = props.recipe ? EditMode.UPDATE : EditMode.ADD

    const [recipe, setRecipe] = useState<Recipe>(() => props.recipe || emptyRecipe())
    // because yield has a value and unit, and because in the recipe the value is a number
    // and because numbers and text are hard to mix in an input field, we store the value
    // of yield.value as a string
    const [yieldValue, setYieldValue] = useState<string>()

    const [addingIngredient, setAddingIngredient] = useState<boolean>(false)
    const [addingStep, setAddingStep] = useState<boolean>(false)
    const [editing, setEditing] = useState<boolean>(false)

    useEffect(
        () => {
            setRecipe(props.recipe)
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

    function handleYieldValueChange(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void {
        const fullMatch = event.target.value.match(YIELD_REGEX)
        if (fullMatch) {
            fullMatch.shift()
            const value = fullMatch.shift()
            const unit = fullMatch.shift() || ''
            setYieldValue(value)
            // update the recipe
            const recipeYield: Yield = {value: parseFloat(value), unit}
            setRecipe(rec => ({...rec, yield: recipeYield}))
            return
        }

        const unitMatch = event.target.value.match(YIELD_UNIT_REGEX)
        if (unitMatch) {
            unitMatch.shift()
            const unit = unitMatch.shift() || ''
            setYieldValue('')
            // update the recipe
            const recipeYield: Yield = {value: NaN, unit}
            setRecipe(rec => ({...rec, yield: recipeYield}))
            return
        }
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

    function handleSubmitRecipe(): void {
        if (editMode === EditMode.ADD) {
            axios.put('/api/recipes/new', recipe)
                .then(response => router.push(`/recipes/${response.data._id.toString()}`))
        } else {
            axios.post(`/api/recipes/${recipe._id.toString()}`, recipe)
                .then(response => router.push(`/recipes/${response.data._id.toString()}`))
        }
    }

    return (
        <Layout>
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
                        sx={{"& .MuiOutlinedInput-root": {minWidth: 500, maxWidth: 800}}}
                        onChange={event => setRecipe(current => ({...current, story: event.target.value}))}
                    />
                </div>
                <div>
                    <TextField
                        id="recipe-yield-amount"
                        label="Yield"
                        size='small'
                        value={yieldValue ? `${yieldValue}${recipe.yield.unit}` : recipe.yield.unit}
                        onChange={handleYieldValueChange}
                        sx={{'& .MuiTextField-root': {m: 1.1, width: '5ch'}}}
                    />
                </div>
                <div>
                    <RequiredTimeForm
                        requiredTime={recipe.requiredTime}
                        initialMode={editMode === EditMode.ADD ? DisplayMode.EDIT : DisplayMode.VIEW}
                        onSubmit={handleUpdateRequiredTime}
                    />
                </div>

                <h2 className={utilStyles.recipeIngredientsHeader}>Ingredients</h2>
                <List sx={{width: '100%', maxWidth: 900, bgcolor: 'background.paper'}}>
                    {recipe.ingredients.map(ingredient => (
                        <ListItem key={ingredient.name} disablePadding>
                            <IngredientForm
                                ingredient={ingredient}
                                onSubmit={handleUpdatedIngredient}
                                onCancel={handleCancelIngredient}
                                onDelete={handleDeleteIngredient}
                            />
                        </ListItem>))}
                </List>
                {addingIngredient ?
                    <IngredientForm
                        ingredient={emptyIngredient()}
                        initialMode={IngredientMode.EDIT}
                        onSubmit={handleSubmittedNewIngredient}
                        onCancel={handleCancelIngredient}
                    /> :
                    <span/>}
                {!addingIngredient && !editing ?
                    <Button
                        onClick={handleAddingIngredient}
                        disabled={addingIngredient || editing}
                        startIcon={<AddCircleIcon/>}
                        variant='outlined'
                        size='small'
                        sx={{textTransform: 'none'}}
                    >
                        Add Ingredient
                    </Button> :
                    <span/>
                }

                <h2 className={utilStyles.headingMd}>Steps</h2>
                <List sx={{width: '100%', maxWidth: 900, bgcolor: 'background.paper'}}>
                    {recipe.steps.map(step => (
                        <ListItem key={step.text} disablePadding>
                            <StepForm
                                step={step}
                                onSubmit={handleUpdatedStep}
                                onCancel={handleCancelStep}
                                onDelete={handleDeleteStep}
                            />
                        </ListItem>))}
                </List>
                {addingStep ?
                    <StepForm
                        step={emptyStep()}
                        initialMode={StepMode.EDIT}
                        onSubmit={handleSubmittedNewStep}
                        onCancel={handleCancelStep}
                    /> :
                    <span/>}
                {!addingStep && !editing ?
                    <Button
                        onClick={handleAddingStep}
                        disabled={addingStep || editing}
                        startIcon={<AddCircleIcon/>}
                        variant='outlined'
                        size='small'
                        sx={{textTransform: 'none'}}
                    >
                        Add Step
                    </Button> :
                    <span/>
                }

                <h2 className={utilStyles.headingMd}>Notes</h2>
                <TextField
                    id="recipe-notes"
                    label="Notes"
                    multiline
                    maxRows={20}
                    size='small'
                    value={recipe.notes}
                    sx={{"& .MuiOutlinedInput-root": {minWidth: 500, maxWidth: 800}}}
                    onChange={event => setRecipe(current => ({...current, notes: event.target.value}))}
                />
                <ButtonGroup sx={{marginTop: 5}}>
                    <Button
                        startIcon={<SaveIcon/>}
                        sx={{textTransform: 'none'}}
                        disabled={!isValidRecipe(recipe)}
                        onClick={handleSubmitRecipe}
                    >
                        Save
                    </Button>
                    <Button
                        startIcon={<AddCircleIcon/>}
                        sx={{textTransform: 'none'}}
                        disabled={!isValidRecipe(recipe)}
                    >
                        Save And Add
                    </Button>
                    <Button
                        startIcon={<CancelIcon/>}
                        sx={{textTransform: 'none'}}
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                </ButtonGroup>
            </Box>
        </Layout>
    )
}

