/*
 */
const {schema__v0_3_0} = require("./20220123143820-add_sections_to_ingredients");
const {Long, Double} = require("mongodb");

/**
 * Adds an owner ID to the recipe table, which is a reference to the user that owns
 * the recipe.
 * @return The updated schema
 */
function updatedSchema() {
    const ownerId = {
        bsonType: ["string"],
        description: "must be an object id"
    }

    const updated = {
        ...schema__v0_3_0.$jsonSchema,
        required: [...schema__v0_3_0.$jsonSchema.required, "ownerId"],
        properties: {
            ...schema__v0_3_0.$jsonSchema.properties,
            ownerId
        }
    }

    return {$jsonSchema: updated}
}

function addOwnerId(recipe, ownerId) {
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
            amount: {...ingredient.amount, value: new Double(ingredient.amount.value)},
            section: ingredient.section || null
        })),
        steps: recipe.steps,
        notes: recipe.notes,
        ownerId: ownerId
    }
}

function removeOwnerId(recipe) {
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
            amount: {...ingredient.amount, value: new Double(ingredient.amount.value)},
            section: ingredient.section || null
        })),
        steps: recipe.steps,
        notes: recipe.notes,
    }
}

const schema__v0_4_0 = updatedSchema()

module.exports = {
    schema__v0_4_0,

    async up(db) {
        await db.command({
            collMod: "recipes",
            validator: schema__v0_4_0
        })
        // find the admin user and set it as the owner of all the recipes
        const users = await db.collection('users').find({name: 'admin'}).toArray()
        if (users.length !== 1) {
            return Promise.reject(`One and only one admin user may exist; num_found: ${users.length}`)
        }

        // run through all the recipes, adding the string version of the owner's _id to
        // the recipe in the 'ownerId' field
        const recipes = await db.collection('recipes').find({}).toArray()
        const updated = recipes.map(recipe => addOwnerId(recipe, users[0]._id.toString()))

        await Promise.all(updated.map(update => {
            db.collection('recipes').replaceOne({_id: update._id}, update)
        }))
    },

    async down(db) {
        await db.command({
            collMod: "recipes",
            validator: schema__v0_3_0
        })
        // remove "ownerId" from each ingredient
        const recipes = await db.collection('recipes').find({}).toArray()
        const updated = recipes.map(removeOwnerId)
        await Promise.all(updated.map(update => {
            db.collection('recipes').replaceOne({_id: update._id}, update)
        }))
    }
};
