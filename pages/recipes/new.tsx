import React from 'react'
import {RecipeEditor} from "../../components/recipes/editors/RecipeEditor";
import axios from "axios";
import {useRouter} from "next/router";
import { Recipe } from '../../components/recipes/Recipe';

/**
 * Wraps the recipe editor for creating new recipes
 * @constructor
 */
export default function NewRecipe(): JSX.Element {
    const router = useRouter()

    function handleSubmitRecipe(recipe: Recipe): void {
        axios
            .put('/api/recipes/new', recipe)
            .then(response => router.push(`/recipes/${response.data.id}`))
    }

    return <RecipeEditor onSubmit={handleSubmitRecipe}/>
}