const {baseUsersSchema} = require("./20230529195813-add_users_collection")
const {baseRolesSchema} = require("./20230703121956-create_roles_collection")
const {baseUserRolesSchema} = require("./20230703125505-create_users_roles_mapping_collection")

function viewSchema() {
    const fullUsersViewSchema = {...baseUsersSchema}
    fullUsersViewSchema.$jsonSchema.required.push("roleId", "role_name", "role_description", "userId")
    fullUsersViewSchema.$jsonSchema.properties.roleId = baseUserRolesSchema.$jsonSchema.properties.roleId
    fullUsersViewSchema.$jsonSchema.properties.role_name = baseRolesSchema.$jsonSchema.properties.name
    fullUsersViewSchema.$jsonSchema.properties.role_description = baseRolesSchema.$jsonSchema.properties.description

    fullUsersViewSchema.$jsonSchema.properties.userId = baseUserRolesSchema.$jsonSchema.properties.userId

    return fullUsersViewSchema
}

const fullUsersViewSchema = viewSchema()


/**
 * For better or worse, I decided to normalize the roles and users and combined
 * them with a bridge collection. These views combine the three tables so that the
 * queries for getting users and roles are easier to write.
 *
 * @type {{up(*): Promise<void>, down(*): Promise<void>}}
 */
module.exports = {
    fullUsersViewSchema,

    async up(db) {
        await db.createCollection("roles_full", {
            viewOn: "users_roles",
            pipeline: [
                {
                    $lookup: {
                        from: "roles",
                        localField: "roleId",
                        foreignField: "_id",
                        as: "rolesDocs"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        roleId: 1,
                        userId: 1,
                        role_name: "$rolesDocs.name",
                        role_description: "$rolesDocs.description"
                    }
                },
                {$unwind: "$role_name"},
                {$unwind: "$role_description"}
            ]
        })
    },

    async down(db) {
        await db.collection("roles_full").drop()
    }
}
