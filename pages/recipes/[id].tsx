import Head from "next/head";
import {GetServerSideProps} from "next";
import Date from '../../components/Date'
import React, {useEffect, useState} from "react";
import {Chip, IconButton, Rating, Typography, useTheme} from "@mui/material";
import axios from "axios";
import {emptyRecipe, ratingsFrom, Recipe, subtractTime} from "../../components/Recipe";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {useRouter} from "next/router";
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {formatQuantityFor} from "../../lib/utils";
import {jsx} from "@emotion/react";
import {IngredientsView} from "../../components/IngredientsView";
import {StepsView} from "../../components/StepsView";
import JSX = jsx.JSX;
import {PdfConverter} from "../../components/exportrecipes/PdfConverter";

const ratingFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
})
const numRatingsFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
})

type Props = {
    recipeId: string
}

export default function RecipeView(props: Props): JSX.Element {
    const {recipeId} = props

    const theme = useTheme()
    const router = useRouter()

    const [recipe, setRecipe] = useState<Recipe>(emptyRecipe())

    useEffect(
        () => {
            const id = recipeId ? recipeId : (router.query.id as string)
            axios
                .get(`/api/recipes/${id}`)
                .then(response => {
                    const recipe = response.data as Recipe
                    setRecipe(recipe)
                })
        },
        [recipeId, router.query.id]
    )

    function handleRatingChange(rating: number): void {
        console.log("rating", rating)
        axios
            .post(`/api/recipes/ratings/${recipeId}`, {newRating: rating, ratings: recipe.ratings})
            .then(response => {
                const recipe = response.data as Recipe
                setRecipe(recipe)
            })
    }

    if (recipe === undefined) {
        return <div>Loading...</div>
    }

    const rating = ratingsFrom(recipe)
    const beerTime = subtractTime(recipe.requiredTime.total, recipe.requiredTime.active, recipe.requiredTime.total.unit)
    return (
        <>
            <Head><title>{recipe.name}</title></Head>
            <article>
                <Typography sx={{fontSize: '1.5em', fontWeight: 520}}>
                    {recipe.name}
                    <IconButton
                        onClick={() => router.push(`/recipes/edit?id=${recipe._id?.toString()}`)}
                        color='primary'
                        size='small'
                    >
                        <ModeEditIcon sx={{width: 18, height: 18}}/>
                    </IconButton>
                    <PdfConverter recipe={recipe}/>
                </Typography>
                <Typography sx={{fontSize: '0.7em', color: theme.palette.text.secondary}}>
                    {recipe._id}
                </Typography>
                <Typography sx={{fontSize: '0.7em', color: theme.palette.text.secondary}}>
                    Created: <Date epochMillis={recipe.createdOn as number}/>
                </Typography>
                {recipe.modifiedOn != null ?
                    <Typography sx={{fontSize: '0.7em', color: theme.palette.text.secondary}}>
                        Modified: <Date epochMillis={recipe.modifiedOn as number}/>
                    </Typography> :
                    <span/>
                }
                <Typography sx={{fontSize: '0.8em', color: theme.palette.text.primary}}>
                    {recipe.author ? <span style={{marginRight: 25}}>Author: {recipe.author}</span> : <span/>}
                    {recipe.addedBy ? <span>Added By: {recipe.addedBy}</span> : <span/>}
                </Typography>
                {recipe.tags.map(tag => (
                    <span style={{paddingRight: 7}} key={`${recipe.name}-tag-${tag}`}>
                        <Chip label={tag} variant='filled' size='small' sx={{marginTop: 1.5}}/>
                    </span>
                ))}
                <Typography sx={{marginTop: 1.75}}>
                    <Rating
                        name="recipe-rating"
                        defaultValue={0}
                        precision={1}
                        value={rating.mean}
                        onChange={(event, newValue) => {if (newValue !== null ) handleRatingChange(newValue)}}
                    />
                    <Typography sx={{marginTop: -1, fontSize: '0.7em'}}>
                        {ratingFormatter.format(isNaN(rating.mean) ? 0 : rating.mean)} with {numRatingsFormatter.format(rating.ratings)} ratings
                    </Typography>
                </Typography>
                <Typography sx={{marginTop: 1.75}}>
                    Yield: {formatQuantityFor(recipe.yield.value, recipe.yield.unit)}
                </Typography>

                <Typography sx={{fontSize: '0.8em', fontWeight: 540, marginTop: 1}}>
                    <AccessTimeIcon sx={{width: 14, height: 14}}/>
                    <span style={{paddingLeft: 10}}/>
                    {formatQuantityFor(recipe.requiredTime.active.value, recipe.requiredTime.active.unit)} active;
                    <span style={{paddingLeft: 10}}/>
                    {formatQuantityFor(beerTime.value, beerTime.unit)} passive time
                </Typography>

                <Typography paragraph sx={{marginTop: 2}}>
                    <AutoStoriesIcon sx={{marginRight: 1, marginBottom: -0.5}}/> {recipe.story}
                </Typography>

                <Typography sx={{fontSize: `1.25em`, marginTop: 2}}>Ingredients</Typography>
                <IngredientsView recipeId={recipeId} recipe={recipe}/>

                <Typography sx={{fontSize: `1.25em`, marginTop: 2}}>Steps</Typography>
                <StepsView recipeId={recipeId} recipe={recipe}/>
                <Typography sx={{fontSize: `1.25em`, marginTop: 2}}>Notes</Typography>
                <Typography paragraph>{recipe.notes}</Typography>
            </article>
        </>
    )
}

// noinspection JSUnusedGlobalSymbols
export const getServerSideProps: GetServerSideProps = async context => {
    return {
        props: {
            recipeId: context.params?.id as string
        }
    }
}
// export const getStaticPaths: GetStaticPaths = async () => {
//     console.log("[id] get static paths")
//     const paths = await allRecipePaths()
//     return {
//         paths: paths.map(summary => ({params: {id: summary}})),
//         fallback: false
//     }
// }
//
// export const getStaticProps: GetStaticProps = async (context) => {
//     console.log("[id] get static props")
//     // const recipe = await recipesById(context.params.id as string)
//     // return {
//     //     props: {recipe},
//     //     // revalidate: 1
//     // }
//     return {
//         props: {recipeId: context.params.id as string}
//     }
// }
