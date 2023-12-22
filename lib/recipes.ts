import clientPromise from "./mongodb";
import {Collection, Filter, Long, MongoClient, ObjectId, WithId} from "mongodb";
import {asRecipe, asRecipeSummary, Recipe, RecipeSummary} from "../components/recipes/Recipe";
import {RecipesUser} from "../components/users/RecipesUser";
import {RoleLiteral, RoleType} from "../components/users/Role";
import {
    permissionFor,
    permissions,
    permissionsCollection,
    principalTypeLiteralFrom,
    userPrincipalType
} from "./permissions";
import {
    AccessRights, accessRightsWith,
    fullAccessRights,
    PrincipalType,
    RecipePermission,
    WithPermissions,
    withReadAccess
} from "../components/recipes/RecipePermissions";
import {adminUsers, isAdmin, isUserAdmin} from "./users";

if (process.env.mongoDatabase === undefined) {
    throw Error("mongoDatabase not specified in process.env")
}
if (process.env.recipeCollection === undefined) {
    throw Error("recipeCollection not specified in process.env")
}

const MONGO_DATABASE: string = process.env.mongoDatabase
const RECIPE_COLLECTION: string = process.env.recipeCollection

/**
 * Type that adds (splats) access rights into the object of type T.
 * This is really only meant to be used for the database layer.
 * @see WithPermissions for the type that is used in the domain.
 */
export type WithAccessRights<T> = T & AccessRights

function recipeCollection(client: MongoClient): Collection<Recipe> {
    return client.db(MONGO_DATABASE).collection(RECIPE_COLLECTION)
}

/**
 * Updates the user's access rights based on their role so that, for example, an admin or the owner of the
 * recipe will have full access rights to the recipe
 * @param recipe The recipe with permissions
 * @param user The user requesting access
 * @return A recipes with permission updated to account for role and ownership
 */
function roleEnhanced<T extends RecipeSummary>(recipe: WithPermissions<T>, user: RecipesUser): WithPermissions<T> {
    if (user.role.name === RoleType.ADMIN || user.id === recipe.ownerId) {
        return {...recipe, accessRights: fullAccessRights()}
    }
    return recipe
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
 * @param user The user requesting the recipe
 * @param id The object ID associated with the document
 * @return The recipe associated with the object ID
 */
export async function recipeById(user: RecipesUser, id: string): Promise<Recipe> {
    try {
        const client = await clientPromise
        const doc = await recipeCollection(client)
            // join the recipes and permissions collection
            .aggregate([
                {"$addFields": {"recipe_id": {"$toString": "$_id"}}},
                {
                    $lookup: {
                        from: "permissions",
                        localField: "recipe_id",
                        foreignField: "recipeId",
                        as: "recipePermissions"
                    },
                },
                {
                    $unwind: {
                        path: "$recipePermissions",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $match: {
                        $and: [
                            {...permission(user)},
                            {_id: new ObjectId(id)}
                        ]
                    }
                }
            ])
            .map(doc => roleEnhanced(asRecipe(doc as WithId<WithAccessRights<Recipe>>), user))
            .toArray()
        if (doc === undefined || doc === null || doc.length < 1) {
            return Promise.reject(`Unable to find recipe for specified ID; id: ${id}`)
        }
        return doc[0]
    } catch (e) {
        const message = `Unable to find recipe with ID: recipe_id: ${id}; user_id: ${user.id}`
        console.error(message, e)
        return Promise.reject(message)
    }
}

// export async function recipeById(user: RecipesUser, id: string): Promise<Recipe> {
//     try {
//         const client = await clientPromise
//         const doc = await recipeCollection(client).findOne({_id: new ObjectId(id)})
//         if (doc === undefined || doc === null) {
//             return Promise.reject(`Unable to find recipe for specified ID; id: ${id}`)
//         }
//         return asRecipe(doc)
//     } catch (e) {
//         console.error(`Unable to find recipe with ID: recipe_id: ${id}`, e)
//         return Promise.reject(`Unable to find recipe with ID: recipe_id: ${id}`)
//     }
// }

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


function permission(user: RecipesUser) {
    if (user.role.name === RoleType.ADMIN) {
        return {}
    }
    return {
        $or: [
            {
                $and: [
                    {"recipePermissions.principalId": {$eq: user.id}},
                    {"recipePermissions.read": {$eq: true}},
                ]
            },
            {
                ownerId: {$eq: user.id}
            }
        ]
    }
}

/**
 * Retrieves all the recipe summaries whose names or tags contain any of the specified words.
 * @param user The user making the request. This is needed for authorization
 * @param words The words a recipe name or tags must contain to be considered a match
 * @return A {@link Promise} to the matching recipe summaries
 */
export async function recipeSummariesSearch(user: RecipesUser, words?: Array<string>): Promise<Array<WithPermissions<RecipeSummary>>> {
    if (words === undefined) {
        return Promise.resolve([])
    }

    // const userRecipeFilter = await recipeSummaryFilterFor(user, withReadAccess())
    // when the word is a space, then we want it to match anything, so we replace it
    // with ".*"
    const regexWordPattern = words
        .map(word => word === " " ? ".*" : word)
        .join(')|(')

    try {
        const client = await clientPromise
        return await recipeCollection(client)
            // join the recipes and permissions collection
            .aggregate([
                {"$addFields": {"recipe_id": {"$toString": "$_id"}}},
                {
                    $lookup: {
                        from: "permissions",
                        localField: "recipe_id",
                        foreignField: "recipeId",
                        as: "recipePermissions"
                    },
                },
                {
                    $unwind: {
                        path: "$recipePermissions",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $match: {
                        $and: [
                            {...permission(user)},
                            {
                                $or: [
                                    {name: {$regex: new RegExp(`(${regexWordPattern})`, 'i')}},
                                    {tags: {$in: words}}
                                ]
                            }
                        ]
                    }
                }
            ])
            .map(doc => roleEnhanced(asRecipeSummary(doc as WithId<WithAccessRights<Recipe>>), user))
            .toArray()
    } catch (e) {
        console.error("Unable to update recipe", e)
        return Promise.reject("Unable to update recipe")
    }
}

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

    return {
        $or: [
            {ownerId: {$eq: user.id}},
            {_id: {$in: userPermissions.map(perm => new ObjectId(perm.recipeId))}}
        ]
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
 * @param user The user making the request
 * @param recipe The recipe to add
 * @return A {@link Promise} to the added recipe, which will then contain the recipe ID
 * assigned by the datastore.
 */
export async function addRecipe(user: RecipesUser, recipe: Recipe): Promise<Recipe> {
    try {
        const client = await clientPromise
        const result = await recipeCollection(client).insertOne(removeRecipeId(recipe))
        if (result.insertedId !== undefined && result.insertedId !== null) {
            return await recipeById(user, result.insertedId.toString())
        }
        return Promise.reject(`Unable to add recipe; recipe_id: ${recipe.id}; recipe_name: ${recipe.name}`)
    } catch (e) {
        const message = `Unable to add recipe; recipe_id: ${recipe.id}; recipe_name: ${recipe.name}`
        console.error(message, e)
        return Promise.reject(message)
    }
}

async function permissionsForUser(user: RecipesUser, recipeId: string, ownerId: string): Promise<AccessRights> {
    if (user.role.name === RoleType.ADMIN || user.id === ownerId) {
        return fullAccessRights()
    }
    const permissions = await permissionFor(user.id, userPrincipalType(), recipeId)
    return {...permissions.accessRights}
}

// async function permissionsForGroup(group: RecipeGroup, recipeId: string): Promise<AccessRights> {
//
// }

/**
 * Updates the specified recipe in the datastore
 * @param user The user making the request
 * @param recipe The recipe to update
 * @return A {@link Promise} to the updated recipe
 */
export async function updateRecipe(user: RecipesUser, recipe: Recipe): Promise<Recipe> {
    if (recipe.id === undefined || recipe.id === null) {
        return Promise.reject(`Cannot update recipe when the ID is null or undefined`)
    }

    // ensure that the user has permissions to update the recipe
    const permissions = await permissionsForUser(user, recipe.id, recipe.ownerId)
    if (!permissions.update) {
        const message = `Unable to update recipe; user_id: ${user.id}; recipe_name: ${recipe.name}`
        console.log(message)
        return {...recipe}
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
            return await recipeById(user, recipe.id)
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
 * @param user The user making the request
 * @param recipeId The ID of the recipe to delete
 * @return A {@link Promise} to the deleted recipe
 */
export async function deleteRecipe(user: RecipesUser, recipeId: string): Promise<Recipe> {
    try {
        const client = await clientPromise
        const recipe = await recipeById(user, recipeId)
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
 * @param user The user making the request
 * @param recipeId The ID of the recipe for which to update the ratings
 * @param newRating The new rating
 * @param ratings The array of counts that each rating value has received
 * @return A {@link Promise} to the recipe with the updated ratings
 */
export async function updateRatings(user: RecipesUser, recipeId: string, newRating: number, ratings: Array<number>): Promise<Recipe> {
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
            return await recipeById(user, recipeId)
        }
    } catch (e) {
        console.error("Unable to update recipe ratings", e)
    }
    return Promise.reject(`Request to update recipe ratings was not acknowledged; _id: ${recipeId}`)
}

export async function isRecipeOwner(recipeId: string, userId: string): Promise<boolean> {
    try {
        const client = await clientPromise
        const doc = await recipeCollection(client)
            .findOne({_id: {$eq: new ObjectId(recipeId)}, ownerId: {$eq: userId}})
        return doc !== null && doc !== undefined
    } catch (e) {
        const message = `Unable to find recipe with user; recipe_id: ${recipeId}; user_id: ${userId}`
        console.error(message, e)
        return Promise.reject(message)
    }
}

/**
 * Calculates a map holding the recipe IDs and whether the user owns that recipe
 * @param recipeIds The recipe IDs for which to check ownership
 * @param userId The ID of the user
 * @return a map holding the recipe IDs and whether the user owns that recipe
 */
export async function recipeOwnerStatus(recipeIds: Array<string>, userId: string): Promise<Map<string, boolean>> {
    try {
        const client = await clientPromise
        const recipeOwnership = await recipeCollection(client)
            .find({_id: {$in: recipeIds.map(recipeId => new ObjectId(recipeId))}})
            .map(recipe => [recipe._id.toString(), recipe.ownerId === userId] as [string, boolean])
            .toArray()
        return new Map(recipeOwnership)
    } catch (e) {
        const message = `Unable to find users ownership of recipes; user_id: ${userId}; recipe_ids: [${recipeIds.join(", ")}]`
        console.error(message, e)
        return Promise.reject(message)
    }
}

export async function filterRecipesOwnedBy(userId: string, recipeIds: Array<string>): Promise<Array<string>> {
    const recipeOwnership = await recipeOwnerStatus(recipeIds, userId)
    return Array.from(recipeOwnership.entries())
        .filter(([_, ownership]) => ownership)
        .map(([id, _]) => id)
}

// export type UserRecipePermissions = RecipePermission & { email: string, username: string, role: RoleLiteral }

// todo include admin users with full access rights in the returned array
// /**
//  * Returns a list of user-permission objects for each user that has explicit permissions
//  * for the recipe. Admin users have access to all recipes, and unless explicitly set for
//  * the specified recipe, will not be included in this list.
//  * @param requester
//  * @param recipeId
//  */
// export async function usersPermissionsForRecipe(requester: RecipesUser, recipeId: string, includeAdmins: boolean = false): Promise<Array<UserRecipePermissions>> {
//     if (!await isRecipeOwner(recipeId, requester.id)) {
//         return []
//     }
//     const admins = await adminUsers()
//     if (admins.findIndex(admin => requester.id === admin.id) < 0) {
//         return []
//     }
//
//     try {
//         const client = await clientPromise
//         const userPerms = await permissionsCollection(client)
//             // join the users that have permissions for this recipe
//             .aggregate([
//                 {"$addFields": {"principal_id": {"$toObjectId": "$principalId"}}},
//                 {
//                     $lookup: {
//                         from: "users",
//                         localField: "principal_id",
//                         foreignField: "_id",
//                         as: "usersPermissions"
//                     },
//                 },
//                 {
//                     $replaceRoot: {
//                         newRoot: {
//                             $mergeObjects: [
//                                 {$arrayElemAt: ["$usersPermissions", 0]},
//                                 "$$ROOT"
//                             ]
//                         }
//                     }
//                 },
//                 {
//                     $match: {
//                         $and: [
//                             {deletedOn: {$eq: -1}},
//                             {"principalType.name": {$eq: "user"}},
//                             {recipeId: {$eq: recipeId}}
//                         ]
//                     }
//                 },
//                 {
//                     $project: {
//                         usersPermissions: 0,
//                         id: 0,
//                         principal_id: 0,
//                         password: 0,
//                         createdOn: 0,
//                         modifiedOn: 0,
//                         deletedOn: 0,
//                         emailVerified: 0,
//                         image: 0,
//                     }
//                 }
//             ])
//             .map(doc => doc as UserRecipePermissions)
//             .toArray()
//         if (userPerms === undefined || userPerms === null || userPerms.length < 1) {
//             return Promise.reject(`Unable to find users with permissions for specified recipe; id: ${recipeId}`)
//         }
//
//         if (includeAdmins) {
//             // add all the admin users to the list
//             admins.forEach(admin => userPerms.push({
//                 id: "admin",
//                 recipeId,
//                 email: admin.email ?? "",
//                 principalId: admin.id,
//                 principal: PrincipalType.USER,
//                 username: admin.name ?? "",
//                 role: admin.role,
//                 accessRights: fullAccessRights()
//             }))
//         }
//
//         return userPerms
//     } catch (e) {
//         const message = `Unable to find users with permissions for specified recipe; id: ${recipeId}`
//         console.error(message, e)
//         return Promise.reject(message)
//     }
// }

export async function usersPermissionsForRecipes(requester: RecipesUser, recipeIds: Array<string>, includeAdmins: boolean = false): Promise<Map<string, Array<RecipeWithUserPermissions>>> {
    const ownedRecipes = await filterRecipesOwnedBy(requester.id, recipeIds)
    if (ownedRecipes.length === 0) {
        return new Map()
    }
    const admins = await adminUsers()
    if (admins.findIndex(admin => requester.id === admin.id) < 0) {
        return new Map()
    }
    // if (!(await isUserAdmin(requester.id))) {
    //     return new Map()
    // }

    try {
        const client = await clientPromise
        const userPerms: Array<[string, Array<RecipeWithUserPermissions>]> = await permissionsCollection(client)
            // join the users that have permissions for this recipe
            .aggregate([
                { "$addFields": { "principal_id": {"$toObjectId": "$principalId"}}},
                {
                    $lookup: {
                        from: "users",
                        localField: "principal_id",
                        foreignField: "_id",
                        as: "usersPermissions"
                    },
                },
                {
                    $unwind: {
                        path: "$usersPermissions",
                        preserveNullAndEmptyArrays: true
                    },
                },
                { $match: {
                        $and: [
                            {"usersPermissions.deletedOn": {$eq: -1}},
                            {"principalType.name": {$eq: "user"}},
                            {recipeId: {$in: recipeIds}}
                        ]}
                },
                { $group: {
                        _id: "$recipeId",
                        users: {
                            $addToSet: {
                                principalId: "$principalId",
                                name: "$usersPermissions.name",
                                email: "$usersPermissions.email",
                                accessRights: {
                                    create: "$create",
                                    read: "$read",
                                    update: "$update",
                                    delete: "$delete",
                                },
                                role: "$usersPermissions.role",
                            }
                        }}
                }
            ])
            .map(doc => [
                doc._id.toString(),
                doc.users.map((user: RecipeUserPermissions) => asRecipeWithUserPermissions(user))
            ] as [string, Array<RecipeWithUserPermissions>])
            .toArray()
        if (userPerms === undefined || userPerms === null || userPerms.length < 1) {
            return Promise.reject(`Unable to find users with permissions for specified recipes; recipe_ids: [${recipeIds.join(", ")}]`)
        }

        if (includeAdmins) {
            userPerms.forEach(([_, users]) => {
                admins.forEach(admin => users.push({
                    principalId: "admin",
                    name: admin.name ?? "",
                    email: admin.email ?? "",
                    accessRights: fullAccessRights(),
                    role: admin.role
                }))
            })
        }

        return new Map(userPerms)
    } catch (e) {
        const message = `Unable to find users with permissions for specified recipe; recipe_ids: [${recipeIds.join(", ")}]`
        console.error(message, e)
        return Promise.reject(message)
    }
}

type RecipeUserPermissions = {
    principalId: string
    name: string
    email: string
    accessRights: {
        create: boolean
        read: boolean
        update: boolean
        delete: boolean
    },
    role: RoleLiteral
}

const asRecipeWithUserPermissions = (recipe: RecipeUserPermissions): RecipeWithUserPermissions => ({
    ...recipe,
    accessRights: accessRightsWith(recipe.accessRights.create, recipe.accessRights.read, recipe.accessRights.update, recipe.accessRights.delete)
})

export type RecipeWithUserPermissions = {
    principalId: string
    name: string
    email: string
    accessRights: AccessRights
    role: RoleLiteral
}