import clientPromise from "./mongodb";
import {Collection, Filter, Long, MongoClient, ObjectId} from "mongodb";
import {asRecipe, asRecipeSummary, Recipe, RecipeSummary} from "../components/recipes/Recipe";
import {RecipesUser} from "../components/users/RecipesUser";
import {RoleType} from "../components/users/Role";
import {permissionById, permissions, principalTypeLiteralFrom, userPermissionsFor} from "./permissions";
import {AccessRights, filteredAccessRights, withReadAccess} from "../components/recipes/RecipePermissions";

if (process.env.mongoDatabase === undefined) {
    throw Error("mongoDatabase not specified in process.env")
}
if (process.env.recipeCollection === undefined) {
    throw Error("recipeCollection not specified in process.env")
}

const MONGO_DATABASE: string = process.env.mongoDatabase
const RECIPE_COLLECTION: string = process.env.recipeCollection

function recipeCollection(client: MongoClient): Collection<Recipe> {
    return client.db(MONGO_DATABASE).collection(RECIPE_COLLECTION)
}

// todo keep this for now (but it will need to be updated for user role and permissions if needed
// /**
//  * Retrieves the number of recipes in the system
//  * @return A {@link Promise} to the recipe count
//  */
// export async function recipeCount(): Promise<number> {
//     try {
//         const client = await clientPromise
//         return await recipeCollection(client).countDocuments()
//     } catch (e) {
//         console.error("Unable to retrieve recipe count", e)
//         return Promise.reject("Unable to retrieve recipe count")
//     }
// }

// todo keep this for now (but it will need to be updated for user role and permissions if needed
// /**
//  * Retrieves the recipes for all the recipes in the system
//  * @return A {@link Promise} the holds the recipes
//  */
// export async function allRecipes(): Promise<Array<Recipe>> {
//     try {
//         const client = await clientPromise
//         return await recipeCollection(client)
//             .find()
//             .map(doc => asRecipe(doc))
//             .toArray()
//     } catch (e) {
//         console.error("Unable to retrieve all recipes", e)
//         return Promise.reject("Unable to retrieve all recipes")
//     }
// }

// todo keep this for now (but it will need to be updated for user role and permissions if needed
// /**
//  * Retrieves the recipe summaries for all the recipes in the system
//  * @return A {@link Promise} to the recipe summaries
//  */
// export async function recipeSummaries(): Promise<Array<RecipeSummary>> {
//     try {
//         const client = await clientPromise
//         return await recipeCollection(client).find().map(doc => asRecipeSummary(doc)).toArray()
//     } catch (e) {
//         console.error("Unable to update recipe", e)
//         return Promise.reject("Unable to update recipe")
//     }
// }

// todo keep this for now (but it will need to be updated for user role and permissions if needed
// /**
//  * Retrieves the recipes whose names contain any of the specified words
//  * @param words The words that the recipes names must have
//  * @return A {@link Promise} to the matching recipes
//  */
// export async function recipesByName(words: Array<string>): Promise<Array<Recipe>> {
//     try {
//         const client = await clientPromise
//         return await recipeCollection(client)
//             .find({name: {$regex: new RegExp(`(${words.join(')|(')})`)}})
//             .map(doc => asRecipe(doc))
//             .toArray()
//     } catch (e) {
//         console.error(`Unable to find recipe whose name has: (${words.join(', ')})`, e)
//         return Promise.reject(`Unable to find recipe whose name has: (${words.join(', ')})`)
//     }
// }

/**
 * Attempts to retrieve the recipe based on its object ID
 * @param id The object ID associated with the document
 * @return The recipe associated with the object ID
 */
export async function recipeById(id: string): Promise<Recipe> {
    try {
        const client = await clientPromise
        const doc = await recipeCollection(client).findOne({_id: new ObjectId(id)})
        if (doc === undefined || doc === null) {
            return Promise.reject(`Unable to find recipe for specified ID; id: ${id}`)
        }
        return asRecipe(doc)
    } catch (e) {
        console.error(`Unable to find recipe with ID: recipe_id: ${id}`, e)
        return Promise.reject(`Unable to find recipe with ID: recipe_id: ${id}`)
    }
}

// todo keep this for now (but it will need to be updated for user role and permissions if needed
// /**
//  * Retrieves the recipe summaries whose names contain any of the specified words
//  * @param words The words a recipe name must contain for it to be considered a match
//  * @return A {@link Promise} to the matching recipe summaries
//  */
// export async function recipeSummariesByName(words: Array<string>): Promise<Array<RecipeSummary>> {
//     try {
//         const client = await clientPromise
//         return await recipeCollection(client)
//             .find({name: {$regex: new RegExp(`(${words.join(')|(')})`)}})
//             .map(doc => asRecipeSummary(doc))
//             .toArray()
//     } catch (e) {
//         console.error(`Unable to find recipe containing words: [${words.join(", ")}]`, e)
//         return Promise.reject(`Unable to find recipe containing words: [${words.join(", ")}]`)
//     }
// }

/**
 * Calculates the recipe-summary filter for the user so that users only see recipes
 * to which they have read access (through permissions, ownership, or as a recipe
 * book admin)
 * @param accessRights The access rights required by the user to access the recipe. Note
 * that this is a {@link Partial} access rights, so that only the required access rights
 * need to be specified. For example, for the user to view a recipe, only the "read"
 * access right needs to be set. This way we don't need to worry about whether the user
 * has "update" access when that shouldn't be part of the query filter.
 * @param user The user requesting access to the summary
 * @return The mongo query filter for returning only recipes to which the user has
 * read access.
 */
async function recipeSummaryFilterFor(user: RecipesUser, accessRights: Partial<AccessRights>): Promise<Filter<Recipe>> {
    const isAdmin = user.role.name === RoleType.ADMIN
    if (isAdmin) {
        return Promise.resolve({})
    }

    const userPermissions = await permissions({
        principalId: user.id,
        principalType: principalTypeLiteralFrom("user"),
        ...accessRights
    })

    return {$or: [
            {ownerId: {$eq: user.id}},
            {_id: {$in: userPermissions.map(perm => new ObjectId(perm.recipeId))}}
        ]
    }
}

// todo need to create a view that holds the recipe summaries and permissions (also for recipes and permissions)
//      so that we can return the access rights for display "edit" and "delete" icons in the summary

/**
 * Retrieves all the recipe summaries whose names or tags contain any of the specified words.
 * @param user The user making the request. This is needed for authorization
 * @param words The words a recipe name or tags must contain to be considered a match
 * @return A {@link Promise} to the matching recipe summaries
 */
export async function recipeSummariesSearch(user: RecipesUser, words?: Array<string>): Promise<Array<RecipeSummary>> {
    if (words === undefined) {
        return Promise.resolve([])
    }

    const userRecipeFilter = await recipeSummaryFilterFor(user, withReadAccess())

    try {
        const client = await clientPromise
        return await recipeCollection(client)
            .find({
                $and: [
                    {...userRecipeFilter},
                    {
                        $or: [
                            {name: {$regex: new RegExp(`(${words.join(')|(')})`, 'i')}},
                            {tags: {$in: words}}
                        ]
                    }

                ]
            })
            .collation({locale: 'en', strength: 2})
            .map(doc => asRecipeSummary(doc))
            .toArray()
    } catch (e) {
        console.error("Unable to update recipe", e)
        return Promise.reject("Unable to update recipe")
    }
}

/**
 * Counts the number of recipe summaries that match the filter words, and to which the
 * user has read access
 * @param user The user requesting the recipe summary count
 * @param words The filter words
 * @return A promise for the number of matching recipe summaries
 */
export async function recipeSummariesCount(user: RecipesUser, words?: Array<string>): Promise<number> {
    if (words === undefined) {
        return Promise.resolve(0)
    }

    const userRecipeFilter = await recipeSummaryFilterFor(user, withReadAccess())

    try {
        const client = await clientPromise
        return await recipeCollection(client)
            .countDocuments({
                $and: [
                    {...userRecipeFilter},
                    {
                        $or: [
                            {name: {$regex: new RegExp(`(${words.join(')|(')})`, 'i')}},
                            {tags: {$in: words}}
                        ]
                    }

                ]
            })
    } catch (e) {
        console.error("Unable to update recipe", e)
        return Promise.reject("Unable to update recipe")
    }
}

// todo keep this for now (but it will need to be updated for user role and permissions if needed
// /**
//  * Retrieves that recipe IDs and converts them to an API path to the recipe.
//  * @return A {@link Promise} to an array of API paths for each recipe
//  */
// export async function allRecipePaths(): Promise<Array<string>> {
//     try {
//         return await recipeSummaries()
//             .then(recipes => recipes
//                 .filter(recipe => recipe.id !== undefined && recipe.id !== null)
//                 // no undefined or null recipes make it past the filter
//                 .map(recipe => recipe.id || "")
//             )
//     } catch (e) {
//         console.error("Unable to update recipe", e)
//         return Promise.reject("Unable to update recipe")
//     }
// }

// todo update for user role and permissions if needed
/**
 * Removes the recipe ID from the recipe and returns a new {@link Recipe} without the
 * ID. Generally this is used to add a new recipe so that the datastore can determine
 * the ID of the new recipe
 * @param recipe The recipe for which to remove the ID
 * @return A new {@link Recipe} whose ID has been removed
 */
function removeRecipeId(recipe: Recipe): Recipe {
    const cleanedRecipe: Recipe = {
        ...recipe,
        createdOn: Long.fromNumber(recipe.createdOn as number),
        modifiedOn: recipe.modifiedOn !== null ? Long.fromNumber(recipe.modifiedOn as number) : null,
    }
    delete cleanedRecipe.id
    return cleanedRecipe
}

// todo update for user role and permissions if needed
/**
 * Adds a new {@link Recipe} to the datastore
 * @param recipe The recipe to add
 * @return A {@link Promise} to the added recipe, which will then contain the recipe ID
 * assigned by the datastore.
 */
export async function addRecipe(recipe: Recipe): Promise<Recipe> {
    try {
        const client = await clientPromise
        const result = await recipeCollection(client).insertOne(removeRecipeId(recipe))
        if (result.insertedId !== undefined && result.insertedId !== null) {
            return await recipeById(result.insertedId.toString())
        }
        return Promise.reject(`Unable to add recipe`)
    } catch (e) {
        console.error("Unable to add recipe", e)
        return Promise.reject("Unable to add recipe")
    }
}

// todo update for user role and permissions if needed
/**
 * Updates the specified recipe in the datastore
 * @param recipe The recipe to update
 * @return A {@link Promise} to the updated recipe
 */
export async function updateRecipe(recipe: Recipe): Promise<Recipe> {
    if (recipe.id === undefined || recipe.id === null) {
        return Promise.reject(`Cannot update recipe when the ID is null or undefined`)
    }
    try {
        const client = await clientPromise
        const result = await recipeCollection(client)
            .replaceOne({_id: new ObjectId(recipe.id)}, removeRecipeId(recipe))
        if (result.acknowledged) {
            if (result.matchedCount !== 1) {
                console.log("Unable to save recipe;", result)
                return Promise.reject(`No recipe found for ID; _id: ${recipe.id}; name: ${recipe.name}`)
            }
            if (result.upsertedCount !== 1 && result.modifiedCount !== 1) {
                return Promise.reject(`Failed to update recipe; _id: ${recipe.id}; name: ${recipe.name}`)
            }
            return await recipeById(recipe.id)
        }
    } catch (e) {
        console.error("Unable to update recipe", e)
    }
    return Promise.reject(`Request to update recipe was not acknowledged; _id: ${recipe.id}; name: ${recipe.name}`)
}

// todo keep this for now (but it will need to be updated for user role and permissions if needed
// /**
//  * Updates the specified recipes in the datastore
//  * @param recipes The recipe to update
//  * @return A {@link Promise} to the updated recipes
//  */
// export async function updateRecipes(recipes: Array<Recipe>): Promise<Array<Recipe>> {
//     return Promise.all(recipes.map(updateRecipe))
// }

// todo update for user role and permissions if needed
/**
 * Deletes the recipe, for the specified ID, from the datastore.
 * @param recipeId The ID of the recipe to delete
 * @return A {@link Promise} to the deleted recipe
 */
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
            return Promise.reject(
                `Request to delete recipe was not acknowledged; _id: ${recipeId}; name: ${recipe.name}`
            )
        }
        if (result.deletedCount < 1) {
            return Promise.reject(`Unable to delete recipe; _id: ${recipeId}; name: ${recipe.name}`)
        }
        return Promise.resolve(recipe)
    } catch (e) {
        console.error("Unable to delete recipe", e)
        return Promise.reject("Unable to update recipe")
    }
}

// todo update for user role and permissions if needed
/**
 * Updates the ratings for the recipe with the specified ID
 * @param recipeId The ID of the recipe for which to update the ratings
 * @param newRating The new rating
 * @param ratings The array of counts that each rating value has received
 * @return A {@link Promise} to the recipe with the updated ratings
 */
export async function updateRatings(recipeId: string, newRating: number, ratings: Array<number>): Promise<Recipe> {
    try {
        if (newRating < 1 || newRating > ratings.length) {
            return Promise.reject(
                `Invalid rating: ratings must be in [1, 5]; rating: ${newRating}; recipe_id: ${recipeId}`
            )
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
        console.error("Unable to update recipe ratings", e)
    }
    return Promise.reject(`Request to update recipe ratings was not acknowledged; _id: ${recipeId}`)
}