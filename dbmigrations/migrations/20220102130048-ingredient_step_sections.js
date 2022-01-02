// const {schema__v0_2_0} = require("./20211226170747-author-ratings");
//
// /**
//  * Adds `sections` to the main properties, and these sections are to be used to associate
//  * each ingredient and step to a section. The `sections` merely provide a list of sections
//  * used in the recipe, so that they can be enumerated, but an ingredient or step can have
//  * a section that isn't in that list...though that would not be useful
//  * @return The updated schema
//  */
// function updatedSchema() {
//     const sections = {
//         bsonType: ["array"],
//         maxItems: 10,
//         items: {
//             bsonType: "string",
//             description: "must be an array of strings and is optional"
//         }
//     }
//
//     // add section to ingredients
//     const ingredients = {
//         ...schema__v0_2_0.$jsonSchema.properties.ingredients,
//         items: {
//             ...schema__v0_2_0.$jsonSchema.properties.ingredients.items,
//             required: [...schema__v0_2_0.$jsonSchema.properties.ingredients.items.required, "section"],
//             properties: {
//                 ...schema__v0_2_0.$jsonSchema.properties.ingredients.items.properties,
//                 section: {
//                     bsonType: ["string" | "null"],
//                     description: "must be a string and is optional"
//                 }
//             }
//         }
//     }
//
//     // add section to steps, and remove title from steps
//     const steps = {
//         ...schema__v0_2_0.$jsonSchema.properties.steps,
//         items: {
//             ...schema__v0_2_0.$jsonSchema.properties.steps.items,
//             required: [...schema__v0_2_0.$jsonSchema.properties.steps.items.required, "section"],
//             properties: {
//                 id: schema__v0_2_0.$jsonSchema.properties.steps.items.properties.id,
//                 section: {
//                     bsonType: ["string" | "null"],
//                     description: "must be a string and is optional"
//                 },
//                 text: schema__v0_2_0.$jsonSchema.properties.steps.items.properties.text
//             }
//         }
//     }
//
//     const updatedProperties = {
//         ...schema__v0_2_0.$jsonSchema,
//         sections,
//         ingredients
//     }
//
//     const updated = {
//         ...schema__v0_2_0.$jsonSchema,
//         required: [...schema__v0_2_0.$jsonSchema.required, "sections"],
//         properties: updatedProperties
//     }
//     return {$jsonSchema: updated}
// }
//
// const schema__v0_3_0 = updatedSchema()
//
// module.exports = {
//     async up(db, client) {
//         // update the schema
//         await db.command({
//             collMod: "recipes",
//             validator: schema__v0_3_0
//         })
//         // add section to ingredients
//         await db.collection("recipes").updateMany(
//             {},
//             {$set: {sections: []}}
//         )
//         // for "steps" we need to convert any "title" values to "section" values, and add
//         // the those values to the "sections" of the recipe
//     },
//
//     async down(db, client) {
//         // TODO write the statements to rollback your migration (if possible)
//         // Example:
//         // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
//     }
// };
/**
 * I goofed, so this is just an empty migration
 * @type {{up(*, *): Promise<*>, down(*, *): Promise<*>}}
 */
module.exports = {
    async up(db, client) {
    },

    async down(db, client) {
    }
};
