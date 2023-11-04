import React, {JSX} from "react";
import Head from "next/head";
import {Chip, IconButton, Rating, Typography, useTheme} from "@mui/material";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {PdfConverter} from "../../exportrecipes/PdfConverter";
import Date from "../../Date";
import {formatQuantityFor} from "../../../lib/utils";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import {IngredientsView} from "./IngredientsView";
import {StepsView} from "./StepsView";
import {ratingsFrom, Recipe, subtractTime} from "../Recipe";
import {useRouter} from "next/router";
import {Star, StarBorder} from "@mui/icons-material";
import RecipeRating from "../RecipeRating";

type Props = {
    recipe: Recipe
    handleRatingChange: (rating: number) => void
}

const ratingFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
})
const numRatingsFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
})

export default function RecipeView(props: Props): JSX.Element {

    const {recipe, handleRatingChange} = props

    const theme = useTheme()
    const router = useRouter()

    if (recipe.id === undefined || recipe.id === null) {
        return <div>Invalid recipe ID</div>
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
                        onClick={() => router.push(`/recipes/edit?id=${recipe.id}`)}
                        color='primary'
                        size='small'
                    >
                        <ModeEditIcon sx={{width: 18, height: 18}}/>
                    </IconButton>
                    <PdfConverter recipe={recipe}/>
                </Typography>
                <Typography sx={{fontSize: '0.7em', color: theme.palette.text.secondary}}>
                    {recipe.id}
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
                    <span style={{marginRight: 25}}>Owner: {recipe.ownerId}</span>
                    {recipe.author ? <span style={{marginRight: 25}}>Author: {recipe.author}</span> : <span/>}
                    {recipe.addedBy ? <span>Added By: {recipe.addedBy}</span> : <span/>}
                </Typography>
                {recipe.tags.map(tag => (
                    <span style={{paddingRight: 7}} key={`${recipe.name}-tag-${tag}`}>
                        <Chip label={tag} variant='filled' size='small' sx={{marginTop: 1.5}}/>
                    </span>
                ))}
                <Typography sx={{marginTop: 1.75}}>
                    <RecipeRating rating={rating} handleRatingChange={handleRatingChange}/>
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
                <IngredientsView recipeId={recipe.id} recipe={recipe}/>

                <Typography sx={{fontSize: `1.25em`, marginTop: 2}}>Steps</Typography>
                <StepsView recipeId={recipe.id} recipe={recipe}/>
                <Typography sx={{fontSize: `1.25em`, marginTop: 2}}>Notes</Typography>
                <Typography paragraph>{recipe.notes}</Typography>
            </article>
        </>
    )
}