import React, {JSX} from "react";
import {Ingredient, ingredientAsText, Recipe} from "./Recipe";
import {Checkbox, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography} from "@mui/material";
import {useStatus} from "../lib/useStatus";

type Props = {
    recipeId: string
    recipe: Recipe
}

export function IngredientsView(props: Props): JSX.Element {
    const {recipeId, recipe} = props

    const {isIngredientSelected, selectIngredient, unselectIngredient} = useStatus()

    function handleToggleIngredientStatus(ingredient: string) {
        if (isIngredientSelected(recipeId, ingredient)) {
            unselectIngredient(recipeId, ingredient)
        } else {
            selectIngredient(recipeId, ingredient)
        }
    }

    // organize ingredients by section. any ingredient without a section takes on the current
    // section, any ingredient with a section gets added to that section
    type Accumulator = { currentSection: string, accumulated: Map<string, Array<Ingredient>> }
    const initial: Accumulator = {currentSection: "", accumulated: new Map<string, Array<Ingredient>>()}
    const organizedIngredients = recipe.ingredients.reduce(
        (accum, ingredient) => {
            // when the ingredient has an explicit section, then add the ingredient to the ingredients
            // in that section and update the current section to the new section,
            // otherwise add it to the current section
            if (ingredient.section !== null && ingredient.section !== '') {
                accum.currentSection = ingredient.section;
                const accumIngredients = accum.accumulated.get(ingredient.section) || []
                accumIngredients.push(ingredient)
                accum.accumulated.set(ingredient.section, accumIngredients)
            } else {
                const accumIngredients = accum.accumulated.get(accum.currentSection) || []
                accumIngredients.push(ingredient)
                accum.accumulated.set(accum.currentSection, accumIngredients)
            }
            return accum
        },
        initial
    )

    return (
        <List sx={{width: '100%', maxWidth: 650, marginTop: -1}}>
            {Array.from(organizedIngredients.accumulated).map(([section, ingredients]) => {
                return <>
                    {section !== null && section !== '' ?
                        <ListItemText
                            key={`step-list-section-${section}`}
                            sx={{marginBottom: -1, fontWeight: 550, marginLeft: 2}}
                        >
                            <Typography sx={{fontSize: `1.1em`, marginTop: 2, marginBottom: 1}}>
                                {section}
                            </Typography>
                        </ListItemText> :
                        <span/>
                    }
                    {ingredients.map(ingredient => {
                        const labelId = `${recipe.name}-ingredient-list-item-${ingredient.name}-${ingredient.section || ''}`
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
                                    <ListItemText id={labelId}>
                                        {ingredientAsText(ingredient)}
                                    </ListItemText>
                                </ListItemButton>
                            </ListItem>
                        )
                    })}
                </>
            })}
        </List>
    )
}
