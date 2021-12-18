import React from 'react'
import {RecipeEditor} from "../../components/RecipeEditor";
import axios from "axios";
import {useRouter} from "next/router";
import { Recipe } from '../../components/Recipe';

export default function NewRecipe(): JSX.Element {
    const router = useRouter()

    function handleSubmitRecipe(recipe: Recipe): void {
        axios.put('/api/recipes/new', recipe)
            .then(response => router.push(`/recipes/${response.data._id.toString()}`))
    }

    return <RecipeEditor onSubmit={handleSubmitRecipe}/>
}