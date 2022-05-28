import {copyIngredient, emptyIngredient, Ingredient, ingredientAsText} from "./Recipe";
import React, {useEffect, useState} from "react";
import {Button, List, ListItem, RadioGroup} from "@mui/material";
import {IngredientForm} from "./IngredientForm";
import {DisplayMode} from "./FormMode";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {ItemPosition, Movement} from "./RecipeEditor";
import {ParseType, toIngredients, toRecipe} from "@saucie/recipe-parser";
import {EditorMode, EditorModelLabel, EditorModeRadio} from "./EditorMode";
import {FreeFormEditor} from "./FreeFormEditor";
// import {EditorState} from "@codemirror/state";
// import {EditorView, keymap} from "@codemirror/view";
// import {defaultKeymap} from "@codemirror/commands";

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

export function IngredientsEditor(props: Props): JSX.Element {
    const {ingredients, onUpdateIngredients} = props

    const [addingIngredient, setAddingIngredient] = useState<boolean>(false)
    const [editorMode, setEditorMode] = useState<EditorMode>(EditorMode.FORM_BASED)

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

    function handleApplyParsedIngredients(parsed: Array<Ingredient>): void {
        onUpdateIngredients(parsed)
        console.log(parsed)
        setEditorMode(EditorMode.FORM_BASED)
    }

    function handleParsedIngredientsChanged(parsed: Array<Ingredient>): void {
        console.log(parsed)
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
            </>
        )
    }

    return (
        <>
            {editorMode === EditorMode.FORM_BASED ? <RadioGroup
                aria-labelledby="editor mode"
                value={editorMode}
                name="editor-mode-radio-buttons"
                row={true}
            >
                <EditorModelLabel
                    label="Form-Based"
                    value={EditorMode.FORM_BASED}
                    control={<EditorModeRadio/>}
                    onChange={() => setEditorMode(EditorMode.FORM_BASED)}
                    // disabled={editorMode === EditorMode.FREE_FORM}
                />
                <EditorModelLabel
                    label="Free-Form"
                    value={EditorMode.FREE_FORM}
                    control={<EditorModeRadio/>}
                    onChange={() => setEditorMode(EditorMode.FREE_FORM)}
                    // disabled={editorMode === EditorMode.FREE_FORM}
                />
            </RadioGroup> : <></>}
            {editorMode === EditorMode.FORM_BASED ?
                <FormBasedEditor/> :
                <FreeFormEditor
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

//
// const underlineTheme = EditorView.baseTheme({
//     ".cm-underline": { textDecoration: "underline 3px red" }
// })
// const underlineMark = Decoration.mark({class: "cm-underline"})
// const addUnderline = StateEffect.define<{from: number, to: number}>()
// const underlineField = StateField.define<DecorationSet>({
//     create() {
//         return Decoration.none
//     },
//     update(underlines: DecorationSet, transaction) {
//         underlines = underlines.map(transaction.changes)
//         for (let effect of transaction.effects) if (effect.is(addUnderline)) {
//             underlines = underlines.update({
//                 add: [underlineMark.range(effect.value.from, effect.value.to)]
//             })
//         }
//         return underlines
//     },
//     provide: stateField => EditorView.decorations.from(stateField)
// })
//
// export function underlineRanges(view: EditorView, ranges: Array<{from: number, to: number}>): boolean {
//     // let effects: StateEffect<unknown>[] = view.state.selection.ranges
//     //     .filter(r => !r.empty)
//     let effects: StateEffect<unknown>[] = ranges.map(({from, to}) => addUnderline.of({from, to}))
//     if (!effects.length) return false
//
//     if (!view.state.field(underlineField, false)) {
//         effects.push(StateEffect.appendConfig.of([underlineField, underlineTheme]))
//     }
//     view.dispatch({effects})
//     return true
// }
// // export function underlineSelection(view: EditorView) {
// //     let effects: StateEffect<unknown>[] = view.state.selection.ranges
// //         .filter(r => !r.empty)
// //         .map(({from, to}) => addUnderline.of({from, to}))
// //     if (!effects.length) return false
// //
// //     if (!view.state.field(underlineField, false))
// //         effects.push(StateEffect.appendConfig.of([underlineField,
// //             underlineTheme]))
// //     view.dispatch({effects})
// //     return true
// // }
