import clientPromise from "./mongodb";
import {Collection, MongoClient, WithId} from "mongodb";

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
    name: string
    tags: Array<string>
    createdOn: number
    modifiedOn: number | null
}

export type Recipe = RecipeSummary & {
    _id: string
    yield: Yield
    ingredients: Array<Ingredient>
    steps: Array<Step>
    notes: string
}

const MONGO_DATABASE: string = process.env.mongoDatabase
const RECIPE_COLLECTION: string = process.env.recipeCollection
const recipeCollection = (client: MongoClient): Collection<Recipe> => client.db(MONGO_DATABASE).collection(RECIPE_COLLECTION)

const asRecipe = (doc: WithId<Recipe>): Recipe => ({
    _id: doc._id.toString(),
    name: doc.name,
    tags: doc.tags,
    yield: doc.yield,
    createdOn: doc.createdOn,
    modifiedOn: doc.modifiedOn,
    ingredients: doc.ingredients,
    steps: doc.steps,
    notes: doc.notes
})

const asRecipeSummary = (doc: WithId<Recipe>): RecipeSummary => ({
    name: doc.name,
    tags: doc.tags,
    createdOn: doc.createdOn,
    modifiedOn: doc.modifiedOn
})

export async function allRecipes(): Promise<Array<Recipe>> {
    const client = await clientPromise
    return await recipeCollection(client)
        .find()
        .map(doc => asRecipe(doc))
        .toArray()
    // return axios.get(process.env.recipesApi).then(response => response.data)
}

export async function recipeSummaries(): Promise<Array<RecipeSummary>> {
    const client = await clientPromise
    return await recipeCollection(client).find().map(doc => asRecipeSummary(doc)).toArray()
    // return axios.get(process.env.recipesApi).then(response => response.data)
}

export async function recipesByName(words: Array<string>): Promise<Array<Recipe>> {
    const client = await clientPromise
    return await recipeCollection(client)
        .find({name: {$regex: new RegExp(`(${words.join(')|(')})`)}})
        .map(doc => asRecipe(doc))
        .toArray()
}

export async function recipeSummariesByName(words: Array<string>): Promise<Array<RecipeSummary>> {
    const client = await clientPromise
    return await recipeCollection(client)
        .find({name: {$regex: new RegExp(`(${words.join(')|(')})`)}})
        .map(doc => asRecipeSummary(doc))
        .toArray()
}

export async function allRecipePaths(): Promise<Array<string>> {
    return recipeSummaries()
        .then(recipes => recipes.map(recipe => recipe.name.replace(/ /, '_')))
    // return axios
    //     .get(process.env.recipesApi)
    //     .then(response => response.data.map(recipe => recipe.name.replace(/ /, '_')))
}