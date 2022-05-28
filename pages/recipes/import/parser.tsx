import {ParseType, toRecipe, Recipe} from "@saucie/recipe-parser"
// import {useEffect, useState} from "react";

import {Button, TextareaAutosize} from "@mui/material";
import React, {useState} from "react";

export default function ImportRecipeParser(): JSX.Element {

    const [recipe, setRecipe] = useState<string>('')
    const [parsedRecipe, setParsedRecipe] = useState<Recipe>()

    function recipeToText(recipe: Recipe): string {
        const ingredients = recipe.ingredients.map(ingredient => {
            const section = ingredient.section !== '' ? `${ingredient.section}\n` : ''
            return `${ingredient.amount.quantity} ${ingredient.amount.unit} ${ingredient.ingredient}`
        }).join('\n')
        const steps = recipe.steps.map(step => {
            const section = step.title !== '' ? `${step.title}\n` : ''
            return `${step.step}`
        }).join('\n')

        return `ingredients\n${ingredients}\n steps\n${steps}`
    }

    function handleParse(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        const {recipe: parsedRecipe, errors} = toRecipe(recipe)
        setParsedRecipe(parsedRecipe as Recipe)
    }

    //
    // useEffect(
    //     () => {
    //         const {recipe: parsedRecipe, errors} = toRecipe(`dough
    //         1 1/2 cp all-purpose flour
    //         1 tsp vanilla extract,
    //         sauce
    //         1 cup milk
    //         1 egg`,
    //             {deDupSections: true, inputType: ParseType.INGREDIENTS}
    //         )
    //         setRecipe(parsedRecipe)
    //         console.log("parse errors", errors)
    //     },
    //     []
    // )
    //
    // return <>
    //     <ul>
    //         {recipe.ingredients.map(ingredient => (<li key={ingredient.ingredient}>
    //             ({ingredient.section}) {ingredient.amount.quantity} {ingredient.amount.unit} {ingredient.ingredient}
    //         </li>))}
    //     </ul>
    // </>
    return (
        <>
            <TextareaAutosize
                value={recipe}
                onChange={event => setRecipe(event.currentTarget.value)}
            />
            {parsedRecipe !== undefined ? (
                <ul>
                    {parsedRecipe.ingredients.map(ingredient => (<li key={ingredient.ingredient}>
                        ({ingredient.section}) {ingredient.amount.quantity} {ingredient.amount.unit} {ingredient.ingredient}
                    </li>))}
                </ul>
            ) : <></>
            }
            <Button
                onClick={handleParse}
            >
                Parse
            </Button>
        </>
    )
}