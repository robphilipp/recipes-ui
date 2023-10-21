import {GetServerSideProps} from "next";
import React, {JSX} from "react";
import axios from "axios";
import {useRouter} from "next/router";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import RecipeView from "../../components/recipes/views/RecipeView";

type Props = {
    recipeId: string
}

/**
 * Displays the recipe
 * @param props The property holding the recipe ID
 * @constructor
 */
export default function RecipeViewer(props: Props): JSX.Element {
    const {recipeId} = props

    const router = useRouter()
    const queryClient = useQueryClient()

    // loads the summaries that match one or more of the accumulated search terms
    const recipeQuery = useQuery(
        ['recipe'],
        () => {
            const id = recipeId ? recipeId : (router.query.id as string)
            return axios.get(`/api/recipes/${id}`)
        }
    )

    // query for updating the recipe's rating
    const updateRatingQuery = useMutation(
        ['update-recipe-rating'],
        (rating: number) => axios.post(
            `/api/recipes/ratings/${recipeId}`,
            {newRating: rating, ratings: recipeQuery.data?.data.ratings}
        )
    )

    if (recipeQuery.isLoading || updateRatingQuery.isLoading) {
        return <span>Loading...</span>
    }
    if (recipeQuery.isError || updateRatingQuery.isError) {
        return <span>
            {recipeQuery.isError ? <span>Recipe Error: {(recipeQuery.error as Error).message}</span> : <span/>}
            {updateRatingQuery.isError ? <span>Update Rating Error: {(updateRatingQuery.error as Error).message}</span> : <span/>}
        </span>
    }

    /**
     * Handles updates to the recipe's rating
     * @param rating The new rating
     */
    function handleRatingChange(rating: number): void {
        updateRatingQuery.mutate(rating, {
            onSuccess: async () => {
                await queryClient.invalidateQueries(['recipe'])
            }
        })
    }

    return <RecipeView recipe={recipeQuery.data.data} handleRatingChange={handleRatingChange}/>
}

// noinspection JSUnusedGlobalSymbols
export const getServerSideProps: GetServerSideProps = async context => {
    return {
        props: {
            recipeId: context.params?.id as string
        }
    }
}

/*
 ** the code below "works", but I haven't yet figured out how to have the
 ** page re-rendered upon save.

export const getStaticProps: GetStaticProps = async (context: GetStaticPropsContext) => {
    console.log(`[id] get static props`, context.params)
    const recipeId = context.params?.id as string || ""
    const recipe = await recipeById(recipeId)
    console.log("recipe", recipe)
    // return {
    //     props: {recipe},
    //     // revalidate: 1
    // }
    // const recipeId = context.params?.id || ""
    // const recipe: Recipe = await axios
    //     .get(`http://localhost:3000/api/recipes/${recipeId}`)
    //     .then(response => response.data)
    //     .catch(error => console.log(`getStaticProps failed: ${error.error}`))
    return {
        props: {recipeId, recipe, revalidate: 3}
    }
}

export const getStaticPaths: GetStaticPaths = async () => {
    const ids = await allRecipePaths()
    // const recipes: Array<Recipe> = await axios
    //     .get(
    //         `http://localhost:3000/api/recipes/summaries?name=%20`
    //     )
    //     .then(response => response.data)
    //     .catch(error => console.log(`getStaticPaths failed: ${error.error}`))
    //
    // const paths = recipes.map(recipe => ({
    //     params: { id: recipe._id?.toString() || "" },
    // }))

    const paths = ids.map(id => ({params: { id }}))
    return { paths, fallback: false }
}

*/