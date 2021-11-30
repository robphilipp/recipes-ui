import axios from "axios";
import clientPromise from "./mongodb";
import {Collection, MongoClient, ObjectId} from "mongodb";

const recipe = {
    "name": "basic pancakes",
    "ingredients": [
        {
            "name": "flour",
            "brand": "King Arthur",
            "amount": {
                "value": 1,
                "unit": "cup"
            }
        },
        {
            "name": "baking powder",
            "brand": "King Arthur",
            "amount": {
                "value": 1,
                "unit": "tsp"
            }
        },
        {
            "name": "baking soda",
            "amount": {
                "value": 0.5,
                "unit": "tsp"
            }
        },
        {
            "name": "milk",
            "amount": {
                "value": 0.5,
                "unit": "cup"
            }
        },
        {
            "name": "oil",
            "amount": {
                "value": 1,
                "unit": "tbsp"
            }
        },
        {
            "name": "egg",
            "amount": {
                "value": 1,
                "unit": "piece"
            }
        }
    ],
    "steps": [
        {"text": "mix dry ingredients"},
        {"text": "add wet ingredients"},
        {"text": "cook on griddle"}
    ]
}

/*
"mg", "g", "kg", "oz", "ozs", "lb", "lbs",
"ml", "l", "tsp", "tsps", "tbsp", "tbsps", "fl oz", "fl ozs",
"cup", "cups", "pt", "pts", "qt", "qts", "gal", "gals", ""
 */
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
    brand?: string
    amount: Amount
}

export type Step = {
    text: string
}

export type RecipeSummary = {
    name: string
    createdOn: number
    modifiedOn: number
}

export type Recipe = RecipeSummary & {
    _id: ObjectId
    ingredients: Array<Ingredient>
    steps: Array<Step>
}

const MONGO_DATABASE: string = process.env.mongoDatabase
const RECIPE_COLLECTION: string = process.env.recipeCollection
const recipeCollection = (client: MongoClient): Collection<Recipe> => client.db(MONGO_DATABASE).collection(RECIPE_COLLECTION)

export async function allRecipes(): Promise<Array<Recipe>> {
    const client = await clientPromise
    return await recipeCollection(client).find()
        .map(doc => ({
            name: doc.name,
            createdOn: doc.createdOn,
            modifiedOn: doc.modifiedOn,
            ingredients: doc.ingredients,
            steps: doc.steps
        } as Recipe))
        .toArray()
    // return axios.get(process.env.recipesApi).then(response => response.data)
}

export async function recipeSummaries(): Promise<Array<RecipeSummary>> {
    const client = await clientPromise
    return await recipeCollection(client).find().map(doc => ({
        name: doc.name,
        createdOn: doc.createdOn,
        modifiedOn: doc.modifiedOn
    })).toArray()
    // return axios.get(process.env.recipesApi).then(response => response.data)
}

export async function allRecipePaths(): Promise<Array<string>> {
    return recipeSummaries()
        .then(recipes => recipes.map(recipe => recipe.name.replace(/ /, '_')))
    // return axios
    //     .get(process.env.recipesApi)
    //     .then(response => response.data.map(recipe => recipe.name.replace(/ /, '_')))
}