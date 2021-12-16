import Layout from "../../components/Layout";
import Head from "next/head";
import utilStyles from "../../styles/utils.module.css";
import React, {ChangeEvent, useState} from "react";
import {Box, IconButton, List, ListItem, ListItemButton, TextField} from "@mui/material";
import {emptyIngredient, emptyRecipe, emptyStep, Ingredient, Recipe, Step, Yield} from "../../components/Recipe";
import {IngredientForm, IngredientMode} from "../../components/IngredientForm";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {StepForm, StepMode} from "../../components/StepForm";


const YIELD_REGEX: RegExp = /^([0-9]+[.]?[0-9]*)([a-zA-Z \t]*)$/
const YIELD_UNIT_REGEX: RegExp = /([a-zA-Z \t]*)$/

export default function RecipeView(): JSX.Element {

    const [recipe, setRecipe] = useState<Recipe>(() => emptyRecipe())
    // because yield has a value and unit, and because in the recipe the value is a number
    // and because numbers and text are hard to mix in an input field, we store the value
    // of yield.value as a string
    const [yieldValue, setYieldValue] = useState<string>('')

    const [addingIngredient, setAddingIngredient] = useState<boolean>(false)
    const [addingStep, setAddingStep] = useState<boolean>(false)
    const [editing, setEditing] = useState<boolean>(false)

    function handleNameChange(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void {
        setRecipe(rec => ({...rec, name: event.target.value}))
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

    function handleAddingIngredient(): void {
        setAddingIngredient(true)
    }

    function handleSubmittedNewIngredient(ingredient: Ingredient, andAgain: boolean): void {
        console.log("ingredient", ingredient)
        setRecipe(current => ({...current, ingredients: [...current.ingredients, ingredient]}))
        setAddingIngredient(andAgain)
    }

    function handleUpdatedIngredient(ingredient: Ingredient): void {
        const index = recipe.ingredients.findIndex(item => item._id === ingredient._id)
        if (index >= 0) {
            setRecipe(current => {
                const updated = current.ingredients.slice()
                updated[index] = ingredient
                return {...current, ingredients: updated}
            })
        }
    }

    function handleDeleteIngredient(id: string): void {
        setRecipe(current => ({...current, ingredients: current.ingredients.filter(ing => ing._id !== id)}))
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
        const index = recipe.steps.findIndex(item => item._id === step._id)
        if (index >= 0) {
            setRecipe(current => {
                const updated = current.steps.slice()
                updated[index] = step
                return {...current, steps: updated}
            })
        }
    }

    function handleDeleteStep(id: string): void {
        setRecipe(current => ({...current, steps: current.steps.filter(ing => ing._id !== id)}))
    }

    function handleCancelStep(): void {
        setAddingStep(false)
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
                    <TextField
                        id="recipe-yield-amount"
                        label="Yield"
                        size='small'
                        value={`${yieldValue}${recipe.yield.unit}`}
                        onChange={handleYieldValueChange}
                        InputLabelProps={{shrink: true}}
                        sx={{'& .MuiTextField-root': {m: 1.1, width: '5ch'}}}
                    />
                </div>

                <h2 className={utilStyles.recipeIngredientsHeader}>Ingredients</h2>
                <List sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper'}}>
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
                    <IconButton
                        onClick={handleAddingIngredient}
                        disabled={addingIngredient || editing}
                    >
                        <AddCircleIcon/>
                    </IconButton> :
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
                    <IconButton
                        onClick={handleAddingStep}
                        disabled={addingStep || editing}
                    >
                        <AddCircleIcon/>
                    </IconButton> :
                    <span/>
                }

                <h2 className={utilStyles.headingMd}>Notes</h2>
            </Box>
        </Layout>
    )
}

