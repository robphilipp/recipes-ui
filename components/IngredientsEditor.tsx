import {copyIngredient, emptyIngredient, Ingredient, ingredientAsText} from "./Recipe";
import React, {useState} from "react";
import {Button, List, ListItem, RadioGroup} from "@mui/material";
import {IngredientForm} from "./IngredientForm";
import {DisplayMode} from "./FormMode";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {ItemPosition, Movement} from "./RecipeEditor";
import {EditorMode, EditorModelLabel, EditorModeRadio} from "./EditorMode";
import {FreeFormIngredientsEditor} from "./FreeFormIngredientsEditor";

type Props = {
    /**
     * The current ingredients in the recipe. For new recipes, this should be an
     * empty list.
     */
    ingredients: Array<Ingredient>
    /**
     * Callback function used to update the ingredients list
     * @param ingredients The updated list of ingredients
     */
    onUpdateIngredients: (ingredients: Array<Ingredient>) => void
}

/**
 * Displays an ingredient editor tracks whether the ingredient is being viewed or edited
 * @param props The properties holding the current ingredients and the callback for updating ingredients
 * @return The editor element
 * @constructor
 */
export function IngredientsEditor(props: Props): JSX.Element {
    const {ingredients, onUpdateIngredients} = props

    // tracks whether an ingredient is being added or just being edited
    const [addingIngredient, setAddingIngredient] = useState<boolean>(false)
    // tracks whether the editor mode is view or form
    const [editorMode, setEditorMode] = useState<EditorMode>(EditorMode.FORM_BASED)

    /**
     * Handles the submitting of an ingredient
     * @param ingredient The ingredient that is being submitted
     * @param andAgain Flag specifying whether to add another ingredient after submitting
     */
    function handleSubmittedNewIngredient(ingredient: Ingredient, andAgain: boolean): void {
        onUpdateIngredients([...ingredients, ingredient])
        setAddingIngredient(andAgain)
    }

    /**
     * Handles updating an ingredient
     * @param ingredient The updated ingredient
     */
    function handleUpdatedIngredient(ingredient: Ingredient): void {
        const index = ingredients.findIndex(item => item.id === ingredient.id)
        if (index >= 0) {
            const updated = ingredients.map(ingredient => copyIngredient(ingredient))
            updated[index] = ingredient
            onUpdateIngredients(updated)
        }
    }

    function handleCancelIngredient(): void {
        setEditorMode(EditorMode.FORM_BASED)
        setAddingIngredient(false)
    }

    function handleMoveIngredient(ingredient: Ingredient, ingredientNumber: number, direction: Movement): void {
        const index = ingredientNumber - 1
        if (index >= 0 && index < ingredients.length) {
            onUpdateIngredients(swapItem(ingredients, index, direction))
        }
    }

    function handleApplyParsedIngredients(parsed: Array<Ingredient>): void {
        onUpdateIngredients(parsed)
        setEditorMode(EditorMode.FORM_BASED)
    }

    function handleParsedIngredientsChanged(parsed: Array<Ingredient>): void {
        onUpdateIngredients(parsed)
    }

    function handleCancelParsedIngredients(): void {
        setEditorMode(EditorMode.FORM_BASED)
    }

    function FormBasedEditor(): JSX.Element {
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
                                onDelete={id => onUpdateIngredients(ingredients.filter(ing => ing.id !== id))}
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
                            onClick={() => setAddingIngredient(true)}
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
            </>
        )
    }

    return (
        <>
            {editorMode === EditorMode.FORM_BASED ?
                <RadioGroup
                    aria-labelledby="ingredients editor mode"
                    value={editorMode}
                    name="ingredients-editor-mode-radio-buttons"
                    row={true}
                >
                    <EditorModelLabel
                        label="Form-Based"
                        value={EditorMode.FORM_BASED}
                        control={<EditorModeRadio/>}
                        onChange={() => setEditorMode(EditorMode.FORM_BASED)}
                    />
                    <EditorModelLabel
                        label="Free-Form"
                        value={EditorMode.FREE_FORM}
                        control={<EditorModeRadio/>}
                        onChange={() => setEditorMode(EditorMode.FREE_FORM)}
                    />
                </RadioGroup> :
                <></>
            }
            {editorMode === EditorMode.FORM_BASED ?
                <FormBasedEditor/> :
                <FreeFormIngredientsEditor
                    initialIngredients={ingredientsToText(ingredients)}
                    onApply={handleApplyParsedIngredients}
                    onChange={handleParsedIngredientsChanged}
                    onCancel={handleCancelParsedIngredients}
                />
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

/**
 * Converts the list of ingredients to text, and includes the section headers
 * @param ingredients
 */
function ingredientsToText(ingredients: Array<Ingredient>): string {
    return ingredients
        .map(ingredient => ingredient.section !== null ?
            `${ingredient.section}\n${ingredientAsText(ingredient)}` :
            `${ingredientAsText(ingredient)}`
        )
        .join("\n")
}
