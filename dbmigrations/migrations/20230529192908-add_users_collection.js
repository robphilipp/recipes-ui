const baseSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["id", "name", "email", "emailVerified", "image"],
        properties: {
            _id: {},
            id: {
                bsonType: "string",
                description: "must be a string"
            },
            name: {
                bsonType: "string",
                description: "must be a string and is required"
            },
            email: {
                bsonType: "string",
                description: "must be a string and is required"
            },
            emailVerified: {
                bsonType: ["int", "long"],
                description: "'createdOn' must be a date and is required"
            },
            image: {
                bsonType: "string",
                description: "must be a string"
            },
        }
    }
}

module.exports = {
    baseSchema,

    async up(db) {
        await db.createCollection("users", {validator: baseSchema})
    },

    async down(db) {
        await Promise.resolve()
    }
};
