module.exports = {
    env: {
        version: '0.4.2-snapshot',

        siteName: 'City Recipes',
        bookTitle: "B&R Recipes",

        recipesApi: 'http://localhost:9090/rest/v1/recipes',

        MONGODB_URI: 'mongodb://localhost:27017',
        mongoDatabase: 'recipeBook',
        recipeCollection: 'recipes',

        usersCollection: 'users',
        rolesCollection: 'roles',
        usersRolesCollection: 'users_roles',

        sidebarNavWidthSmall: 180,
        sidebarNavWidthMedium: 250,
    },
}
