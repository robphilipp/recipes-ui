/**
 * Collection used for setting and resetting user passwords
 * @type {{$jsonSchema: {bsonType: string, required: *[], properties: {expiration: {bsonType: string[], description: string}, _id: {}, resetToken: {bsonType: string, description: string}, userId: {bsonType: string, description: string}}}}}
 */
const basePasswordResetTokenSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["userId", "resetToken", "expiration"],
        properties: {
            _id: {},
            userId: {
                bsonType: "string",
                description: "must be an object ID associated with a user"
            },
            resetToken: {
                bsonType: "string",
                description: "must be a string password reset token"
            },
            expiration: {
                bsonType: ["int", "long"],
                description: "must be a password reset token expiration date-time"
            }
        }
    }
}

module.exports = {
    basePasswordResetTokenSchema,

    async up(db) {
        await db.createCollection("password_reset_tokens", {validator: basePasswordResetTokenSchema})
    },

    async down(db) {
        await db.collection("password_reset_tokens").drop()
    }
}
