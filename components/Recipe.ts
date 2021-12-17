import {Long, ObjectId, WithId} from "mongodb";
import {getTime} from "date-fns/fp";
import {UUID} from "bson";

export type Yield = {
    value: number
    unit: string
}

export enum Units {
    MILLIGRAM = 'mg', GRAM = 'g', KILOGRAM = 'kg',
    OUNCE = 'oz', POUND = 'lb',
    MILLILITER = 'ml', LITER = 'l', TEASPOON = 'tsp', TABLESPOON = 'tbsp', FLUID_OUNCE = 'fl oz',
    CUP = 'cup', PINT = 'pt', QUART = 'qt', GALLON = 'gal',
    PIECE = 'piece'
}

export enum TimeUnits {
    MINUTE = 'minute', HOUR = 'hour', DAY = 'day', MONTH = 'month'
}

export type Time = {
    value: number
    unit: TimeUnits
}

export type RequiredTime = {
    total: Time
    active: Time
}

export enum UnitCategories {
    MASS = 'Mass', 
    WEIGHT = 'Weight',
    VOLUME = 'Volume',
    PIECE = 'Piece'
}

export type Unit = {
    value: string
    label: string
}

export type Amount = {
    value: number
    unit: Units
}

export type Ingredient = {
    _id?: string
    name: string
    brand: string | null
    amount: Amount
}

export type Step = {
    _id?: string
    title: string | null
    text: string
}

export type RecipeSummary = {
    _id?: ObjectId
    name: string
    tags: Array<string>
    createdOn: number | Long
    modifiedOn: number | null | Long
}

export type Recipe = RecipeSummary & {
    story: string
    yield: Yield
    requiredTime: RequiredTime
    ingredients: Array<Ingredient>
    steps: Array<Step>
    notes: string
}

/*************************************************************************
|                         HELPER FUNCTIONS
+**************************************************************************/

const unitFrom = (unit: Units, label: string): Unit => ({value: unit, label})

export const unitsByCategory = new Map<UnitCategories, Array<Unit>>([
    [UnitCategories.MASS, [unitFrom(Units.MILLIGRAM, 'milligram'), unitFrom(Units.GRAM, 'gram'), unitFrom(Units.KILOGRAM, 'kilogram')]],
    [UnitCategories.WEIGHT, [unitFrom(Units.OUNCE, 'ounce'), unitFrom(Units.POUND, 'pound')]],
    [UnitCategories.VOLUME, [unitFrom(Units.MILLILITER, 'milliliter'), unitFrom(Units.LITER, 'liter'), unitFrom(Units.TEASPOON, 'teaspoon'), unitFrom(Units.TABLESPOON, 'tablespoon'), unitFrom(Units.FLUID_OUNCE, 'fluid ounce'), unitFrom(Units.CUP, 'cup'), unitFrom(Units.PINT, 'pint'), unitFrom(Units.QUART, 'quart'), unitFrom(Units.GALLON, 'gallon')]],
    [UnitCategories.PIECE, [unitFrom(Units.PIECE, 'piece')]]
])


/*
 | RECIPES
 */
export function asRecipe(doc: WithId<Recipe>): Recipe {
    return {
        _id: doc._id,
        story: doc.story,
        name: doc.name,
        tags: doc.tags,
        yield: doc.yield,
        requiredTime: doc.requiredTime,
        createdOn: doc.createdOn,
        modifiedOn: doc.modifiedOn,
        ingredients: doc.ingredients,
        steps: doc.steps,
        notes: doc.notes
    }
}

export function asRecipeSummary(doc: WithId<Recipe>): RecipeSummary {
    return {
        _id: doc._id,
        name: doc.name,
        tags: doc.tags,
        createdOn: doc.createdOn,
        modifiedOn: doc.modifiedOn
    }
}

export function emptyRecipe(): Recipe {
    return {
        _id: null,
        story: '',
        name: '',
        tags: [],
        createdOn: getTime(new Date()),
        modifiedOn: null,
        yield: {value: 0, unit: ''},
        requiredTime: emptyRequiredTime(),
        ingredients: [],
        steps: [],
        notes: ''
    }
}

export function isValidRecipe(recipe: Recipe): boolean {
    return recipe.name !== '' && recipe.yield.value > 0 &&
        recipe.ingredients.length > 0 && recipe.steps.length > 0
}

/*
 | INGREDIENTS
 */
export function emptyIngredient(): Ingredient {
    return {
        _id: `(new)${(new UUID()).toString('hex')}`,
        amount: {value: NaN, unit: Units.PIECE},
        name: '',
        brand: null
    }
}

export function isEmptyIngredient(ingredient: Ingredient): boolean {
    return isNaN(ingredient.amount.value) && ingredient.amount.unit === Units.PIECE &&
        ingredient.name === '' && ingredient.brand === null
}

export function copyIngredient(ingredient: Ingredient): Ingredient {
    return {
        _id: ingredient._id,
        amount: {...ingredient.amount},
        name: ingredient.name,
        brand: ingredient.brand
    }
}

export function unitsFrom(unit: string): Units {
    const [, key] = Object.entries(Units).find(([, value]) => value === unit)
    return key
}

export function ingredientAsText(ingredient: Ingredient): string {
    if (ingredient.amount.unit.toString() === 'piece') {
        return `${ingredient.amount.value} ${ingredient.name}`
    }
    return `${ingredient.amount.value} ${ingredient.amount.unit} ${ingredient.name}`
}

/*
 | STEPS
 */
export function emptyStep(): Step {
    return {
        _id: `(new)${(new UUID()).toString('hex')}`,
        title: null,
        text: ''
    }
}

export function isEmptyStep(step: Step): boolean {
    return step.title === null && step.text === ''
}

export function copyStep(step: Step): Step {
    return {...step}
}

/*
 | REQUIRED TIME
 */
export function emptyRequiredTime(): RequiredTime {
    return {
        total: {value: 0, unit: TimeUnits.MINUTE},
        active: {value: 0, unit: TimeUnits.MINUTE}
    }
}

export function isEmptyRequiredTime(time: RequiredTime): boolean {
    const {total, active} = time
    return total.value === 0 && active.value === 0
}

export function copyRequiredTime(time: RequiredTime): RequiredTime {
    const {total, active} = time
    return {total: {...total}, active: {...active}}
}

export function timeUnitsFrom(unit: string): TimeUnits {
    const [, key] = Object.entries(TimeUnits).find(([, value]) => value === unit)
    return key
}
