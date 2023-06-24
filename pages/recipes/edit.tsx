import React from 'react'
import {RecipeEditor} from "../../components/recipes/editors/RecipeEditor";
import axios from "axios";
import {useRouter} from "next/router";
import {Recipe, updateModifiedTimestamp} from "../../components/recipes/Recipe";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";

/**
 * Wraps the recipe editor for updating an existing recipe
 * @constructor
 */
export default function UpdateRecipe(): JSX.Element {

    const router = useRouter()
    const objectId = router.query.id as string

    const queryClient = useQueryClient()

    // loads the summaries that match one or more of the accumulated search terms
    const recipeQuery = useQuery(
        ['recipe-by-object-id'],
        () => {
            if (objectId !== undefined) {
                return axios.get(`/api/recipes/${objectId}`)
            }
            return Promise.reject("Object ID for recipe is undefined.")
        }
    )

    // query for updating the recipe's rating
    const updateRecipeQuery = useMutation(
        ['update-recipe'],
        (recipe: Recipe) => axios.post(
            `/api/recipes/${recipe.id}`,
            updateModifiedTimestamp(recipe)
        )
    )

    if (recipeQuery.isLoading || updateRecipeQuery.isLoading) {
        return <span>Loading...</span>
    }
    if (recipeQuery.isError || updateRecipeQuery.isError) {
        return <span>
            {recipeQuery.isError ? <span>Recipe Error: {(recipeQuery.error as Error).message}</span> : <span/>}
            {updateRecipeQuery.isError ? <span>Update Recipe Error: {(updateRecipeQuery.error as Error).message}</span> : <span/>}
        </span>
    }

    const recipe: Recipe = recipeQuery.data.data

    /**
     * Handles the submission of the updated recipe
     * @param recipe The updated recipe
     */
    function handleSubmitRecipe(recipe: Recipe): void {
        updateRecipeQuery.mutate(recipe, {
            onSuccess: () => {
                queryClient
                    .invalidateQueries(['recipe-by-object-id'])
                    .then(() => router.push(`/recipes/${recipe.id}`))
            }
        })
    }

    return <RecipeEditor recipe={recipe} onSubmit={handleSubmitRecipe}/>
}
