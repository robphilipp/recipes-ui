import Layout from "../../components/Layout";
import Head from "next/head";
import utilStyles from "../../styles/utils.module.css";
import {GetServerSideProps} from "next";
import Date from '../../components/Date'
import React, {useEffect, useState} from "react";
import {Checkbox, Chip, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import axios from "axios";
import {useStatus} from "../../lib/useStatus";
import {Ingredient, ingredientAsText, Recipe, Step} from "../../components/Recipe";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {useRouter} from "next/router";

type Props = {
    recipeId: string
}

export default function RecipeView(props: Props): JSX.Element {
    const {recipeId} = props

    const router = useRouter()

    const {
        isIngredientSelected, selectIngredient, unselectIngredient, clearIngredients,
        isStepSelected, selectStep, unselectStep, clearSteps
    } = useStatus()

    const [recipe, setRecipe] = useState<Recipe>()

    useEffect(
        () => {
            axios
                .get(`/api/recipes/${recipeId}`)
                .then(response => {
                    const recipe = response.data as Recipe
                    setRecipe(recipe)
                })
        },
        [recipeId]
    )

    function handleToggleIngredientStatus(ingredient: string) {
        if (isIngredientSelected(recipeId, ingredient)) {
            unselectIngredient(recipeId, ingredient)
        } else {
            selectIngredient(recipeId, ingredient)
        }
    }

    function handleToggleStepStatus(step: string) {
        if (isStepSelected(recipeId, step)) {
            unselectStep(recipeId, step)
        } else {
            selectStep(recipeId, step)
        }
    }

    // function formatIngredient(ingredient: Ingredient): string {
    //     if (ingredient.amount.unit.toString() === 'piece') {
    //         return `${ingredient.amount.value} ${ingredient.name}`
    //     }
    //     return `${ingredient.amount.value} ${ingredient.amount.unit} ${ingredient.name}`
    // }

    if (recipe === undefined) {
        return <div>Loading...</div>
    }

    return (
        <Layout>
            <Head><title>{recipe.name}</title></Head>
            <article>
                <h1 className={utilStyles.recipeName}>
                    {recipe.name}
                    <IconButton
                        onClick={() => router.push(`/recipes/edit?id=${recipe._id.toString()}`)}
                        color='primary'
                        size='small'
                    >
                        <ModeEditIcon sx={{width: 18, height: 18}}/>
                    </IconButton>
                </h1>
                <div className={utilStyles.recipeObjectId}>{recipe._id}</div>
                <div className={utilStyles.recipeDate}>Created: <Date epochMillis={recipe.createdOn as number}/></div>
                {recipe.modifiedOn != null ?
                    <div className={utilStyles.lightText}>Modified: <Date epochMillis={recipe.modifiedOn as number}/></div> :
                    <span/>
                }
                {recipe.tags.map(tag => (
                    <span style={{paddingRight: 7}} key={`${recipe.name}-tag-${tag}`}>
                                    <Chip label={tag} variant='filled' size='small'/>
                                </span>
                ))}
                <div className={utilStyles.recipeYield}>{recipe.yield.value} {recipe.yield.unit}</div>
                <div className={utilStyles.recipeTimes}>Total time: {recipe.requiredTime.total.value} {recipe.requiredTime.total.unit}</div>
                <div className={utilStyles.recipeTimes}>Active time: {recipe.requiredTime.active.value} {recipe.requiredTime.active.unit}</div>
                <div className={utilStyles.recipeStory}>{recipe.story}</div>
                <h2 className={utilStyles.recipeIngredientsHeader}>Ingredients</h2>
                <div>
                    <List sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper'}}>
                        {recipe.ingredients.map((ingredient: Ingredient) => {
                            const labelId = `${recipe.name}-ingredient-list-item-${ingredient.name}`
                            return (
                                <ListItem key={labelId} disablePadding>
                                    <ListItemButton
                                        role={undefined}
                                        onClick={() => handleToggleIngredientStatus(ingredient.name)}
                                        dense
                                    >
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={isIngredientSelected(recipeId, ingredient.name)}
                                                tabIndex={-1}
                                                disableRipple
                                                size="small"
                                                inputProps={{'aria-labelledby': labelId}}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            id={labelId}
                                            primary={ingredientAsText(ingredient)}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            )
                        })}
                    </List>
                </div>
                <h2 className={utilStyles.headingMd}>Steps</h2>
                <div>
                    <List sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper'}}>
                        {recipe.steps.map((step: Step) => {
                            const labelId = `${recipe.name}-ingredient-list-item-${step.text}`
                            return (
                                <ListItem key={labelId} disablePadding>
                                    <ListItemButton
                                        role={undefined}
                                        onClick={() => handleToggleStepStatus(step.text)}
                                        dense
                                    >
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={isStepSelected(recipeId, step.text)}
                                                tabIndex={-1}
                                                disableRipple
                                                size="small"
                                                inputProps={{'aria-labelledby': labelId}}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            id={labelId}
                                            primary={step.text}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            )
                        })}
                    </List>
                </div>
                <h2 className={utilStyles.headingMd}>Notes</h2>
                <div>{recipe.notes}</div>
            </article>
        </Layout>
    )
}

export const getServerSideProps: GetServerSideProps = async context => {
    return {
        props: {
            recipeId: context.params.id as string
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
