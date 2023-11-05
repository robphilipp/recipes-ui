const basePermissionsSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["recipeId", "principalId", "principleType", "permission"],
        properties: {
            _id: {},
            recipeId: {
                bsonType: "string",
                description: "must be a recipe ID"
            },
            principalId: {
                bsonType: "string",
                description: "must be a user ID or group ID"
            },
            principleType: {
                bsonType: "object",
                required: ["name", "description"],
                properties: {
                    name: {
                        enum: ["user", "group"],
                        description: "'name' must be principal type ('user', 'group')"
                    },
                    description: {
                        enum: ["User", "Group", "Regular user"],
                        description: "'description' must be a string describing the principal type"
                    }
                }
            },
            // full permissions: c r u d -> 1 1 1 1 = 15; no permissions: c r u d -> 0 0 0 0 = 0
            permission: {
                bsonType: "int",
                minimum: 0,
                maximum: 15,
                description: "must be an integer in the interval [0, 15]"
            }
        }
    }
}

module.exports = {
    baseUsersSchema,

    async up(db) {
        await db.createCollection("users", {validator: baseUsersSchema})
        const usersCollection = await db.collection("users")

        await usersCollection.createIndex({name: 1}, {unique: true})
        await usersCollection.createIndex({email: 1}, {unique: true})
    },

    async down(db) {
        await db.collection('users').drop()
    }
};
