const basePermissionsSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["recipeId", "principalId", "principleType", "create", "read", "update", "delete"],
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
            create: {
                bsonType: "boolean",
                description: "must have an access right of 'true' or 'false'"
            },
            read: {
                bsonType: "boolean",
                description: "must have an access right of 'true' or 'false'"
            },
            update: {
                bsonType: "boolean",
                description: "must have an access right of 'true' or 'false'"
            },
            delete: {
                bsonType: "boolean",
                description: "must have an access right of 'true' or 'false'"
            },
        }
    }
}

module.exports = {
    basePermissionsSchema,

    async up(db) {
        await db.createCollection("permissions", {validator: basePermissionsSchema})
        const permissionsCollection = await db.collection("permissions")

        // only allow one entry for a (recipe, principal), and because the principal
        // can be either a user or a group, we pull in the principal type
        await permissionsCollection.createIndex({recipeId: 1, principalId: 1, principalType: ''}, {unique: true})
    },

    async down(db) {
        await db.collection('users').drop()
    }
};
