import NextAuth from "next-auth";
import {MongoDBAdapter} from "@next-auth/mongodb-adapter";
import clientPromise from "./mongodb";

export default NextAuth({
    // no providers because we are providing our own database
    providers: [],
    // same mongo database that holds the recipes (I'm sure I'll
    // regret this down the road).
    adapter: MongoDBAdapter(clientPromise, {
        collections: {
            Users: 'users'
        },
        databaseName: 'recipeBooks'
    }),
    // use JSON web tokens for managing sessions
    session: {
        strategy: 'jwt'
    }
})