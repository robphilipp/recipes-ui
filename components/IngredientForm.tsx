import React, {ChangeEvent, useRef, useState} from 'react'
import {Button, ButtonGroup, IconButton, MenuItem, Select, SelectChangeEvent, TextField} from "@mui/material";
import {
    Amount,
    copyIngredient,
    emptyIngredient,
    Ingredient,
    isEmptyIngredient,
    Units,
    unitsFrom,
    Yield
} from "./Recipe";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CancelIcon from '@mui/icons-material/Cancel';

type Props = {
    ingredient: Ingredient
    onUpdate: (ingredient: Ingredient) => void
    onCancel: () => void
}

export function IngredientForm(props: Props): JSX.Element {

    const [ingredient, setIngredient] = useState<Ingredient>(() => copyIngredient(props.ingredient))
    const newItemRef = useRef<boolean>(isEmptyIngredient(props.ingredient))

    function handleIngredientUnitSelect(event: SelectChangeEvent): void {
        const amount: Amount = {...ingredient.amount, unit: unitsFrom(event.target.value)}
        setIngredient(ing => ({...ing, amount}))
    }

    function handleIngredientAmountChange(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void {
        const amount: Amount = {...ingredient.amount, value: Math.max(0, parseFloat(event.target.value))}
        setIngredient(ing => ({...ing, amount}))
    }

    function canSubmit(): boolean {
        return !isNaN(ingredient.amount.value) && ingredient.amount.unit &&
            ingredient.name !== '' && ingredient.name !== null && ingredient.name !== undefined
    }

    function handleSubmit(): void {

    }

    function handleCancel(): void {

    }

    return (
        <div>
            <TextField
                id="recipe-ingredient-amount-value"
                label="Amount"
                size='small'
                type="number"
                value={ingredient.amount.value}
                sx={{"& .MuiOutlinedInput-root": {width: 120}}}
                onChange={handleIngredientAmountChange}
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
                onChange={event => setIngredient(ing => ({...ing, name: event.target.value}))}
            />
            <TextField
                id="recipe-ingredient-brand"
                label="Brand"
                size='small'
                value={ingredient.brand}
                onChange={event => setIngredient(ing => ({...ing, brand: event.target.value}))}
            />
            {/*<ButtonGroup variant='text'>*/}
            {/*    {newItemRef.current ?*/}
            {/*        <Button onClick={handleSubmit} color='primary' disabled={!canSubmit()} startIcon={<AddCircleIcon/>}>*/}
            {/*        </Button> :*/}
            {/*        <span/>*/}
            {/*    }*/}
            {/*    <Button onClick={handleSubmit} color='primary' disabled={!canSubmit()} startIcon={<CheckBoxIcon/>}>*/}

            {/*    </Button>*/}
            {/*    <Button onClick={handleCancel} color='secondary' startIcon={<CancelIcon/>}>*/}

            {/*    </Button>*/}
                {newItemRef.current ? <IconButton onClick={handleSubmit} color='primary' disabled={!canSubmit()}>
                    <AddCircleIcon/>
                </IconButton> : <span/>
                }
                <IconButton onClick={handleSubmit} color='primary' disabled={!canSubmit()}>
                    <CheckBoxIcon/>
                </IconButton>
                <IconButton onClick={handleCancel} color='secondary'>
                    <CancelIcon/>
                </IconButton>
            {/*</ButtonGroup>*/}
        </div>
    )
}