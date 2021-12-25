const {baseSchema} = require("./20211225125828-initial-setup");

/**
 * Adds "pinch" to the ingredient's amount unit
 */
function updatedSchema() {
    // copy the base schema and add a "pinch" to the units
    const updatedSchema = {...baseSchema}
    updatedSchema.$jsonSchema.properties.ingredients.items.properties.amount.properties.unit.enum = [
        "mg", "g", "kg", "oz", "lb",
        "ml", "l", "tsp", "tbsp", "fl oz",
        "cup", "pt", "qt", "gal",
        "piece", "pinch"
    ]
    return updatedSchema
}

const schema__v0_1_0 = updatedSchema()

module.exports = {
    schema__v0_1_0,

    async up(db) {
        await db.command({
            collMod: "recipes",
            validator: schema__v0_1_0
        })
    },

    async down(db) {
        await db.command({
            collMod: 'recipes',
            validator: baseSchema
        })
    }
};
