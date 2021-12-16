import {Long, ObjectId, WithId} from "mongodb";
import {getMilliseconds, getTime} from "date-fns/fp";
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

export type UnitCategory = {
    category: UnitCategories
    units: Array<Unit>
}
const unitFrom = (unit: Units, label: string): Unit => ({value: unit, label})

// export const unitsByCategory: Array<UnitCategory> = [
//     {
//         category: UnitCategories.MASS,
//         units: [unitFrom(Units.MILLIGRAM, 'milligram'), unitFrom(Units.GRAM, 'gram'), unitFrom(Units.KILOGRAM, 'kilogram')]
//     },
//     {
//         category: UnitCategories.WEIGHT,
//         units: [unitFrom(Units.OUNCE, 'ounce'), unitFrom(Units.POUND, 'pound')]
//     },
//     {
//         category: UnitCategories.VOLUME,
//         units: [unitFrom(Units.MILLILITER, 'milliliter'), unitFrom(Units.LITER, 'liter'), unitFrom(Units.TEASPOON, 'teaspoon'), unitFrom(Units.TABLESPOON, 'tablespoon'), unitFrom(Units.FLUID_OUNCE, 'fluid ounce'), unitFrom(Units.CUP, 'cup'), unitFrom(Units.PINT, 'pint'), unitFrom(Units.QUART, 'quart'), unitFrom(Units.GALLON, 'gallon')]
//     },
//     {
//         category: UnitCategories.PIECE,
//         units: [unitFrom(Units.PIECE, 'piece')]
//     }
// ]
export const unitsByCategory = new Map<UnitCategories, Array<Unit>>([
    [UnitCategories.MASS, [unitFrom(Units.MILLIGRAM, 'milligram'), unitFrom(Units.GRAM, 'gram'), unitFrom(Units.KILOGRAM, 'kilogram')]],
    [UnitCategories.WEIGHT, [unitFrom(Units.OUNCE, 'ounce'), unitFrom(Units.POUND, 'pound')]],
    [UnitCategories.VOLUME, [unitFrom(Units.MILLILITER, 'milliliter'), unitFrom(Units.LITER, 'liter'), unitFrom(Units.TEASPOON, 'teaspoon'), unitFrom(Units.TABLESPOON, 'tablespoon'), unitFrom(Units.FLUID_OUNCE, 'fluid ounce'), unitFrom(Units.CUP, 'cup'), unitFrom(Units.PINT, 'pint'), unitFrom(Units.QUART, 'quart'), unitFrom(Units.GALLON, 'gallon')]],
    [UnitCategories.PIECE, [unitFrom(Units.PIECE, 'piece')]]
])

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
    // _id?: string
    name: string
    tags: Array<string>
    createdOn: number | Long
    modifiedOn: number | null | Long
}

export type Recipe = RecipeSummary & {
    yield: Yield
    ingredients: Array<Ingredient>
    steps: Array<Step>
    notes: string
}

export function asRecipe(doc: WithId<Recipe>): Recipe {
// export function asRecipe(doc: Recipe): Recipe {
    return {
        _id: doc._id,
        // _id: doc._id.toString(),
        name: doc.name,
        tags: doc.tags,
        yield: doc.yield,
        createdOn: doc.createdOn,
        modifiedOn: doc.modifiedOn,
        ingredients: doc.ingredients,
        steps: doc.steps,
        notes: doc.notes
    }
}

export function asRecipeSummary(doc: WithId<Recipe>): RecipeSummary {
// export function asRecipeSummary(doc: Recipe): RecipeSummary {
    return {
        _id: doc._id,
        // _id: doc._id.toString(),
        name: doc.name,
        tags: doc.tags,
        createdOn: doc.createdOn,
        modifiedOn: doc.modifiedOn
    }
}

export function emptyRecipe(): Recipe {
    return {
        _id: null,
        name: '',
        tags: [],
        createdOn: getTime(new Date()),
        modifiedOn: null,
        yield: {value: 0, unit: ''},
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