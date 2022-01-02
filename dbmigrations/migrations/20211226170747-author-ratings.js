const {schema__v0_1_0} = require("./20211225132708-units-add-pinch")

/**
 * Adds three fields:
 * 1. author - the creator of the recipe
 * 2. addedBy - who added the recipe
 * 3. ratings - an array holding the number of ratings for each star (1-5) which the
 *    recipe has received
 * @return the updated schema
 */
function updatedSchema() {
    const author = {
        bsonType: "string",
        description: "must be a string"
    }
    const addedBy = {
        bsonType: "string",
        description: "must be a string"
    }
    const ratings = {
        bsonType: ["array"],
        minItems: 5,
        maxItems: 5,
        items: {
            bsonType: "int",
            description: "must be an array of strings and is optional"
        }
    }
    const updatedProperties = {
        ...schema__v0_1_0.$jsonSchema.properties,
        author,
        addedBy,
        ratings
    }
    const updated = {
        ...schema__v0_1_0.$jsonSchema,
        required: [...schema__v0_1_0.$jsonSchema.required, "ratings"],
        properties: updatedProperties
    }
    return {$jsonSchema: updated}
}

const schema__v0_2_0 = updatedSchema()

module.exports = {
    schema__v0_2_0,

    async up(db) {
        await db.command({
            collMod: "recipes",
            validator: schema__v0_2_0
        })
        await db.collection('recipes').updateMany(
            {},
            {$set: {ratings: [0, 0, 0, 0, 0]}}
        )
    },

    async down(db) {
        await db.collection('recipes').updateMany(
            {},
            {$unset: {author: "", addedBy: "", ratings: null}}
        )
        await db.command({
            collMod: "recipes",
            validator: schema__v0_1_0
        })
    }
};
