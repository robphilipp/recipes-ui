# City Recipes Change History

## version 0.4.1 (free-form editor bug fix)
Fix bug where error was not being cleared when fixed.

## version 0.4.0 (create pdf; bug fix)
1. Recipes can now be exports as PDF for sharing with friends and family.
2. Fixed bugs when free-form editors where called and no items existed yet.

## version 0.3.0 (free form editing)
Added free form editing for ingredients and steps to make it easier to enter and update recipes.

## version 0.2.0 (basic conversions)
Added basic conversions and conversion calculator.

## version 0.1.0 (first tagged version)
**Requires mongo database migration to `20220124232636-ingredient_sections_null.js`**

1. Adds a "section" property to the ingredients.
2. Updates the way "sections" are treated and view for "ingredients" and "steps".
3. Adds the site name and version to medium and large views.
