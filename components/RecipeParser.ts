import {emptyIngredient, emptyStep, Ingredient, Recipe, Step} from "./Recipe";
import {
    Ingredient as ParsedIngredient,
    ParseType,
    Step as ParsedStep,
    toRecipe,
    Recipe as ParsedRecipe,
    toSteps, toIngredients
} from "@saucie/recipe-parser";
import {failureResult, Result, successResult} from "result-fn";
import {ILexingError} from "chevrotain";
import {unitTypeFrom} from "../lib/Measurements";

export function parseRecipe(text: string): Result<Recipe, Array<ILexingError>> {
    const {result: recipe, errors} = toRecipe(text, {deDupSections: true})
    if (errors.length !== 0) {
        return failureResult(errors)
    }
    const ingredients: Array<Ingredient> = convertIngredients((recipe as ParsedRecipe).ingredients)
    const steps: Array<Step> = convertSteps((recipe as ParsedRecipe).steps)
}

/**
 * Parses text representing a list of ingredients into an array {@link Ingredient} objects
 * @param text text representing a list of ingredients with optional sections
 * @return A {@link Result} holding a list of {@link Ingredient} objects or a failure holding an array
 * of {@link ILexingError} objects
 */
export function parseIngredients(text: string): Result<Array<Ingredient>, Array<ILexingError>> {
    const {result: ingredients, errors} = toIngredients(text, {deDupSections: true})
    // const {recipe, errors} = toRecipe(text, {deDupSections: true, inputType: ParseType.INGREDIENTS})
    if (errors.length !== 0) {
        return failureResult(errors)
    }
    return successResult(convertIngredients(ingredients as ParsedIngredient[]))
}

function convertIngredients(parsed: Array<ParsedIngredient>): Array<Ingredient> {
    return parsed.map(ingredient => ({
        ...emptyIngredient(),
        section: ingredient.section,
        name: ingredient.ingredient,
        amount: {value: ingredient.amount.quantity, unit: unitTypeFrom(ingredient.amount.unit)},
        brand:  ingredient.brand
    }))
}

/**
 * Parses text representing a list of steps into an array {@link Step} objects
 * @param text text representing a list of steps with optional sections
 * @return A {@link Result} holding a list of {@link Step} objects or a failure holding an array
 * of {@link ILexingError} objects
 */
export function parseSteps(text: string): Result<Array<Step>, Array<ILexingError>> {
    // const {recipe, errors} = toRecipe(text, {deDupSections: true, inputType: ParseType.STEPS})
    const {result: steps, errors} = toSteps(text, {deDupSections: true})
    if (errors.length !== 0) {
        return failureResult(errors)
    }
    return successResult(convertSteps(steps as ParsedStep[]))
}

function convertSteps(parsed: Array<ParsedStep>): Array<Step> {
    return parsed.map(step => ({
        ...emptyStep(),
        title: step.title,
        text: step.step
    }))
}