import {ParseType, toRecipe} from "@saucie/recipe-parser"

const {recipe, errors} = toRecipe(`dough
            1 1/2 cp all-purpose flour
            1 tsp vanilla extract,
            sauce
            1 cup milk
            1 egg`,
    {deDupSections: true, inputType: ParseType.INGREDIENTS}
)

console.log("recipe", recipe)