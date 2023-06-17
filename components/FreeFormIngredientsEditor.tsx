import React, {useEffect, useRef, useState, JSX} from "react";
import {ILexingError} from "chevrotain";
import {Ingredient as ParsedIngredient, toIngredients} from "@saucie/recipe-parser";
import {ArrowCircleDown, ThumbDown, ThumbUp} from "@mui/icons-material";
import {Decoration, DecorationSet, EditorView} from "@codemirror/view";
import {EditorState, StateEffect, StateField} from "@codemirror/state";
import {basicSetup} from "@codemirror/basic-setup"
import {Ingredient} from "./Recipe";
import {formatQuantityFor} from "../lib/utils";
import {unitNameFor, unitTypeFrom} from "../lib/Measurements";
import {UUID} from "bson";
import {Box, Button, ButtonGroup, Divider, Grid, Theme, Typography, useTheme} from "@mui/material";
import {styled} from "@mui/system";
import {failureResult, Result, resultFromAll, successResult} from "result-fn";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

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
    /**
     * The text holding the list of ingredients
     */
    initialIngredients: string
    /**
     * Callback for when the user accepts the changes, and wants to switch back to
     * the form-based editor
     * @param ingredients An array of {@link Ingredient} parsed from the text
     */
    onApply: (ingredients: Array<Ingredient>) => void
    /**
     * Callback for when the user makes changes to the ingredients that are parsed
     * into an ingredient list
     * @param ingredients An array of {@link Ingredient} parsed from the text
     */
    onChange: (ingredients: Array<Ingredient>) => void
    /**
     * Callback to cancel and revert any changes made in the free-form editor
     */
    onCancel: () => void
}

/**
 * Provides a text editor that can be used to enter the list of ingredients and sections
 * @param props The initial ingredients and the callback functions
 * @constructor
 */
export function FreeFormIngredientsEditor(props: Props): JSX.Element {
    const {initialIngredients, onApply, onChange, onCancel} = props

    const theme = useTheme()

    const [parseErrors, setParseErrors] = useState<Array<ILexingError>>([])
    const [ingredients, setIngredients] = useState<Array<ParsedIngredient>>()
    const initialParsedIngredientsRef = useRef<Array<ParsedIngredient>>([])

    // holds to the ref to the editor, when the page mounts
    const editorRef = useRef<HTMLDivElement>(null)

    // reference to the editor state for managing changes
    const editorStateRef = useRef<EditorState>(EditorState.create({
        doc: initialIngredients,
        extensions: [
            basicSetup,
            EditorView.updateListener.of(update => {
                // when the user updates the ingredients list, then parse, call the on-change
                // callback, and set the updated ingredients
                if (update.docChanged) {
                    parseIngredients(update.state.doc.sliceString(0), false, false)
                        .onSuccess(gredients => {
                            resultFromAll(gredients.map(ingredient => convertIngredient(ingredient)))
                                .onSuccess(ingreds => {
                                    onChange(ingreds)
                                    setIngredients(gredients)
                                    setParseErrors([])
                                })
                                .onFailure(error => setParseErrors([{
                                    offset: 0,
                                    length: 0,
                                    message: error
                                } as ILexingError]))
                        })
                        .onFailure(setParseErrors)
                }
            }),
            EditorView.lineWrapping
        ]
    }))

    // the reference to the editor view (set when the component mounts)
    const editorViewRef = useRef<EditorView>()

    // set up the editor on mount
    useEffect(
        () => {
            editorViewRef.current = new EditorView({
                state: editorStateRef.current,
                // editorRef.current must be type HTMLDivElement | null, and here we want
                // undefined rather than null
                parent: editorRef.current === null ? undefined : editorRef.current,
            })

            return () => {
                setIngredients(undefined)
                editorViewRef.current?.destroy()
            }
        },
        []
    )

    // set the initial ingredients on mount
    useEffect(
        () => {
            if (ingredients === undefined && initialIngredients !== undefined) {
                parseIngredients(initialIngredients, true, true)
                    .onSuccess(gredients => {
                        initialParsedIngredientsRef.current = gredients
                        setIngredients(gredients)
                        setParseErrors([])
                    })
                    .onFailure(setParseErrors)
            }
        },
        [ingredients, initialIngredients]
    )

    /**
     * Parses the text into an array of {@link ParsedIngredient}. When there is a parsing error, the
     * returns a list of the errors
     * @param text The text to be converted to ingredients
     * @return A {@link Result} wrapping the parsed ingredients, or the parse errors when it fails
     */
    function parseIngredients(text: string, newLexer: boolean, newParser: boolean): Result<Array<ParsedIngredient>, Array<ILexingError>> {
        const {result: ingredientList, errors} = toIngredients(text, {deDupSections: true, gimmeANewLexer: newLexer, gimmeANewParser: newParser})
        if (editorViewRef.current && editorViewRef.current.state) {
            if (errors.length === 0) {
                underlineRanges(editorViewRef.current, [])
            } else {
                underlineRanges(
                    editorViewRef.current,
                    errors.map(error => ({from: error.offset, to: error.offset + error.length}))
                )
                return failureResult(errors)
            }
            if (ingredientList !== undefined && ingredientList.length > 0) {
                return successResult(ingredientList)
            }
        }
        return failureResult([])
    }

    function convertParsedIngredients(parsedIngredients: Array<ParsedIngredient>): Result<Array<Ingredient>, string> {
        return resultFromAll(parsedIngredients.map(ingredient => convertIngredient(ingredient)))
    }

    /**
     * Reverts the changes to the initial ingredients. Recall that each change made by the user is updated
     * with the parent, so we need to set the original ingredient list with the parent and the tell the
     * parent to cancel
     */
    function handleCancel(): void {
        convertParsedIngredients(initialParsedIngredientsRef.current)
            .onSuccess(ingreds => {
                onChange(ingreds)
                onCancel()
            })
    }

    return <>
        <ButtonGroup>
            <Button
                startIcon={<CheckCircleIcon/>}
                variant="outlined"
                size="small"
                sx={{textTransform: 'none'}}
                disabled={parseErrors.length > 0}
                onClick={() => onApply(convertParsedIngredients(ingredients || []).getOrDefault([]))}
            >
                Accept Changes
            </Button>
            <Button
                startIcon={<CancelIcon/>}
                variant="outlined"
                size="small"
                onClick={handleCancel}
                sx={{textTransform: 'none'}}
            >
                Cancel
            </Button>
        </ButtonGroup>

        <div ref={editorRef}/>
        <Divider sx={{marginBottom: 1}}/>
        <Box>
            <Grid container>
                <Grid item xs={12} sm={4} md={4} lg={4}>
                    {parseErrors.length === 0 ? <ThumbUp color='success'/> : <ThumbDown color='error'/>}
                </Grid>
                <Grid item xs={12} sm={8} md={8} lg={8} sx={{display: 'flex', justifyContent: 'flex-start'}}>
                    <ArrowCircleDown/>
                    <Typography sx={{marginTop: 0.5, marginLeft: 2, marginRight: 2}} component="span">
                        Parsed Ingredient List
                    </Typography>
                    <ArrowCircleDown/>
                </Grid>
                <Grid item xs={12} sm={12} md={10} lg={10}>
                    {ingredients?.map(ingredient => convertIngredient(ingredient)
                            .map(ing => {
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
                            })
                            .getOrDefault(<></>)
                    )}
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
                {` ${ingredient.name}`}
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


function convertIngredient(ingredient: ParsedIngredient): Result<Ingredient, string> {
    return unitTypeFrom(ingredient.amount.unit)
        .map(unit => ({
            id: (new UUID()).toString('hex'),
            section: ingredient.section,
            amount: {value: ingredient.amount.quantity, unit: unit},
            name: ingredient.ingredient,
            brand: ingredient.brand
        }))
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
