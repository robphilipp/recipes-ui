const baseUsersSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["name", "email", "password", "emailVerified", "createdOn", "modifiedOn", "deletedOn", "image"],
        properties: {
            _id: {},
            name: {
                bsonType: "string",
                description: "must be a string and is required"
            },
            email: {
                bsonType: "string",
                description: "must be a string and is required"
            },
            password: {
                bsonType: "string",
                description: "must be a hashed string and is required"
            },
            emailVerified: {
                bsonType: ["int", "long"],
                description: "'emailVerified' must be a date in ms from epoch"
            },
            createdOn: {
                bsonType: ["int", "long"],
                description: "'createdOn' must be a date in ms from epoch and is required"
            },
            modifiedOn: {
                bsonType: ["int", "long"],
                description: "'modifiedOn' must be a date in ms from epoch"
            },
            deletedOn: {
                bsonType: ["int", "long"],
                description: "'deletedOn' must be a date in ms from epoch"
            },
            image: {
                bsonType: "string",
                description: "must be a string"
            },
            role: {
                bsonType: "object",
                required: ["name", "description"],
                properties: {
                    name: {
                        enum: ["admin", "account_admin", "user"],
                        description: "'name' must be a string describing the role"
                    },
                    description: {
                        enum: ["RecipeBook admin", "Account admin", "Regular user"],
                        description: "'description' must be a string describing the role"
                    }
                }
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
