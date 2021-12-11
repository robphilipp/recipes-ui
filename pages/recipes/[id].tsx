import {Ingredient, Recipe, Step} from "../../lib/recipes";
import Layout from "../../components/Layout";
import Head from "next/head";
import utilStyles from "../../styles/utils.module.css";
import {GetServerSideProps} from "next";
import Date from '../../components/Date'
import {useEffect, useState} from "react";
import {Checkbox, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import axios from "axios";

type Props = {
    recipeId: string
}

export default function RecipeView(props: Props): JSX.Element {
    const {recipeId} = props

    const [recipe, setRecipe] = useState<Recipe>()
    const [ingredientStatus, setIngredientStatus] = useState<Array<boolean>>(() => [])
    const [stepStatus, setStepStatus] = useState<Array<boolean>>(() => [])

    useEffect(
        () => {
            axios
                .get(`/api/recipes/${recipeId}`)
                .then(response => {
                    const recipe = response.data as Recipe
                    setRecipe(recipe)
                    setIngredientStatus(recipe.ingredients.map(() => false))
                    setStepStatus(recipe.steps.map(() => false))
                })
        },
        [recipeId]
    )

    function handleToggleIngredientStatus(index: number) {
        setIngredientStatus(ingredientStatus => {
            const status = [...ingredientStatus]
            status[index] = !status[index]
            return status
        });
    }

    function handleToggleStepStatus(index: number) {
        setStepStatus(stepStatus => {
            const status = [...stepStatus]
            status[index] = !status[index]
            return status
        });
    }

    function formatIngredient(ingredient: Ingredient): string {
        if (ingredient.amount.unit.toString() === 'piece') {
            return `${ingredient.amount.value} ${ingredient.name}`
        }
        return `${ingredient.amount.value} ${ingredient.amount.unit} ${ingredient.name}`
    }

    if (recipe === undefined) {
        return <div>Loading...</div>
    }

    return (
        <Layout>
            <Head><title>{recipe.name}</title></Head>
            <article>
                <h1 className={utilStyles.recipeName}>{recipe.name}</h1>
                <div className={utilStyles.recipeObjectId}>{recipe._id}</div>
                <div className={utilStyles.recipeDate}>Created On: <Date epochMillis={recipe.createdOn}/></div>
                {recipe.modifiedOn != null ?
                    <div className={utilStyles.lightText}>Modified On: <Date epochMillis={recipe.modifiedOn}/></div> :
                    <span/>
                }
                <div className={utilStyles.recipeYield}>{recipe.yield.value} {recipe.yield.unit}</div>
                <h2 className={utilStyles.recipeIngredientsHeader}>Ingredients</h2>
                <div>
                    <List sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper'}}>
                        {recipe.ingredients.map((ingredient: Ingredient, index: number) => {
                            const labelId = `${recipe.name}-ingredient-list-item-${ingredient.name}`
                            return (
                                <ListItem key={labelId} disablePadding>
                                    <ListItemButton
                                        role={undefined}
                                        onClick={() => handleToggleIngredientStatus(index)}
                                        dense
                                    >
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={ingredientStatus[index]}
                                                tabIndex={-1}
                                                disableRipple
                                                size="small"
                                                inputProps={{'aria-labelledby': labelId}}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            id={labelId}
                                            primary={formatIngredient(ingredient)}
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
                        {recipe.steps.map((step: Step, index: number) => {
                            const labelId = `${recipe.name}-ingredient-list-item-${step.text}`
                            return (
                                <ListItem key={labelId} disablePadding>
                                    <ListItemButton
                                        role={undefined}
                                        onClick={() => handleToggleStepStatus(index)}
                                        dense
                                    >
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={stepStatus[index]}
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
