import clientPromise from "./mongodb";
import {Collection, Long, MongoClient, ObjectId} from "mongodb";
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

function removeRecipeId(recipe: Recipe): Recipe {
    return {
        story: recipe.story,
        name: recipe.name,
        yield: recipe.yield,
        requiredTime: recipe.requiredTime,
        createdOn: Long.fromNumber(recipe.createdOn as number),
        modifiedOn: recipe.modifiedOn !== null ? Long.fromNumber(recipe.modifiedOn as number) : null,
        tags: recipe.tags,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        notes: recipe.notes
    }
}

export async function addRecipe(recipe: Recipe): Promise<Recipe> {
    const client = await clientPromise
    const result = await recipeCollection(client).insertOne(removeRecipeId(recipe))
    return await recipeById(result.insertedId?.toString())
}

export async function updateRecipe(recipe: Recipe): Promise<Recipe> {
    const client = await clientPromise
    const result = await recipeCollection(client)
        .replaceOne({_id: new ObjectId(recipe._id)}, removeRecipeId(recipe))
    if (result.acknowledged) {
        if (result.matchedCount !== 1) {
            return Promise.reject(`No recipe found for ID; _id: ${recipe._id}; name: ${recipe.name}`)
        }
        if (result.upsertedCount !== 1 && result.modifiedCount !== 1) {
            return Promise.reject(`Failed to update recipe; _id: ${recipe._id}; name: ${recipe.name}`)
        }
        return await recipeById(recipe._id.toString())
    }
    return Promise.reject(`Request to update recipe was not acknowledged; _id: ${recipe._id}; name: ${recipe.name}`)
}