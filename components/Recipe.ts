import {WithId} from "mongodb";
import {getMilliseconds} from "date-fns/fp";

export type Yield = {
    value: number
    unit: string
}

export enum Units {
    MILLIGRAM = 'mg', GRAM = 'g', KILOGRAM = 'kg',
    OUNCE = 'oz', POUND = 'lb',
    MILLILITER = 'ml', LITER = 'l', TEASPOON = 'tsp', TABLESPOON = 'tbsp', FLUID_OUNCE = 'fl oz',
    CUP = 'cup', PINT = 'pt', QUART = 'qt', GALLON = 'gal',
    PIECE = ''
}

export type Amount = {
    value: number
    unit: Units
}

export type Ingredient = {
    name: string
    brand: string | null
    amount: Amount
}

export type Step = {
    title: string | null
    text: string
}

export type RecipeSummary = {
    _id: string
    name: string
    tags: Array<string>
    createdOn: number
    modifiedOn: number | null
}

export type Recipe = RecipeSummary & {
    yield: Yield
    ingredients: Array<Ingredient>
    steps: Array<Step>
    notes: string
}

export function asRecipe(doc: WithId<Recipe>): Recipe {
    return {
        _id: doc._id.toString(),
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
    return {
        _id: doc._id.toString(),
            name: doc.name,
        tags: doc.tags,
        createdOn: doc.createdOn,
        modifiedOn: doc.modifiedOn
    }
}

export function emptyRecipe(): Recipe {
    return {
        _id: '',
            name: '',
        tags: [],
        createdOn: getMilliseconds(new Date()),
        modifiedOn: null,
        yield: {value: 0, unit: ''},
        ingredients: [],
            steps: [],
        notes: ''
    }
}

export function emptyIngredient(): Ingredient {
    return {
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
        amount: {...ingredient.amount},
        name: ingredient.name,
        brand: ingredient.brand
    }
}

export function unitsFrom(unit: string): Units {
    const [, key] = Object.entries(Units).find(([, value]) => value === unit)
    return key
}
