/*
 * Recall that "20220102130048-ingredient_step_sections.js" was an empty
 * migration because I goofed. Because of that we import the migration
 * prior to that and use schema v0.2.0 and export the updated schema as v0.3.0.
 */
const {schema__v0_2_0} = require("./20211226170747-author-ratings");

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

const schema__v0_3_0 = updatedSchema()

module.exports = {
    schema__v0_3_0,

    async up(db, client) {
        await db.command({
            collMod: "recipes",
            validator: schema__v0_3_0
        })
    },

    async down(db, client) {
        await db.command({
            collMod: "recipes",
            validator: schema__v0_2_0
        })
    }
};
