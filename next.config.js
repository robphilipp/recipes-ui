// @ts-check

const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_SERVER } = require('next/constants')

module.exports = (phase, { defaultConfig }) => {

    console.log("defaultConfig", defaultConfig)

    if (phase === PHASE_DEVELOPMENT_SERVER) {
        /**
         * @type {import('next').NextConfig}
         */
        return {
            env: {
                version: '0.4.2-snapshots',

                siteName: 'City Recipes',
                bookTitle: "City Recipes",

                scheme: 'http',
                host: 'localhost',
                port: "3000",
                recipesApi: '/rest/v1/recipes',

                MONGODB_URI: 'mongodb://localhost:27017',
                MONGODB_REPLICA_SET: 'rs0',
                mongoDatabase: 'recipeBook',

                // mongo collection that the actual recipes
                recipeCollection: 'recipes',

                // mongo collection that holds the recipe book users
                usersCollection: 'users',
                // mongo collection that holds the recipe book roles
                // (admin, account admin, user)
                rolesCollection: 'roles',
                // mongo collection that holds the assignments of roles
                // to users
                usersRolesCollection: 'users_roles',

                // mongo collection holding the password set/reset tokens
                // and associated users
                passwordResetTokenCollection: 'password_reset_tokens',

                // mongo collection holding recipe permissions (access rights
                // users and groups have on a recipe)
                permissionsCollection: 'permissions',

                // mongo view that holds the users and their role information
                // together for easier access
                usersView: 'users_full',
                // mongo view that holds the roles and their associated
                // users (by ID) for reverse lookups
                rolesView: 'roles_full',


                // routes that are not authenticated
                unauthenticated: "/passwords/token/[id], /passwords/email/[id], /login",

                // layout information
                sidebarNavWidthSmall: "180",
                sidebarNavWidthMedium: "250",
            }
        }

    }
    const replicaSet = 'recipesReplicaSet'
    return {
        env: {
            version: '1.0.0',

            siteName: 'City Recipes',
            bookTitle: "City Recipes",

            scheme: 'http',
            host: 'localhost',
            port: "3001",
            recipesApi: '/rest/v1/recipes',

            MONGODB_REPLICA_SET: replicaSet,
            // TODO username/password need to come from some secret location and be consistent throughout
            // MONGODB_URI: `mongodb://${defaultConfig.env.MONGO_ADMIN_USERNAME}:he%2Dw3nt%2D2%2DtHehou5eto%2Dlo0k@mongo1,mongo2,mongo3/?replicaSet=recipesReplicaSet&authSource=admin`,
            MONGODB_URI: `mongodb://looker:he%2Dw3nt%2D2%2DtHehou5eto%2Dlo0k@mongo1,mongo2,mongo3/?replicaSet=${replicaSet}&authSource=admin`,
            mongoDatabase: 'recipeBook',

            // mongo collection that the actual recipes
            recipeCollection: 'recipes',

            // mongo collection that holds the recipe book users
            usersCollection: 'users',
            // mongo collection that holds the recipe book roles
            // (admin, account admin, user)
            rolesCollection: 'roles',
            // mongo collection that holds the assignments of roles
            // to users
            usersRolesCollection: 'users_roles',

            // mongo collection holding the password set/reset tokens
            // and associated users
            passwordResetTokenCollection: 'password_reset_tokens',

            // mongo collection holding recipe permissions (access rights
            // users and groups have on a recipe)
            permissionsCollection: 'permissions',

            // mongo view that holds the users and their role information
            // together for easier access
            usersView: 'users_full',
            // mongo view that holds the roles and their associated
            // users (by ID) for reverse lookups
            rolesView: 'roles_full',

            // routes that are not authenticated
            unauthenticated: "/passwords/token/[id], /passwords/email/[id], /login",

            // layout information
            sidebarNavWidthSmall: "180",
            sidebarNavWidthMedium: "250",
        }
    }
}
//
// module.exports =
// {
//     env: {
//         version: '0.4.2-snapshot',
//
//         siteName: 'City Recipes',
//         bookTitle: "City Recipes",
//
//         scheme: 'http',
//         host: 'localhost',
//         port: "3000",
//         recipesApi: '/rest/v1/recipes',
//         // recipesApi: 'http://localhost:9090/rest/v1/recipes',
//
//         MONGODB_URI: 'mongodb://localhost:27017',
//         mongoDatabase: 'recipeBook',
//
//         // mongo collection that the actual recipes
//         recipeCollection: 'recipes',
//
//         // mongo collection that holds the recipe book users
//         usersCollection: 'users',
//         // mongo collection that holds the recipe book roles
//         // (admin, account admin, user)
//         rolesCollection: 'roles',
//         // mongo collection that holds the assignments of roles
//         // to users
//         usersRolesCollection: 'users_roles',
//
//         // mongo collection holding the password set/reset tokens
//         // and associated users
//         passwordResetTokenCollection: 'password_reset_tokens',
//
//         // mongo collection holding recipe permissions (access rights
//         // users and groups have on a recipe)
//         permissionsCollection: 'permissions',
//
//         // mongo view that holds the users and their role information
//         // together for easier access
//         usersView: 'users_full',
//         // mongo view that holds the roles and their associated
//         // users (by ID) for reverse lookups
//         rolesView: 'roles_full',
//
//
//         // routes that are not authenticated
//         unauthenticated: "/passwords/token/[id], /passwords/email/[id], /login",
//         // unauthenticated: [
//         //     "/passwords/token/[id]",
//         //     "/passwords/email/[id]",
//         //     "/login",
//         //     // "/auth/callback/recipes-provider-mongo-credentials",
//         // ],
//
//         // layout information
//         sidebarNavWidthSmall: "180",
//         sidebarNavWidthMedium: "250",
//     },
// }
