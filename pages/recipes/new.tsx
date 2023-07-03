import React, {JSX} from 'react'
import {RecipeEditor} from "../../components/recipes/editors/RecipeEditor";
import axios from "axios";
import {useRouter} from "next/router";
import { Recipe } from '../../components/recipes/Recipe';
import {useSession} from "next-auth/react";

/**
 * Wraps the recipe editor for creating new recipes
 * @constructor
 */
export default function NewRecipe(): JSX.Element {
    const router = useRouter()
    const {data: session} = useSession()

    function handleSubmitRecipe(recipe: Recipe): void {
        // this recipe was added by the logged-in user (this is essentially the owner)
        recipe.addedBy = session?.user?.email || null
        axios
            .put('/api/recipes/new', recipe)
            .then(response => router.push(`/recipes/${response.data.id}`))
    }

    return <RecipeEditor onSubmit={handleSubmitRecipe}/>
}