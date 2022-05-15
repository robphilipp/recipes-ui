import {copyIngredient, emptyIngredient, Ingredient, Recipe} from "./Recipe";
import React, {useEffect, useState} from "react";
import {Button, List, ListItem} from "@mui/material";
import {IngredientForm} from "./IngredientForm";
import {DisplayMode} from "./FormMode";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {ItemPosition, Movement} from "./RecipeEditor";
import {ParseType, toRecipe} from "@saucie/recipe-parser";

type Props = {
    /**
     * Optional ingredient list. When the ingredients are not specified (i.e. undefined),
     * then signal to the editor that it should be in "add" mode. Otherwise, editor is in "update" mode.
     */
    ingredients?: Array<Ingredient>
    onUpdateIngredients: (ingredients: Array<Ingredient>) => void
    // /**
    //  * Callback function when the recipe is submitted
    //  * @param recipe The updated or new recipe
    //  */
    // onSubmit: (recipe: Recipe) => void
}

export function IngredientsEditor(props: Props): JSX.Element {
    const {
        ingredients = [],
        onUpdateIngredients,
        // onSubmit
    } = props

    const [addingIngredient, setAddingIngredient] = useState<boolean>(false)

    useEffect(
        () => {
            const {recipe: parsedRecipe, errors} = toRecipe(`dough
            1 1/2 cp all-purpose flour
            1 tsp vanilla extract,
            sauce
            1 cup milk
            1 egg`,
                {deDupSections: true, inputType: ParseType.INGREDIENTS}
            )
            // setRecipe(parsedRecipe)
            console.log("parsed recipe", parsedRecipe, "parse errors", errors)
        },
        []
    )

    function handleAddingIngredient(): void {
        setAddingIngredient(true)
    }

    function handleSubmittedNewIngredient(ingredient: Ingredient, andAgain: boolean): void {
        onUpdateIngredients([...ingredients, ingredient])
        setAddingIngredient(andAgain)
    }

    function handleUpdatedIngredient(ingredient: Ingredient): void {
        const index = ingredients.findIndex(item => item.id === ingredient.id)
        if (index >= 0) {
            const updated = ingredients.map(ingredient => copyIngredient(ingredient))
            updated[index] = ingredient
            onUpdateIngredients(updated)
        }
    }

    function handleDeleteIngredient(id: string): void {
        onUpdateIngredients(ingredients.filter(ing => ing.id !== id))
    }

    function handleCancelIngredient(): void {
        setAddingIngredient(false)
    }

    function handleMoveIngredient(ingredient: Ingredient, ingredientNumber: number, direction: Movement): void {
        const index = ingredientNumber - 1
        if (index >= 0 && index < ingredients.length) {
            onUpdateIngredients(swapItem(ingredients, index, direction))
        }
    }

    return (
        <>
            <List sx={{width: '100%', maxWidth: 900, bgcolor: 'background.paper'}}>
                {ingredients.map((ingredient, index) => (
                    <ListItem key={ingredient.name} disablePadding>
                        <IngredientForm
                            position={itemPosition(index + 1, ingredients.length)}
                            ingredient={ingredient}
                            onSubmit={handleUpdatedIngredient}
                            onCancel={handleCancelIngredient}
                            onDelete={handleDeleteIngredient}
                            onMove={handleMoveIngredient}
                        />
                    </ListItem>))}
            </List>
            {
                addingIngredient ?
                    <IngredientForm
                        key={`new-ingredient-${ingredients.length + 1}`}
                        ingredient={emptyIngredient()}
                        initialMode={DisplayMode.EDIT}
                        onSubmit={handleSubmittedNewIngredient}
                        onCancel={handleCancelIngredient}
                    /> :
                    <span/>
            }
            {
                !addingIngredient ?
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
        </>)
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
