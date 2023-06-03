
/*
To generate a password:

Run the following from the command line
    npm install bcrypt

Then run the following from node
    const bcrypt = require('bcrypt')
    const saltRounds = 10
    await bcrypt.hash("admin", saltRounds)

    '$2b$10$YM26qPpJlu9zujLWrr9oDeAyKAk/rAzKbLhwnAyd1isgM.eMcw8cq'
*/

const {baseUsersSchema} = require("./20230529195813-add_users_collectoin_again")
const bcrypt = require('bcrypt')
// const {Long} = require("mongodb");
const {Long} = require("bson")
const saltRounds = 10

module.exports = {
    baseUsersSchema,

    async up(db) {
        const usersCollection = await db.collection("users")

        const now = Long.fromNumber(Date.now())
        const hashedPassword = await bcrypt.hash("admin", saltRounds)

        // create the default admin user
        const admin = {
            name: "admin",
            email: "rob@digitalcipher.com",
            password: hashedPassword,
            emailVerified: now,
            createdOn: now,
            modifiedOn: -1,
            deletedOn: -1,
            image: ""
        }
        await usersCollection.insertOne(admin)
    },

    async down(db) {
        await db.collection('users').deleteOne({name: "admin"})
    }
};
