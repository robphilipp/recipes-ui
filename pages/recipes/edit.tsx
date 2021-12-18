import React, {useEffect, useState} from 'react'
import {RecipeEditor} from "../../components/RecipeEditor";
import axios from "axios";
import {useRouter} from "next/router";
import {emptyRecipe, Recipe, updateModifiedTimestamp} from "../../components/Recipe";
import {getTime} from "date-fns/fp";

export default function UpdateRecipe() {
    const router = useRouter()
    const objectId = router.query.id as string

    const [recipe, setRecipe] = useState<Recipe>(() => emptyRecipe())

    useEffect(
        () => {
            axios.get(`/api/recipes/${objectId}`).then(response => setRecipe(response.data as Recipe))
        },
        [objectId]
    )

    function handleSubmitRecipe(recipe: Recipe): void {
        axios
            .post(`/api/recipes/${recipe._id.toString()}`, updateModifiedTimestamp(recipe))
            .then(response => router.push(`/recipes/${response.data._id.toString()}`))
    }

    return <RecipeEditor recipe={recipe} onSubmit={handleSubmitRecipe}/>
}
