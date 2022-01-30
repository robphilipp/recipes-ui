import {Long, ObjectId, WithId} from "mongodb";
import {getTime} from "date-fns/fp";
import {UUID} from "bson";
import {formatQuantityFor} from "../lib/utils";
import {convertAmount, UnitName} from "../lib/measurements";

/*
    This file contains:
      1. the types that compose a `Recipe` from the datastore.
      2. helper functions for creating, copying, testing the recipe's data
         structures
 */

/**
 * The yield of the recipe. For example, 10 servings, or 2 slices, etc.
 */
export type Yield = {
    // the quantity
    value: number
    // the unit corresponding to the quantity
    unit: string
}

/**
 * The units for the time it takes to make the recipe
 */
export enum TimeUnits {
    MINUTE = 'minute', HOUR = 'hour', DAY = 'day', MONTH = 'month'
}

/**
 * The time for making the recipe
 */
export type Time = {
    value: number
    unit: TimeUnits
}

const timeConversion: Map<TimeUnits, number> = new Map([
    [TimeUnits.MINUTE, 1],
    [TimeUnits.HOUR, 60],
    [TimeUnits.DAY, 24 * 60],
    [TimeUnits.MONTH, 30 * 24 * 60],
])

export function subtractTime(t1: Time, t2: Time, units: TimeUnits = TimeUnits.MINUTE): Time {
    const v1 = (timeConversion.get(t1.unit) || 1) * t1.value
    const v2 = (timeConversion.get(t2.unit) || 1) * t2.value
    const diff = Math.abs(v2 - v1)
    return {
        value: diff / (timeConversion.get(units) || 1),
        unit: units
    }
}

/**
 * The required time for making the recipe includes the active time
 * (i.e. the time work is required), and the passive time (cooling,
 * baking, rising, etc). The total time equals the active time plus
 * the passive time.
 */
export type RequiredTime = {
    total: Time
    active: Time
}

/**
 * The units for the ingredients
 */
export enum Units {
    MILLIGRAM = 'mg', GRAM = 'g', KILOGRAM = 'kg',
    OUNCE = 'oz', POUND = 'lb',
    MILLILITER = 'ml', LITER = 'l', TEASPOON = 'tsp', TABLESPOON = 'tbsp', FLUID_OUNCE = 'fl oz',
    CUP = 'cup', PINT = 'pt', QUART = 'qt', GALLON = 'gal',
    PIECE = 'piece', PINCH = 'pinch'
}

/**
 * The categories for the units used by the ingredients
 */
export enum UnitCategories {
    MASS = 'Mass',
    WEIGHT = 'Weight',
    VOLUME = 'Volume',
    PIECE = 'Piece'
}

/**
 * The unit name and its associated human-readable value
 */
export type Unit = {
    // the unit name
    value: string
    // the human-readable value
    // label: string
    label: UnitName
}

/**
 * The amount of the ingredient
 */
export type Amount = {
    value: number
    unit: Units
}

export function amountFor(value: number, unit: Units): Amount {
    return {value, unit}
}

/**
 * Determines whether the two amounts are equal to within the specified
 * tolerance, which is in the units of the first amount (a).
 * @param a The first amount
 * @param b The second amount
 * @param tolerance The tolerance in units of the first amount
 * @return `true` if the amounts are within tolerance; `false` otherwise
 */
export function equalWithin(a: Amount, b: Amount, tolerance: number): boolean {
    return convertAmount(b, a.unit)
        .map(bPrime => Math.abs(bPrime.value - a.value) <= tolerance)
        .getOrDefault(false)
    // const bPrime = convertAmount(b, a.unit)
    // return Math.abs(bPrime.value - a.value) <= tolerance
}

/**
 * An ingredient
 */
export type Ingredient = {
    id: string
    section: string | null
    name: string
    brand: string | null
    amount: Amount
}

/**
 * A step in making the recipe
 */
export type Step = {
    id: string
    // section title that allows steps to be organized into sections
    title: string | null
    text: string
}

export type Rating = {
    mean: number
    ratings: number
}

/**
 * The recipe summary information
 */
export type RecipeSummary = {
    _id?: ObjectId
    name: string
    tags: Array<string>
    author: string | null
    addedBy: string | null
    createdOn: number | Long
    modifiedOn: number | null | Long
    ratings: Array<number>
}

/**
 * The full-blown recipe (includes the recipe summary information)
 */
export type Recipe = RecipeSummary & {
    story: string
    yield: Yield
    requiredTime: RequiredTime
    ingredients: Array<Ingredient>
    steps: Array<Step>
    notes: string
}

/*
 | RECIPES
 */
/**
 * Constructs a {@link Recipe} from the json document returned from the datastore
 * @param doc The JSON document describing the recipe
 * @return A {@link Recipe} object
 */
export function asRecipe(doc: WithId<Recipe>): Recipe {
    return {
        _id: doc._id,
        story: doc.story,
        name: doc.name,
        tags: doc.tags,
        author: doc.author,
        addedBy: doc.addedBy,
        yield: doc.yield,
        requiredTime: doc.requiredTime,
        createdOn: doc.createdOn,
        modifiedOn: doc.modifiedOn,
        ratings: doc.ratings,
        ingredients: doc.ingredients,
        steps: doc.steps,
        notes: doc.notes,
    }
}

/**
 * Constructs a {@link RecipeSummary} form the json document returned from the
 * datastore
 * @param doc The JSON document describing the recipe
 * @return A {@link RecipeSummary} object
 */
export function asRecipeSummary(doc: WithId<Recipe>): RecipeSummary {
    return {
        _id: doc._id,
        name: doc.name,
        tags: doc.tags,
        author: doc.author,
        addedBy: doc.addedBy,
        createdOn: doc.createdOn,
        modifiedOn: doc.modifiedOn,
        ratings: doc.ratings,
    }
}

/**
 * Constructs an empty {@link Recipe} object
 * @return A {@link Recipe} object
 */
export function emptyRecipe(): Recipe {
    return {
        _id: null,
        story: '',
        name: '',
        tags: [],
        author: null,
        addedBy: null,
        createdOn: getTime(new Date()),
        modifiedOn: null,
        ratings: [0, 0, 0, 0, 0],
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

export function updateModifiedTimestamp(recipe: Recipe): Recipe {
    return {
        ...recipe,
        modifiedOn: getTime(new Date())
    }
}

export function ratingsFrom(recipe: RecipeSummary): Rating {
    const weightedSum = recipe.ratings
        .reduce((accum, star, index) => accum + star * (index+1))
    const numRatings = recipe.ratings.reduce((accum, num) => accum + num)
    return {
        mean: weightedSum / numRatings,
        ratings: numRatings
    }
}

export function emptyYield(): Yield {
    return {
        value: NaN,
        unit: ''
    }
}

export function isEmptyYield(yielded: Yield): boolean {
    return isNaN(yielded.value) && yielded.unit === ''
}

/*
 | INGREDIENTS
 */
export function emptyIngredient(): Ingredient {
    return {
        id: (new UUID()).toString('hex'),
        section: null,
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
        id: ingredient.id,
        section: ingredient.section,
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
        return `${formatQuantityFor(ingredient.amount.value, ingredient.name)}`
    }
    return `${formatQuantityFor(ingredient.amount.value, ingredient.amount.unit)} ${ingredient.name}`
}

/*
 | STEPS
 */
export function emptyStep(): Step {
    return {
        id: (new UUID()).toString('hex'),
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
