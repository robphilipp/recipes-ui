import clientPromise from "./mongodb";
import {Collection, Long, MongoClient, ObjectId, WithId} from "mongodb";
import {asRecipe, asRecipeSummary, Ingredient, Recipe, RecipeSummary} from "../components/Recipe";

const MONGO_DATABASE: string = process.env.mongoDatabase
const RECIPE_COLLECTION: string = process.env.recipeCollection
const recipeCollection = (client: MongoClient): Collection<Recipe> => client.db(MONGO_DATABASE).collection(RECIPE_COLLECTION)

export async function allRecipes(): Promise<Array<Recipe>> {
    const client = await clientPromise
    return await recipeCollection(client)
        .find()
        .map(doc => asRecipe(doc))
        .toArray()
}

export async function recipeSummaries(): Promise<Array<RecipeSummary>> {
    const client = await clientPromise
    return await recipeCollection(client).find().map(doc => asRecipeSummary(doc)).toArray()
}

export async function recipesByName(words: Array<string>): Promise<Array<Recipe>> {
    const client = await clientPromise
    return await recipeCollection(client)
        .find({name: {$regex: new RegExp(`(${words.join(')|(')})`)}})
        .map(doc => asRecipe(doc))
        .toArray()
}

/**
 * Attempts to retrieve the recipe based on its object ID
 * @param id The object ID associated with the document
 * @return The recipe associated with the object ID
 */
export async function recipeById(id: string): Promise<Recipe> {
    const client = await clientPromise
    console.log("recipe id", id)
    return await recipeCollection(client)
        .findOne({_id: new ObjectId(id)})
        .then(doc => asRecipe(doc))
}

export async function recipeSummariesByName(words: Array<string>): Promise<Array<RecipeSummary>> {
    const client = await clientPromise
    return await recipeCollection(client)
        .find({name: {$regex: new RegExp(`(${words.join(')|(')})`)}})
        .map(doc => asRecipeSummary(doc))
        .toArray()
}

export async function allRecipePaths(): Promise<Array<string>> {
    return await recipeSummaries()
        .then(recipes => recipes.map(recipe => recipe._id.toString()))
}

function convertRecipe(recipe: Recipe): Recipe {
    return {
        // _id: null,
        name: recipe.name,
        yield: recipe.yield,
        createdOn: Long.fromNumber(recipe.createdOn as number),
        modifiedOn: recipe.modifiedOn ? new Long(recipe.createdOn as number) : null,
        tags: recipe.tags,
        ingredients: recipe.ingredients.map(i => ({name: i.name, brand: i.brand, amount: i.amount} as Ingredient)),
        steps: recipe.steps.map(s => ({title: s.title, text: s.text})),
        notes: recipe.notes
    }
}

export async function addRecipe(recipe: Recipe): Promise<Recipe> {
    const client = await clientPromise
    // const cleaned: Recipe = {
    //     ...recipe,
    //     createdOn: Long.fromNumber(recipe.createdOn as number),
    //     modifiedOn: recipe.modifiedOn ? new Long(recipe.createdOn as number) : null
    // }
    const cleaned = convertRecipe(recipe)
    const id = await recipeCollection(client)
        .insertOne(cleaned)
        // .insertOne(recipe, {forceServerObjectId: true})
        // .map(result => result.insertedId)
    return await recipeById(id.insertedId?.toString())
}