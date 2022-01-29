const {schema__v0_3_0} = require("./20220123143820-add_sections_to_ingredients");
const {ObjectId, Long, Double} = require("mongodb");
const {schema__v0_2_0} = require("./20211226170747-author-ratings");

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

module.exports = {
    schema__v0_3_0,

    async up(db, client) {
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
        // remove the ingredient's "section" from the schema (which will also
        // be done in the previous migration, I goofed here as well)
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
