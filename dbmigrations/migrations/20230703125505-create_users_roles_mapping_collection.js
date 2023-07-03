const {ObjectId} = require("bson");
/**
 * A many-to-many mapping of users to roles.
 * @type {{$jsonSchema: {bsonType: string, required: *[], properties: {roleId: {bsonType: string, description: string}, _id: {}, userId: {bsonType: string, description: string}}}}}
 */
const baseUserRolesSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: [],
        properties: {
            _id: {},
            roleId: {
                bsonType: "ObjectID",
                description: "must be an object ID associated with a role"
            },
            userId: {
                bsonType: "ObjectID",
                description: "must be an object ID associated with a user"
            }
        }
    }
}

module.exports = {
    baseUserRolesSchema,

    async up(db) {
        await db.createCollection("users_roles")

        // find the admin user's ID
        const usersCollection = await db.collection("users")
        const user = await usersCollection.findOne({name: "admin"})

        // find the roleId for the admin role
        const rolesCollection = await db.collection("roles")
        const role = await rolesCollection.findOne({name: "admin"})

        // add the mapping
        const userRolesCollection = await db.collection("users_roles")
        await userRolesCollection.insertOne({roleId: new ObjectId(role._id), userId: new ObjectId(user._id)})
    },

    async down(db) {
        await db.collection("users_roles").drop()
    }
}
