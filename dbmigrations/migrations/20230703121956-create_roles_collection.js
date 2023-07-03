const baseRolesSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["name", "description"],
        properties: {
            _id: {},
            name: {
                enum: ["admin", "account_admin", "user"],
                description: "must be either 'admin' or 'user'"
            },
            description: {
                bsonType: "string",
                description: "must be a string and is required"
            }
        }
    }
}

/**
 *
 * @type {{baseUserRolesSchema: {$jsonSchema: {bsonType: string, required: *[], properties: {roleId: {bsonType: string, description: string}, _id: {}, userId: {bsonType: string, description: string}}}}, baseRolesSchema: {$jsonSchema: {bsonType: string, required: string[], properties: {role: {description: string, enum: string[]}, _id: {}}}}, up(*): Promise<void>, down(*): Promise<void>}}
 */
module.exports = {
    baseRolesSchema,

    async up(db) {
        await  db.createCollection("roles", {validator: baseRolesSchema})
        const rolesCollection = await db.collection("roles")

        await rolesCollection.insertOne({name: "admin", description: "RecipeBook admin"})
        await rolesCollection.insertOne({name: "account_admin", description: "Account admin"})
        await rolesCollection.insertOne({name: "user", description: "Regular user"})
    },

    async down(db) {
        await db.collection("roles").drop()
    }
}
