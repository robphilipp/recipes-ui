import * as React from 'react';
import {createContext, useContext, useState} from 'react';

interface UseStatusValues {
    // map(recipe_id -> set(checked_ingredients))
    readonly ingredientsStatus: Map<string, Set<string>>
    // map(recipe_id -> set(checked_steps))
    readonly stepsStatus: Map<string, Set<string>>

    inProgress: (recipeId: string) => boolean

    isIngredientSelected: (recipeId: string, ingredient: string) => boolean
    selectIngredient: (recipeId: string, ingredient: string) => void
    unselectIngredient: (recipeId: string, ingredient: string) => void
    clearIngredients: (recipeId: string) => void

    isStepSelected: (recipeId: string, step: string) => boolean
    selectStep: (recipeId: string, ingredient: string) => void
    unselectStep: (recipeId: string, ingredient: string) => void
    clearSteps: (recipeId: string) => void
}

const initialStatusValues: UseStatusValues = {
    ingredientsStatus: new Map<string, Set<string>>(),
    stepsStatus: new Map<string, Set<string>>(),

    inProgress: () => false,
    
    isIngredientSelected: () => false,
    selectIngredient: noop,
    unselectIngredient: noop,
    clearIngredients: noop,
    
    isStepSelected: () => false,
    selectStep: noop,
    unselectStep: noop,
    clearSteps: noop
}

function noop() {
    /* empty */
}

const StatusContext = createContext<UseStatusValues>(initialStatusValues)

interface Props {
    children: JSX.Element | Array<JSX.Element>;
}

export default function StatusProvider(props: Props): JSX.Element {
    const [ingredientsStatus, setIngredientsStatus] = useState<Map<string, Set<string>>>(() => new Map())
    const [stepsStatus, setStepsStatus] = useState<Map<string, Set<string>>>(() => new Map())

    function inProgress(recipeId: string): boolean {
        return ingredientsStatus.get(recipeId)?.size > 0 || stepsStatus.get(recipeId)?.size > 0
    }
    
    function isIngredientSelected(recipeId: string, ingredient: string): boolean {
        return ingredientsStatus.get(recipeId)?.has(ingredient) || false
    }
    
    function selectIngredient(recipeId: string, ingredient: string): void {
        if (ingredientsStatus.has(recipeId)) {
            ingredientsStatus.get(recipeId).add(ingredient)
        } else {
            ingredientsStatus.set(recipeId, new Set([ingredient]))
        }
        setIngredientsStatus(status => new Map(status))
    }
    
    function unselectIngredient(recipeId: string, ingredient: string): void {
        if (ingredientsStatus.has(recipeId) && ingredientsStatus.get(recipeId).delete(ingredient)) {
            if (ingredientsStatus.get(recipeId).size === 0) {
                ingredientsStatus.delete(recipeId)
            }
            setIngredientsStatus(status => new Map(status))
        }
    }
    
    function clearIngredients(recipeId: string): void {
        if (ingredientsStatus.delete(recipeId)) {
            setIngredientsStatus(status => new Map(status))
        }
    }
    
    function isStepSelected(recipeId: string, step: string): boolean {
        return stepsStatus.get(recipeId)?.has(step) || false
    }
    
    function selectStep(recipeId: string, step: string): void {
        if (stepsStatus.has(recipeId)) {
            stepsStatus.get(recipeId).add(step)
        } else {
            stepsStatus.set(recipeId, new Set([step]))
        }
        setStepsStatus(status => new Map(status))
    }
    
    function unselectStep(recipeId: string, step: string): void {
        if (stepsStatus.has(recipeId) && stepsStatus.get(recipeId).delete(step)) {
            if (stepsStatus.get(recipeId).size === 0) {
                stepsStatus.delete(recipeId)
            }
            setStepsStatus(status => new Map(status))
        }
    }
    
    function clearSteps(recipeId: string): void {
        if (stepsStatus.delete(recipeId)) {
            setStepsStatus(status => new Map(status))
        }
    }
    
    const {children} = props
    return <StatusContext.Provider value={{
        inProgress,
        ingredientsStatus, isIngredientSelected, selectIngredient, unselectIngredient, clearIngredients,
        stepsStatus, isStepSelected, selectStep, unselectStep, clearSteps
    }}>
        {children}
    </StatusContext.Provider>
}

export function useStatus(): UseStatusValues {
    const context = useContext<UseStatusValues>(StatusContext)
    const {
        ingredientsStatus, selectIngredient, unselectIngredient, clearIngredients,
        stepsStatus, selectStep, unselectStep, clearSteps
    } = context
    if (
        ingredientsStatus === undefined || selectIngredient === undefined || unselectIngredient === undefined || clearIngredients === undefined ||
        stepsStatus === undefined || selectStep === undefined || unselectStep === undefined || clearSteps === undefined
    ) {
        throw new Error("useStatus hook can only be used when the component is a child of <StatusProvider/>")
    }
    return context
}
