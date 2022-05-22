import React, {useEffect, useRef, useState} from "react";
import {ILexingError} from "chevrotain";
import {ParseType, toRecipe} from "@saucie/recipe-parser";
import {ThumbDown, ThumbUp} from "@mui/icons-material";
import {Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate} from "@codemirror/view";
import {EditorState, StateEffect, StateField} from "@codemirror/state";
import {basicSetup} from "@codemirror/basic-setup"

const underlineTheme = EditorView.baseTheme({
    ".cm-underline": { textDecoration: "underline 3px red" }
})
const underlineMark = Decoration.mark({class: "cm-underline"})
const addUnderline = StateEffect.define<{from: number, to: number}>()
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

    const [parseErrors, setParseErrors] = useState<Array<ILexingError>>([])
    const editorRef = useRef<HTMLDivElement>()
    const editorStateRef = useRef<EditorState>(EditorState.create({
        doc: initialIngredients,
        extensions: [
            basicSetup,
            EditorView.updateListener.of(update => {
                if (update.docChanged) {
                    handleChange(update.state.doc.sliceString(0), update)
                }
            })
        ]
    }))
    const editorViewRef = useRef<EditorView>()

    useEffect(
        () => {
            editorViewRef.current = new EditorView({
                state: editorStateRef.current,
                parent: editorRef.current,
            })
            if (editorViewRef.current && editorViewRef.current.state) {
                const success = underlineRanges(editorViewRef.current, [{from: 10, to: 20}])
                console.log("underlined:", success)
            }
            return () => {
                editorViewRef.current.destroy()
            }
        },
        []
    )

    function handleChange(value: string, viewUpdate: ViewUpdate): void {
        const {recipe, errors} = toRecipe(value, {deDupSections: true, inputType: ParseType.INGREDIENTS})
        setParseErrors(errors)
        console.log(
            "parsed recipe:", recipe,
            "parsing errors:", errors,
            "editor view:", editorViewRef.current
        )
        if (editorViewRef.current && editorViewRef.current.state) {
            const success = underlineRanges(editorViewRef.current, [{from: 10, to: 20}])
            console.log("underlined:", success)
        }
    }

    return <>
        {parseErrors.length === 0 ? <ThumbUp color='success'/> : <ThumbDown color='warning'/>}
        return <div ref={editorRef}/>
    </>
}
// export function FreeFormEditor(props: Props): JSX.Element {
//     const {initialIngredients} = props
//
//     const [parseErrors, setParseErrors] = useState<Array<ILexingError>>([])
//     const editorRef = useRef<HTMLDivElement>()
//     const { setContainer, state, container, view, setView } = useCodeMirror({
//         container: editorRef.current,
//         value: initialIngredients,
//         onChange: handleChange
//     })
//
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
//             const success = underlineRanges(view, [{from: 10, to: 20}])
//             console.log("underlined:", success)
//         }
//     }
//
//     return <>
//         {parseErrors.length === 0 ? <ThumbUp color='success'/> : <ThumbDown color='warning'/>}
//         return <div ref={editorRef}/>
//     </>
// }

// function underlineRanges(view: EditorView, ranges: Array<{from: number, to: number}>): StateEffect<unknown>[] {
//     let effects: StateEffect<unknown>[] = ranges.map(({from, to}) => addUnderline.of({from, to}))
//     if (!effects.length) return []
//
//     if (!view.state.field(underlineField, false)) {
//         effects.push(StateEffect.appendConfig.of([underlineField, underlineTheme]))
//     }
//     // view.dispatch({effects})
//     return effects
// }
function underlineRanges(view: EditorView, ranges: Array<{from: number, to: number}>): boolean {
    let effects: StateEffect<unknown>[] = ranges.map(({from, to}) => addUnderline.of({from, to}))
    if (!effects.length) return false

    if (!view.state.field(underlineField, false)) {
        effects.push(StateEffect.appendConfig.of([underlineField, underlineTheme]))
    }
    view.dispatch({effects})
    // view.dispatch({effects})
    return true
}
