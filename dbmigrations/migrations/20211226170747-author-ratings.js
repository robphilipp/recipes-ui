const {schema__v0_1_0} = require("./20211225132708-units-add-pinch")

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
