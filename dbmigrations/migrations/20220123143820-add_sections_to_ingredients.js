/*
 * Recall that "20220102130048-ingredient_step_sections.js" was an empty
 * migration because I goofed. Because of that we import the migration
 * prior to that and use schema v0.2.0 and export the updated schema as v0.3.0.
 */
const {schema__v0_2_0} = require("./20211226170747-author-ratings");
const {ObjectId, Long, Double} = require("mongodb");

/**
 * Adds `sections` to the main properties, and these sections are to be used to associate
 * each ingredient and step to a section. The `sections` merely provide a list of sections
 * used in the recipe, so that they can be enumerated, but an ingredient or step can have
 * a section that isn't in that list...though that would not be useful
 * @return The updated schema
 */
function updatedSchema() {
    // add section to ingredients
    const ingredients = {
        ...schema__v0_2_0.$jsonSchema.properties.ingredients,
        items: {
            ...schema__v0_2_0.$jsonSchema.properties.ingredients.items,
            required: [...schema__v0_2_0.$jsonSchema.properties.ingredients.items.required, "section"],
            properties: {
                ...schema__v0_2_0.$jsonSchema.properties.ingredients.items.properties,
                section: {
                    bsonType: ["string", "null"],
                    description: "must be a string or null and is optional"
                }
            }
        }
    }

    const updated = {
        ...schema__v0_2_0.$jsonSchema,
        properties: {
            ...schema__v0_2_0.$jsonSchema.properties,
            ingredients
        }
    }

    return {$jsonSchema: updated}
}

function addIngredientsSection(recipe) {
    return {
        _id: recipe._id,
        author: recipe.author,
        addedBy: recipe.addedBy,
        story: recipe.story,
        name: recipe.name,
        yield: recipe.yield,
        requiredTime: recipe.requiredTime,
        createdOn: Long.fromNumber(recipe.createdOn),
        modifiedOn: recipe.modifiedOn !== null ? Long.fromNumber(recipe.modifiedOn) : null,
        tags: recipe.tags,
        ratings: recipe.ratings,
        ingredients: recipe.ingredients.map(ingredient => ({
            ...ingredient,
            amount: {...ingredient.amount, value: Double(ingredient.amount.value)},
            section: ingredient.section || null
        })),
        steps: recipe.steps,
        notes: recipe.notes
    }
}

function removeIngredientsSection(recipe) {
    return {
        _id: recipe._id,
        author: recipe.author,
        addedBy: recipe.addedBy,
        story: recipe.story,
        name: recipe.name,
        yield: recipe.yield,
        requiredTime: recipe.requiredTime,
        createdOn: Long.fromNumber(recipe.createdOn),
        modifiedOn: recipe.modifiedOn !== null ? Long.fromNumber(recipe.modifiedOn) : null,
        tags: recipe.tags,
        ratings: recipe.ratings,
        ingredients: recipe.ingredients.map(ingredient => ({
            ...ingredient,
            amount: {...ingredient.amount, value: Double(ingredient.amount.value)}
        })),
        steps: recipe.steps,
        notes: recipe.notes
    }
}

const schema__v0_3_0 = updatedSchema()

module.exports = {
    schema__v0_3_0,

    async up(db, client) {
        await db.command({
            collMod: "recipes",
            validator: schema__v0_3_0
        })
        // add "section to each ingredient" if the section does not already exist
        const recipes = await db.collection('recipes').find({}).toArray()
        const updated = recipes.map(addIngredientsSection)
        await Promise.all(updated.map(update => {
            const id = new ObjectId(update._id)
            delete update._id
            db.collection('recipes').replaceOne({_id: id}, update)
        }))
    },

    async down(db, client) {
        await db.command({
            collMod: "recipes",
            validator: schema__v0_2_0
        })
        // remove "section" from each ingredient
        const recipes = await db.collection('recipes').find({}).toArray()
        const updated = recipes.map(removeIngredientsSection)
        await Promise.all(updated.map(update => {
            const id = new ObjectId(update._id)
            delete update._id
            db.collection('recipes').replaceOne({_id: id}, update)
        }))
    }
};
