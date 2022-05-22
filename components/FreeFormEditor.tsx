import React, {useEffect, useRef, useState} from "react";
import {ILexingError} from "chevrotain";
import {Ingredient as ParsedIngredient, ParseType, Recipe as ParsedRecipe, toRecipe} from "@saucie/recipe-parser";
import {ThumbDown, ThumbUp} from "@mui/icons-material";
import {Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate} from "@codemirror/view";
import {EditorState, StateEffect, StateField} from "@codemirror/state";
import {basicSetup} from "@codemirror/basic-setup"
import {Ingredient, ingredientAsText} from "./Recipe";
import {formatQuantityFor} from "../lib/utils";
import {unitFor, unitTypeFrom} from "../lib/Measurements";
import {UUID} from "bson";
import {Typography, useTheme} from "@mui/material";

const underlineTheme = EditorView.baseTheme({
    ".cm-underline": {textDecoration: "wavy underline orange"}
})
const underlineMark = Decoration.mark({class: "cm-underline"})
const addUnderline = StateEffect.define<{ from: number, to: number }>()
const underlineField = StateField.define<DecorationSet>({
    create() {
        return Decoration.none
    },
    update(underlines: DecorationSet, transaction) {
        underlines = underlines.map(transaction.changes)
        for (let effect of transaction.effects) if (effect.is(addUnderline)) {
            underlines = underlines.update({
                add: [underlineMark.range(effect.value.from, effect.value.to)]
            })
        }
        return underlines
    },
    provide: stateField => EditorView.decorations.from(stateField)
})

type Props = {
    initialIngredients: string
}

export function FreeFormEditor(props: Props): JSX.Element {
    const {initialIngredients} = props

    const theme = useTheme()

    const [parseErrors, setParseErrors] = useState<Array<ILexingError>>([])
    const [ingredients, setIngredients] = useState<Array<ParsedIngredient>>()

    const editorRef = useRef<HTMLDivElement>()
    const editorStateRef = useRef<EditorState>(EditorState.create({
        doc: initialIngredients,
        extensions: [
            basicSetup,
            EditorView.updateListener.of(update => {
                if (update.docChanged) {
                    handleChange(update.state.doc.sliceString(0))
                }
            }),
            EditorView.lineWrapping
        ]
    }))
    const editorViewRef = useRef<EditorView>()

    useEffect(
        () => {
            editorViewRef.current = new EditorView({
                state: editorStateRef.current,
                parent: editorRef.current,
            })
            handleChange(initialIngredients)
            return () => {
                editorViewRef.current.destroy()
            }
        },
        [initialIngredients]
    )

    function handleChange(value: string): void {
        const {recipe: ingredientList, errors} = toRecipe(value, {
            deDupSections: true,
            inputType: ParseType.INGREDIENTS
        })
        setParseErrors(errors)
        if (editorViewRef.current && editorViewRef.current.state) {
            if (errors.length === 0) {
                underlineRanges(editorViewRef.current, [])
            } else {
                underlineRanges(
                    editorViewRef.current,
                    errors.map(error => ({from: error.offset, to: error.offset + error.length}))
                )
            }
            if (ingredientList !== undefined && (ingredientList as Array<ParsedIngredient>).length > 0) {
                setIngredients(ingredientList as Array<ParsedIngredient>)
            }
        }
    }

    return <>
        {parseErrors.length === 0 ? <ThumbUp color='success'/> : <ThumbDown color='warning'/>}
        <div ref={editorRef}/>
        {ingredients?.map(ingredient => {
            const ing = convertIngredient(ingredient)
            const sectionHeader = ing.section ?
                <Typography
                    key={ing.section}
                    sx={{fontSize: '1.1em', fontWeight: 700, color: theme.palette.text.disabled}}
                >
                    {ing.section}
                </Typography> :
                <></>
            return (
                <>
                    {sectionHeader}
                    <Typography
                        key={ing.id}
                        sx={{fontSize: '0.9em', color: theme.palette.text.disabled}}
                    >
                        {ingredientAsText(ing)}
                    </Typography>
                </>
            )
        })}
    </>
}

function convertIngredient(ingredient: ParsedIngredient): Ingredient {
    return {
        id: (new UUID()).toString('hex'),
        section: ingredient.section,
        amount: {value: ingredient.amount.quantity, unit: unitTypeFrom(ingredient.amount.unit)},
        name: ingredient.ingredient,
        brand: ingredient.brand
    }
}

function underlineRanges(view: EditorView, ranges: Array<{ from: number, to: number }>): boolean {
    let effects: StateEffect<unknown>[] = ranges.map(({from, to}) => addUnderline.of({from, to}))
    if (!effects.length) return false

    if (!view.state.field(underlineField, false)) {
        effects.push(StateEffect.appendConfig.of([underlineField, underlineTheme]))
    }
    view.dispatch({effects})
    return true
}
