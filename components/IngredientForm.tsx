import React, {ChangeEvent, useRef, useState} from 'react'
import {IconButton, ListSubheader, MenuItem, Select, SelectChangeEvent, TextField} from "@mui/material";
import {
    Amount,
    copyIngredient,
    emptyIngredient,
    Ingredient,
    ingredientAsText,
    isEmptyIngredient,
    UnitCategories,
    unitsByCategory,
    unitsFrom
} from "./Recipe";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CancelIcon from '@mui/icons-material/Cancel';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';

function noop() {
}

export enum IngredientMode {VIEW, EDIT}

type Props = {
    ingredient: Ingredient
    initialMode?: IngredientMode
    onSubmit?: (ingredient: Ingredient, andAgain: boolean) => void
    onCancel?: () => void
    onDelete?: (id: string) => void
}

export function IngredientForm(props: Props): JSX.Element {
    const {
        initialMode = IngredientMode.VIEW,
        onSubmit = noop,
        onCancel = noop,
        onDelete = noop
    } = props

    const [ingredient, setIngredient] = useState<Ingredient>(() => copyIngredient(props.ingredient))
    const newItemRef = useRef<boolean>(isEmptyIngredient(props.ingredient))

    const [mode, setMode] = useState<IngredientMode>(initialMode)

    function handleIngredientUnitSelect(event: SelectChangeEvent): void {
        const amount: Amount = {...ingredient.amount, unit: unitsFrom(event.target.value)}
        setIngredient(current => ({...current, amount}))
    }

    function handleIngredientAmountChange(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void {
        const amount: Amount = {...ingredient.amount, value: Math.max(0, parseFloat(event.target.value))}
        setIngredient(current => ({...current, amount}))
    }

    function canSubmit(): boolean {
        return !isNaN(ingredient.amount.value) && ingredient.amount.unit &&
            ingredient.name !== '' && ingredient.name !== null && ingredient.name !== undefined
    }

    function handleSubmit(andAgain: boolean): void {
        if (andAgain) {
            onSubmit(ingredient, andAgain)
            setIngredient(emptyIngredient())
        } else {
            setMode(IngredientMode.VIEW)
            onSubmit(ingredient, andAgain)
        }
    }

    function handleCancel(): void {
        setMode(IngredientMode.VIEW)
        setIngredient(props.ingredient)
        onCancel()
    }

    if (mode === IngredientMode.VIEW) {
        return (
            <>
                <IconButton
                    onClick={() => setMode(IngredientMode.EDIT)}
                    color='primary'
                    size='small'
                >
                    <ModeEditIcon sx={{width: 18, height: 18}}/>
                </IconButton>
                <IconButton
                    onClick={() => onDelete(ingredient._id)}
                    color='primary'
                    size='small'
                >
                    <DeleteIcon sx={{width: 18, height: 18}}/>
                </IconButton>
                {ingredientAsText(ingredient)}
            </>
        )
    }

    return (
        <>
            <TextField
                id="recipe-ingredient-amount-value"
                label="Amount"
                size='small'
                type="number"
                value={ingredient.amount.value}
                sx={{"& .MuiOutlinedInput-root": {width: 120}}}
                onChange={handleIngredientAmountChange}
            />
            {/*todo replace select with autocomplete*/}
            {/*<Autocomplete*/}
            {/*    renderInput={(params) => <TextField {...params} label="units" />}*/}
            {/*    options={Object.entries(Units).map(([label, unit]) => ({label, id: unit}))}*/}
            {/*    sx={{mt: 1.2, mr: 0.5, minWidth: 100, maxWidth: 150}}*/}
            {/*    size='small'*/}
            {/*/>*/}
            <Select
                id="recipe-ingredient-amount-unit"
                // label="Units"
                size='small'
                value={ingredient.amount.unit}
                onChange={handleIngredientUnitSelect}
                sx={{mt: 1.2, mr: 0.5, minWidth: 100}}
            >
                <ListSubheader>Mass</ListSubheader>
                {unitsByCategory.get(UnitCategories.MASS).map((unit) => (
                    <MenuItem key={unit.value} value={unit.value}>{unit.label.toLowerCase()}</MenuItem>
                ))}
                <ListSubheader>Weight</ListSubheader>
                {unitsByCategory.get(UnitCategories.WEIGHT).map((unit) => (
                    <MenuItem key={unit.value} value={unit.value}>{unit.label.toLowerCase()}</MenuItem>
                ))}
                <ListSubheader>Volume</ListSubheader>
                {unitsByCategory.get(UnitCategories.VOLUME).map((unit) => (
                    <MenuItem key={unit.value} value={unit.value}>{unit.label.toLowerCase()}</MenuItem>
                ))}
                <ListSubheader>Piece</ListSubheader>
                {unitsByCategory.get(UnitCategories.PIECE).map((unit) => (
                    <MenuItem key={unit.value} value={unit.value}>{unit.label.toLowerCase()}</MenuItem>
                ))}
            </Select>
            <TextField
                id="recipe-ingredient-name"
                label="Ingredient"
                size='small'
                value={ingredient.name}
                onChange={event => setIngredient(ing => ({...ing, name: event.target.value}))}
            />
            <TextField
                id="recipe-ingredient-brand"
                label="Brand"
                size='small'
                value={ingredient.brand}
                onChange={event => setIngredient(ing => ({...ing, brand: event.target.value}))}
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