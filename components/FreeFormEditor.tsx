import React, {useEffect, useRef, useState} from "react";
import {ILexingError} from "chevrotain";
import {Ingredient as ParsedIngredient, ParseType, Recipe as ParsedRecipe, toRecipe} from "@saucie/recipe-parser";
import {ArrowCircleDown, ThumbDown, ThumbUp} from "@mui/icons-material";
import {Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate} from "@codemirror/view";
import {EditorState, StateEffect, StateField} from "@codemirror/state";
import {basicSetup} from "@codemirror/basic-setup"
import {Ingredient, ingredientAsText} from "./Recipe";
import {formatQuantityFor} from "../lib/utils";
import {unitFor, unitNameFor, unitTypeFrom} from "../lib/Measurements";
import {UUID} from "bson";
import {Box, Divider, Grid, Radio, Theme, Typography, useTheme} from "@mui/material";
import pluralize from 'pluralize'
import {styled} from "@mui/system";

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
        <div ref={editorRef}/>
        <Divider sx={{marginBottom: 1}}/>
        <Box>
            <Grid container sx={{maxWidth: {xs: 500, sm: 500, md: 800}}}>
                <Grid item xs={12} md={12} sx={{display: 'flex', justifyContent: 'center'}}>
                    <ArrowCircleDown/>
                    <Typography sx={{marginTop: 0.5, marginLeft: 10, marginRight: 10}} component="span">Parsed Ingredient List</Typography>
                    <ArrowCircleDown/>
                </Grid>
                <Grid item xs={12} md={2} sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    {parseErrors.length === 0 ? <ThumbUp color='primary'/> : <ThumbDown color='warning'/>}
                </Grid>
                <Grid item xs={12} md={10}>
                    {ingredients?.map(ingredient => {
                        const ing = convertIngredient(ingredient)
                        const sectionHeader = ing.section ?
                            <Typography
                                key={ing.section}
                                sx={{
                                    fontSize: '1.1em',
                                    fontWeight: 700,
                                    color: theme.palette.text.disabled,
                                    textDecoration: 'underline',
                                    marginTop: 1
                                }}
                            >
                                {ing.section}
                            </Typography> :
                            <></>
                        return (
                            <>
                                {sectionHeader}
                                <Typography key={ing.id}>{renderIngredientAs(ing, theme)}</Typography>
                            </>
                        )
                    })}
                </Grid>
            </Grid>
            <Divider sx={{marginTop: 1}}/>
        </Box>
    </>
}

export const RenderedQuantityUnit = styled(Typography)(({theme}) => ({
    color: theme.palette.text.secondary,
    textDecorationLine: 'underline',
    textDecorationColor: theme.palette.text.secondary,
    textDecorationStyle: 'dotted',
    fontSize: '0.9em',
    fontWeight: 500,
})) as typeof Typography

export const RenderedIngredient = styled(Typography)(({theme}) => ({
    color: theme.palette.text.secondary,
    fontSize: '0.9em',
    fontWeight: 500,
})) as typeof Typography

function renderIngredientAs(ingredient: Ingredient, theme: Theme): JSX.Element {
    if (ingredient.amount.unit.toString() === 'piece') {
        return <>
            <RenderedQuantityUnit component="span">
                {`${formatQuantityFor(ingredient.amount.value)}`}
            </RenderedQuantityUnit>
            <RenderedIngredient component="span">
                {` ${pluralize(ingredient.name, Math.max(1, ingredient.amount.value))}`}
            </RenderedIngredient>
        </>
    }
    return <>
        <RenderedQuantityUnit component="span">
            {`${formatQuantityFor(ingredient.amount.value, unitNameFor(ingredient.amount.unit))}`}
        </RenderedQuantityUnit>
        <RenderedIngredient component="span">
            {` ${ingredient.name}`}
        </RenderedIngredient>
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
