import clientPromise from "./mongodb";
import {Collection, Long, MongoClient, ObjectId} from "mongodb";
import {asRecipe, asRecipeSummary, Recipe, RecipeSummary} from "../components/Recipe";

const MONGO_DATABASE: string = process.env.mongoDatabase
const RECIPE_COLLECTION: string = process.env.recipeCollection
const recipeCollection = (client: MongoClient): Collection<Recipe> => client.db(MONGO_DATABASE).collection(RECIPE_COLLECTION)

export async function recipeCount(): Promise<number> {
    try {
        const client = await clientPromise
        return await recipeCollection(client).countDocuments()
    } catch (e) {
        console.error("Unable to update recipe", e)
    }
}

export async function allRecipes(): Promise<Array<Recipe>> {
    try {
        const client = await clientPromise
        return await recipeCollection(client)
            .find()
            .map(doc => asRecipe(doc))
            .toArray()
    } catch (e) {
        console.error("Unable to update recipe", e)
    }
}

export async function recipeSummaries(): Promise<Array<RecipeSummary>> {
    try {
        const client = await clientPromise
        return await recipeCollection(client).find().map(doc => asRecipeSummary(doc)).toArray()
    } catch (e) {
        console.error("Unable to update recipe", e)
    }
}

export async function recipesByName(words: Array<string>): Promise<Array<Recipe>> {
    try {
        const client = await clientPromise
        return await recipeCollection(client)
            .find({name: {$regex: new RegExp(`(${words.join(')|(')})`)}})
            .map(doc => asRecipe(doc))
            .toArray()
    } catch (e) {
        console.error("Unable to update recipe", e)
    }
}

/**
 * Attempts to retrieve the recipe based on its object ID
 * @param id The object ID associated with the document
 * @return The recipe associated with the object ID
 */
export async function recipeById(id: string): Promise<Recipe> {
    try {
        const client = await clientPromise
        console.log("recipe id", id)
        return await recipeCollection(client)
            .findOne({_id: new ObjectId(id)})
            .then(doc => asRecipe(doc))
    } catch (e) {
        console.error("Unable to update recipe", e)
    }
}

export async function recipeSummariesByName(words: Array<string>): Promise<Array<RecipeSummary>> {
    try {
        const client = await clientPromise
        return await recipeCollection(client)
            .find({name: {$regex: new RegExp(`(${words.join(')|(')})`)}})
            .map(doc => asRecipeSummary(doc))
            .toArray()
    } catch (e) {
        console.error("Unable to update recipe", e)
    }
}

export async function recipeSummariesSearch(words: Array<string>): Promise<Array<RecipeSummary>> {
    try {
        const client = await clientPromise
        return await recipeCollection(client)
            .find({
                $or: [
                    {name: {$regex: new RegExp(`(${words.join(')|(')})`, 'i')}},
                    {tags: {$in: words}}
                ]
            })
            .collation({locale: 'en', strength: 2})
            .map(doc => asRecipeSummary(doc))
            .toArray()
    } catch (e) {
        console.error("Unable to update recipe", e)
    }
}

export async function allRecipePaths(): Promise<Array<string>> {
    try {
        return await recipeSummaries()
            .then(recipes => recipes.map(recipe => recipe._id.toString()))
    } catch (e) {
        console.error("Unable to update recipe", e)
    }
}

function removeRecipeId(recipe: Recipe): Recipe {
    return {
        author: recipe.author,
        addedBy: recipe.addedBy,
        // author: recipe.author || '',
        // addedBy: recipe.addedBy || '',
        story: recipe.story,
        name: recipe.name,
        yield: recipe.yield,
        requiredTime: recipe.requiredTime,
        createdOn: Long.fromNumber(recipe.createdOn as number),
        modifiedOn: recipe.modifiedOn !== null ? Long.fromNumber(recipe.modifiedOn as number) : null,
        tags: recipe.tags,
        ratings: recipe.ratings,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        notes: recipe.notes
    }
}

export async function addRecipe(recipe: Recipe): Promise<Recipe> {
    try {
        const client = await clientPromise
        const result = await recipeCollection(client).insertOne(removeRecipeId(recipe))
        return await recipeById(result.insertedId?.toString())
    } catch (e) {
        console.error("Unable to update recipe", e)
    }
}

export async function updateRecipe(recipe: Recipe): Promise<Recipe> {
    try {
        const client = await clientPromise
        const result = await recipeCollection(client)
            .replaceOne({_id: new ObjectId(recipe._id)}, removeRecipeId(recipe))
        if (result.acknowledged) {
            if (result.matchedCount !== 1) {
                console.log("Unable to save recipe;", result)
                return Promise.reject(`No recipe found for ID; _id: ${recipe._id}; name: ${recipe.name}`)
            }
            if (result.upsertedCount !== 1 && result.modifiedCount !== 1) {
                return Promise.reject(`Failed to update recipe; _id: ${recipe._id}; name: ${recipe.name}`)
            }
            return await recipeById(recipe._id.toString())
        }
    } catch (e) {
        console.error("Unable to update recipe", e)
    }
    return Promise.reject(`Request to update recipe was not acknowledged; _id: ${recipe._id}; name: ${recipe.name}`)
}

export async function deleteRecipe(recipeId: string): Promise<Recipe> {
    try {
        const client = await clientPromise
        const recipe = await recipeById(recipeId)
        if (recipe === undefined) {
            return Promise.reject(`Unable to find recipe with ID; _id: ${recipeId}`)
        }

        const result = await recipeCollection(client)
            .deleteOne({_id: new ObjectId(recipeId)})
        if (!result.acknowledged) {
            return Promise.reject(`Request to delete recipe was not acknowledged; _id: ${recipeId}; name: ${recipe.name}`)
        }
        if (result.deletedCount < 1) {
            return Promise.reject(`Unable to delete recipe; _id: ${recipeId}; name: ${recipe.name}`)
        }
        return Promise.resolve(recipe)
    } catch (e) {
        console.error("Unable to update recipe", e)
    }
}

export async function updateRatings(recipeId: string, newRating: number, ratings: Array<number>): Promise<Recipe> {
    try {
        if (newRating < 1 || newRating > ratings.length) {
            return Promise.reject(`Invalid rating: ratings must be in [1, 5]; rating: ${newRating}; recipe_id: ${recipeId}`)
        }

        const updatedRatings = [...ratings]
        updatedRatings[newRating - 1] += 1

        const client = await clientPromise
        const result = await recipeCollection(client).updateOne(
            {_id: new ObjectId(recipeId)},
            {$set: {ratings: updatedRatings}}
        )
        if (result.acknowledged) {
            if (result.matchedCount !== 1) {
                return Promise.reject(`No recipe found for ID; _id: ${recipeId}`)
            }
            if (result.upsertedCount !== 1 && result.modifiedCount !== 1) {
                return Promise.reject(`Failed to update recipe ratings; _id: ${recipeId}`)
            }
            return await recipeById(recipeId)
        }
    } catch (e) {
        console.error("Unable to update recipe", e)
    }
    return Promise.reject(`Request to update recipe was not acknowledged; _id: ${recipeId}`)
}