import Layout from "../../components/Layout";
import Head from "next/head";
import utilStyles from "../../styles/utils.module.css";
import {ChangeEvent, useState} from "react";
import {Box, MenuItem, Select, SelectChangeEvent, TextField} from "@mui/material";
import {getMilliseconds} from "date-fns/fp";
import {
    Amount,
    emptyIngredient,
    emptyRecipe,
    Ingredient,
    Recipe,
    Units,
    unitsFrom,
    Yield
} from "../../components/Recipe";

const YIELD_REGEX: RegExp = /^([0-9]+[.]?[0-9]*)([a-zA-Z \t]*)$/
const YIELD_UNIT_REGEX: RegExp = /([a-zA-Z \t]*)$/

export default function RecipeView(): JSX.Element {

    const [recipe, setRecipe] = useState<Recipe>(() => emptyRecipe())
    // because yield has a value and unit, and because in the recipe the value is a number
    // and because numbers and text are hard to mix in an input field, we store the value
    // of yield.value as a string
    const [yieldValue, setYieldValue] = useState<string>('')

    const [ingredient, setIngredient] = useState<Ingredient>(() => emptyIngredient())

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

    function handleIngredientUnitSelect(event: SelectChangeEvent): void {
        const amount: Amount = {...ingredient.amount, unit: unitsFrom(event.target.value)}
        setIngredient(ing => ({...ing, amount}))
    }

    return (
        <Layout>
            <Head><title>New Recipe</title></Head>
            <Box
                component="form"
                // sx={{'& .MuiTextField-root': {m: 1.1, width: '25ch'}}}
                sx={{
                    '& .MuiTextField-root': {mt: 1.2, mr: 0.5},
                    // '& .MuiSelect-outlined': {mt: 1.2, minWidth: 100},
                }}
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
                <div>
                    <TextField
                        id="recipe-ingredient-amount-value"
                        label="Amount"
                        size='small'
                        type="number"
                        value={ingredient.amount.value}
                        sx={{"& .MuiOutlinedInput-root": {width: 120}}}
                    />
                    <Select
                        id="recipe-ingredient-amount-unit"
                        // label="Units"
                        size='small'
                        value={ingredient.amount.unit}
                        onChange={handleIngredientUnitSelect}
                        sx={{mt: 1.2, mr: 0.5, minWidth: 100}}
                    >
                        {Object.entries(Units).map(([label, unit]) => (
                            <MenuItem key={unit} value={unit}>{label.toLowerCase()}</MenuItem>
                        ))}
                    </Select>
                    <TextField
                        id="recipe-ingredient-name"
                        label="Ingredient"
                        size='small'
                        value={ingredient.name}
                    />
                    <TextField
                        id="recipe-ingredient-brand"
                        label="Brand"
                        size='small'
                        value={ingredient.brand}
                    />
                </div>
                <h2 className={utilStyles.headingMd}>Steps</h2>
                <div>
                </div>
                <h2 className={utilStyles.headingMd}>Notes</h2>
            </Box>
        </Layout>
    )
}

