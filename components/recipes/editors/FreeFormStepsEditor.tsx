import React, {useEffect, useRef, useState, JSX} from "react";
import {ILexingError} from "chevrotain";
import {Step as ParsedStep, toSteps} from "@saucie/recipe-parser";
import {ArrowCircleDown, ThumbDown, ThumbUp} from "@mui/icons-material";
import {Decoration, DecorationSet, EditorView} from "@codemirror/view";
import {EditorState, StateEffect, StateField} from "@codemirror/state";
import {basicSetup} from "@codemirror/basic-setup"
import {Step} from "../Recipe";
import {formatNumber} from "../../../lib/utils";
import {UUID} from "bson";
import {Box, Button, ButtonGroup, Divider, Grid, Typography, useTheme} from "@mui/material";
import {styled} from "@mui/system";
import {failureResult, Result, successResult} from "result-fn";
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
     * The text holding the list of steps
     */
    initialSteps: string
    /**
     * Callback for when the user accepts the changes, and wants to switch back to
     * the form-based editor
     * @param steps An array of {@link Step} parsed from the text
     */
    onApply: (steps: Array<Step>) => void
    /**
     * Callback for when the user makes changes to the steps that are parsed
     * into a steps list
     * @param steps An array of {@link Step} parsed from the text
     */
    onChange: (steps: Array<Step>) => void
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
export function FreeFormStepsEditor(props: Props): JSX.Element {
    const {initialSteps, onApply, onChange, onCancel} = props

    const theme = useTheme()

    const [parseErrors, setParseErrors] = useState<Array<ILexingError>>([])
    const [steps, setSteps] = useState<Array<ParsedStep>>()
    const initialParsedStepsRef = useRef<Array<ParsedStep>>()

    // holds to the ref to the editor, when the page mounts
    const editorRef = useRef<HTMLDivElement>(null)

    // reference to the editor state for managing changes
    const editorStateRef = useRef<EditorState>(EditorState.create({
        doc: initialSteps,
        extensions: [
            basicSetup,
            EditorView.updateListener.of(update => {
                // when the user updates the ingredients list, then parse, call the on-change
                // callback, and set the updated ingredients
                if (update.docChanged) {
                    parseSteps(update.state.doc.sliceString(0), false, false)
                        .onSuccess(stps => {
                            onChange(stps.map(step => convertStep(step)))
                            setSteps(stps)
                            setParseErrors([])
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
                parent: editorRef.current === null ? undefined : editorRef.current,
            })

            return () => {
                setSteps(undefined)
                editorViewRef.current?.destroy()
            }
        },
        []
    )

    // set the initial ingredients on mount
    useEffect(
        () => {
            if (steps === undefined && initialSteps !== undefined) {
                parseSteps(initialSteps, true, true)
                    .onSuccess(gredients => {
                        initialParsedStepsRef.current = gredients
                        setSteps(gredients)
                        setParseErrors([])
                    })
                    .onFailure(setParseErrors)
            }
        },
        [steps, initialSteps]
    )

    /**
     * Parses the text into an array of {@link ParsedStep}. When there is a parsing error, the
     * returns a list of the errors
     * @param text The text to be converted to step
     * @param newLexer When `true` creates a new lexer when this function is called; otherwise
     * reuses the existing one
     * @param newParser When `true` creates a new parser when this function is called; otherwise
     * reuses the existing one
     * @return A {@link Result} wrapping the parsed step, or the parse errors when it fails
     */
    function parseSteps(text: string, newLexer: boolean, newParser: boolean): Result<Array<ParsedStep>, Array<ILexingError>> {
        const {result: stepList, errors} = toSteps(text, {deDupSections: true, gimmeANewLexer: newLexer, gimmeANewParser: newParser})
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
            if (stepList !== undefined && (stepList as Array<ParsedStep>).length > 0) {
                return successResult(stepList as Array<ParsedStep>)
            }
            if (stepList === undefined) {
                return failureResult([])
            }
        }
        return failureResult([{
            offset: 0,
            length: 0,
            message: "Editor view or its state are undefined."
        } as ILexingError])
    }

    /**
     * Reverts the changes to the initial ingredients. Recall that each change made by the user is updated
     * with the parent, so we need to set the original step list with the parent and then tell the
     * parent to cancel
     */
    function handleCancel(): void {
        onChange(initialParsedStepsRef.current?.map(step => convertStep(step)) || [])
        onCancel()
    }

    return <>
        <ButtonGroup>
            <Button
                startIcon={<CheckCircleIcon/>}
                variant="outlined"
                size="small"
                sx={{textTransform: 'none'}}
                disabled={parseErrors.length > 0}
                onClick={() => onApply(steps?.map(ingredient => convertStep(ingredient)) || [])}
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
                        Parsed Steps
                    </Typography>
                    <ArrowCircleDown/>
                </Grid>
                <Grid item xs={12} sm={12} md={10} lg={10}>
                    {steps?.map((step, index) => {
                        const ing = convertStep(step)
                        const sectionHeader = ing.title ?
                            <Typography
                                key={ing.title}
                                sx={{
                                    fontSize: '1.1em',
                                    fontWeight: 700,
                                    color: theme.palette.text.disabled,
                                    textDecoration: 'underline',
                                    marginTop: 1
                                }}
                            >
                                {ing.title}
                            </Typography> :
                            <></>
                        return (
                            <>
                                {sectionHeader}
                                <Typography key={ing.id}>{renderStepAs(index+1, ing)}</Typography>
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
    // textDecorationLine: 'underline',
    // textDecorationColor: theme.palette.text.secondary,
    // textDecorationStyle: 'dotted',
    fontSize: '0.9em',
    fontWeight: 600,
    marginRight: 10
})) as typeof Typography

export const RenderedIngredient = styled(Typography)(({theme}) => ({
    color: theme.palette.text.secondary,
    fontSize: '0.9em',
    fontWeight: 500,
})) as typeof Typography

function renderStepAs(stepNumber: number, step: Step): JSX.Element {
    return <>
        <RenderedQuantityUnit component="span">
            {`${formatNumber(stepNumber)}.`}
        </RenderedQuantityUnit>
        <RenderedIngredient component="span">
            {`${step.text}`}
        </RenderedIngredient>
    </>
}


function convertStep(step: ParsedStep): Step {
    return {
        id: (new UUID()).toString('hex'),
        title: step.title,
        text: step.step
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
