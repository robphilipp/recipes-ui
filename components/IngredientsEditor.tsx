import {copyIngredient, emptyIngredient, Ingredient, ingredientAsText} from "./Recipe";
import React, {useEffect, useRef, useState} from "react";
import {Button, List, ListItem, RadioGroup} from "@mui/material";
import {IngredientForm} from "./IngredientForm";
import {DisplayMode} from "./FormMode";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {ItemPosition, Movement} from "./RecipeEditor";
import {ParseType, toRecipe} from "@saucie/recipe-parser";
import {EditorMode, EditorModelLabel, EditorModeRadio} from "./EditorMode";
import CodeMirror, {
    Decoration,
    DecorationSet,
    EditorView,
    Facet,
    StateEffect,
    StateField,
    useCodeMirror, ViewUpdate
} from "@uiw/react-codemirror";
import {ILexingError} from "chevrotain";
import {ThumbDown, ThumbUp} from "@mui/icons-material";
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

    // const editorStateRef = useRef<EditorState>()
    // const editorViewRef = useRef<EditorView>()

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
            console.log("parsed recipe", parsedRecipe, "parse errors", errors)
        },
        []
    )

    // useEffect(
    //     () => {
    //         if (editorMode === EditorMode.FREE_FORM) {
    //             editorStateRef.current = EditorState.create({
    //                 doc: ingredients.map(ingredient => ingredientAsText(ingredient)).join("\n"),
    //                 extensions: [keymap.of(defaultKeymap)]
    //             })
    //             editorViewRef.current = new EditorView({
    //                 state: editorStateRef.current,
    //                 parent: document.body
    //             })
    //         }
    //     },
    //     [editorMode]
    // )

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

    // function FreeFormEditor(): JSX.Element {
    //     // const [ingredientText, setIngredientText] = useState<string>(ingredientsToText(ingredients))
    //     const [parseErrors, setParseErrors] = useState<Array<ILexingError>>([])
    //     const editorRef = useRef<HTMLDivElement>()
    //     const { setContainer, state, container, view, setView } = useCodeMirror({
    //         container: editorRef.current,
    //         value: ingredientsToText(ingredients),
    //         // value: ingredientText,
    //         onChange: handleChange
    //         // onChange: (value, viewUpdate) => setIngredientText(value)
    //     })
    //     useEffect(
    //         () => {
    //             if (editorRef.current) {
    //                 setContainer(editorRef.current)
    //                 console.log("editorRef", editorRef.current)
    //
    //                 if (view && view.state) {
    //                     const success = underlineRanges(view, [{from: 10, to: 20}])
    //                     console.log("underlined:", success)
    //                 }
    //             }
    //         },
    //         [setContainer, view]
    //     )
    //
    //     function handleChange(value: string, viewUpdate: ViewUpdate): void {
    //         const {recipe, errors} = toRecipe(value, {deDupSections: true, inputType: ParseType.INGREDIENTS})
    //         setParseErrors(errors)
    //         console.log(
    //             "parsed recipe:", recipe,
    //             "parsing errors:", errors,
    //             "editor view:", view
    //         )
    //
    //         if (view && view.state) {
    //         // if (viewUpdate.view && viewUpdate.view.state) {
    //             const success = underlineRanges(view, [{from: 10, to: 20}])
    //             // const success = underlineRanges(viewUpdate.view, [{from: 10, to: 20}])
    //             // setView(viewUpdate.view)
    //             console.log("underlined:", success)
    //         }
    //
    //         // setIngredientText(value)
    //     }
    //
    //     // useEffect(
    //     //     () => {
    //     //         const {recipe, errors} = toRecipe(ingredientText, {deDupSections: true, inputType: ParseType.INGREDIENTS})
    //     //         setParseErrors(errors)
    //     //         console.log(
    //     //             "parsed recipe:", recipe,
    //     //             "parsing errors:", errors,
    //     //             // "editor state:", state,
    //     //             // "editor container:", container,
    //     //             "editor view:", view
    //     //         )
    //     //
    //     //         if (view && view.state) {
    //     //             const success = underlineRanges(view, [{from: 10, to: 20}])
    //     //             setView(view)
    //     //             console.log("underlined:", success)
    //     //         }
    //     //         // editorRef.current.state
    //     //         // Decoration.mark({attributes: {color: 'red'}}).range(10, 20)
    //     //         // const underline = Facet.define<EditorView, Decoration>()
    //     //         // EditorView.decorations =
    //     //         // EditorView.decorations = Facet.define(view, Decoration.mark({attributes: {color: 'red'}}).range(10, 20))
    //     //     },
    //     //     [ingredientText, view]
    //     // )
    //
    //     return <>
    //         {parseErrors.length === 0 ? <ThumbUp color='success'/> : <ThumbDown color='warning'/>}
    //         return <div ref={editorRef}/>
    //         {/*<Typography>{parseErrors.map(error => error.message).join(";")}</Typography>*/}
    //         {/*<CodeMirror*/}
    //         {/*    value={ingredientText}*/}
    //         {/*    onChange={(value, viewUpdate) => {*/}
    //         {/*        setIngredientText(value)*/}
    //         {/*        // const {recipe, errors} = toRecipe(value)*/}
    //         {/*        // setParseErrors(errors)*/}
    //         {/*        // console.log(recipe, errors)*/}
    //         {/*    }}*/}
    //         {/*/>*/}
    //     </>
    // }

    return (
        <>
            <RadioGroup
                aria-labelledby="editor mode"
                value={editorMode}
                name="editor-mode-radio-buttons"
                row={true}
            >
                <EditorModelLabel
                    label="Form-Based"
                    value={EditorMode.FORM_BASED}
                    control={<EditorModeRadio/>}
                    onClick={() => setEditorMode(EditorMode.FORM_BASED)}
                />
                <EditorModelLabel
                    label="Free-Form"
                    value={EditorMode.FREE_FORM}
                    control={<EditorModeRadio/>}
                    onClick={() => setEditorMode(EditorMode.FREE_FORM)}
                />
            </RadioGroup>
            {editorMode === EditorMode.FORM_BASED ?
                <FormBasedEditor/> :
                <FreeFormEditor initialIngredients={ingredientsToText(ingredients)}/>
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
