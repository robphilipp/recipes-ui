import {allRecipes, Ingredient, Recipe, Step} from "../../lib/recipes";
import Layout from "../../components/Layout";
import Head from "next/head";
import utilStyles from "../../styles/utils.module.css";
import {GetServerSideProps} from "next";
import Date from '../../components/Date'
import {useState} from "react";
import {Checkbox, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";

type Props = {
    recipe: Recipe
}

export default function RecipeView(props: Props): JSX.Element {
    const {recipe} = props

    const [ingredientStatus, setIngredientStatus] = useState<Array<boolean>>(() => recipe.ingredients.map(() => false))
    const [stepStatus, setStepStatus] = useState<Array<boolean>>(() => recipe.steps.map(() => false))

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

    return (
        <Layout>
            <Head><title>{recipe.name}</title></Head>
            <article>
                <h1 className={utilStyles.recipeName}>{recipe.name}</h1>
                <div className={utilStyles.recipeObjectId}>{recipe._id}</div>
                <div className={utilStyles.recipeDate}>Created On: <Date epochMillis={recipe.createdOn}/></div>
                {recipe.modifiedOn != null ?
                    <div className={utilStyles.lightText}>Modified On: <Date epochMillis={recipe.modifiedOn}/></div> :
                    <span/>}
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
                                            primary={`${ingredient.amount.value} ${ingredient.amount.unit}   ${ingredient.name}`}
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
    const name = (context.params.recipeName as string).replace(/_/, ' ')
    const recipes = await allRecipes().then(response => response.filter(recipe => recipe.name === name))
    return {
        props: {
            recipe: recipes[0]
        }
    }
}