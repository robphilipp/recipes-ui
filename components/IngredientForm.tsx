import React, {ChangeEvent, SyntheticEvent, useRef, useState} from 'react'
import {Autocomplete, Box, Grid, IconButton, ListItem, ListItemText, TextField} from "@mui/material";
import {
    copyIngredient,
    emptyIngredient,
    Ingredient,
    ingredientAsText,
    isEmptyIngredient,
} from "./Recipe";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CancelIcon from '@mui/icons-material/Cancel';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import {DisplayMode} from "./FormMode";
import {ItemPosition, Movement} from "./RecipeEditor";
import MoveUpIcon from "@mui/icons-material/MoveUp";
import MoveDownIcon from "@mui/icons-material/MoveDown";
import {Amount, categoriesByUnits, measurementUnits, UnitName, UnitType, unitTypeFrom} from "../lib/Measurements";

function noop() {
}

type UnitOption = { label: UnitName, value: UnitType }

type Props = {
    position?: ItemPosition
    ingredient: Ingredient
    initialMode?: DisplayMode
    onSubmit?: (ingredient: Ingredient, andAgain: boolean) => void
    onCancel?: () => void
    onDelete?: (id: string) => void
    onMove?: (ingredient: Ingredient, ingredientNumber: number, direction: Movement) => void
}

export function IngredientForm(props: Props): JSX.Element {
    const {
        position,
        initialMode = DisplayMode.VIEW,
        onSubmit = noop,
        onCancel = noop,
        onDelete = noop,
        onMove = noop,
    } = props

    const [ingredient, setIngredient] = useState<Ingredient>(() => copyIngredient(props.ingredient))
    const isNewItemRef = useRef<boolean>(isEmptyIngredient(props.ingredient))

    const [mode, setMode] = useState<DisplayMode>(initialMode)

    function handleIngredientUnitSelect(value: UnitOption): void {
        if (value === null) return
        const amount: Amount = {...ingredient.amount, unit: unitTypeFrom(value.value)}
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

    /**
     * Handles the submitting of the ingredient information.
     * @param andAgain When `true` and the new-item flag reference is also `true`, then signals the parent
     * that a new ingredient should be added, and clears out the ingredient in this form. When set
     * to `false` or the new-item flag reference is `false` then does a regular submit and switches the
     * mode to editing
     */
    function handleSubmit(andAgain: boolean): void {
        if (andAgain && isNewItemRef.current) {
            onSubmit(ingredient, andAgain)
            setIngredient(emptyIngredient())
        } else {
            setMode(DisplayMode.VIEW)
            onSubmit(ingredient, andAgain)
        }
    }

    function handleCancel(): void {
        setMode(DisplayMode.VIEW)
        setIngredient(props.ingredient)
        onCancel()
    }

    function handleKeyPress(event: React.KeyboardEvent<HTMLDivElement>): void {
        // @ts-ignore
        if (event.target.id === "ingredient-amount-unit-select") return;

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

    function renderControls(ingredient: Ingredient): JSX.Element {
        return (
            <>
                {position ? <IconButton
                    onClick={() => onMove(ingredient, position.itemNumber, Movement.UP)}
                    color='primary'
                    size='small'
                    disabled={position.isFirst}
                >
                    <MoveUpIcon sx={{width: 18, height: 18}}/>
                </IconButton> : <span/>}
                {position ? <IconButton
                    onClick={() => onMove(ingredient, position.itemNumber, Movement.DOWN)}
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
                    onClick={() => onDelete(ingredient.id)}
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
                key={`${props.ingredient.id}-li`}
                secondaryAction={renderControls(ingredient)}
                sx={{
                    width: '100%',
                    maxWidth: {
                        xs: 500,
                        sm: 550,
                        md: 600,
                    }
                }}
            >
                <ListItemText
                    sx={{
                        maxWidth: {
                            xs: 250,
                            sm: 250,
                            md: 800,
                        }
                    }}
                >
                    {ingredient.section !== null ?
                        <div style={{fontWeight: 600, fontSize: '1.1em'}}>{ingredient.section.toUpperCase()}</div> :
                        <span/>
                    }
                    <div>{ingredientAsText(ingredient)}</div>
                </ListItemText>
            </ListItem>
        )
    }

    return (
        <Box onKeyDown={handleKeyPress}>
            <Grid container sx={{
                maxWidth: {xs: 500, sm: 500, md: 800}
            }}>
                <Grid item xs={12} md={2}>
                    <TextField
                        id="recipe-ingredient-section-value"
                        label="Section"
                        size='small'
                        required
                        autoFocus={true}
                        value={ingredient.section}
                        onChange={event => setIngredient(current => ({...current, section: event.target.value}))}
                    />
                </Grid>
                <Grid item xs={6} md={2}>
                    <TextField
                        id="recipe-ingredient-amount-value"
                        label="Amount"
                        size='small'
                        type="number"
                        required
                        autoFocus={false}
                        value={ingredient.amount.value}
                        onChange={handleIngredientAmountChange}
                    />
                </Grid>
                <Grid item xs={6} md={2}>
                    <Autocomplete
                        id="ingredient-amount-unit-select"
                        renderInput={(params) => (<TextField {...params} label="units" />)}
                        options={measurementUnits.map(unit => ({label: unit.label, value: unit.value}))}
                        groupBy={option => categoriesByUnits.get(option.value as UnitType)}
                        sx={{mt: 1.2, mr: 0.5, minWidth: 100, maxWidth: 150}}
                        size='small'
                        value={ingredient.amount.unit}
                        // @ts-ignore
                        isOptionEqualToValue={(option, value) => option !== null && option.value === value}
                        onChange={(event: SyntheticEvent, newValue: UnitOption) => handleIngredientUnitSelect(newValue)}
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <TextField
                        id="recipe-ingredient-name"
                        label="Ingredient"
                        size='small'
                        required
                        value={ingredient.name}
                        onChange={event => setIngredient(current => ({...current, name: event.target.value}))}
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <TextField
                        id="recipe-ingredient-brand"
                        label="Brand"
                        size='small'
                        value={ingredient.brand}
                        onChange={event => setIngredient(current => ({...current, brand: event.target.value}))}
                    />
                </Grid>
                <Grid item xs={12} md={2}>
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