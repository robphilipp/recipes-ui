module.exports = {
    env: {
        version: '0.4.2-snapshot',

        siteName: 'City Recipes',
        bookTitle: "City Recipes",

        recipesApi: 'http://localhost:9090/rest/v1/recipes',

        MONGODB_URI: 'mongodb://localhost:27017',
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

        // mongo view that holds the users and their role information
        // together for easier access
        usersView: 'users_full',
        // mongo view that holds the roles and their associated
        // users (by ID) for reverse lookups
        rolesView: 'roles_full',

        // routes that are not authenticated
        unauthenticated: [
            "/passwords/token/[id]"
        ],

        // layout information
        sidebarNavWidthSmall: 180,
        sidebarNavWidthMedium: 250,
    },
}
