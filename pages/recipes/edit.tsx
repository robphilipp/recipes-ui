import React, {useEffect, useState} from 'react'
import {RecipeEditor} from "../../components/RecipeEditor";
import axios from "axios";
import {useRouter} from "next/router";
import {emptyRecipe, Recipe} from "../../components/Recipe";

export default function UpdateRecipe() {
    const router = useRouter()
    const objectId = router.query.id as string
    console.log("object_id", objectId)

    const [recipe, setRecipe] = useState<Recipe>(() => emptyRecipe())

    useEffect(
        () => {
            axios.get(`/api/recipes/${objectId}`).then(response => setRecipe(response.data as Recipe))
        },
        [objectId]
    )

    function handleSubmitRecipe(recipe: Recipe): void {
        axios.post(`/api/recipes/${recipe._id.toString()}`, recipe)
            .then(response => router.push(`/recipes/${response.data._id.toString()}`))
    }

    return <RecipeEditor recipe={recipe} onSubmit={handleSubmitRecipe}/>
}
