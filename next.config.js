module.exports = {
    env: {
        version: '0.1.0',

        siteName: 'City Recipes',
        bookTitle: "B&R Recipes",

        recipesApi: 'http://localhost:9090/rest/v1/recipes',

        MONGODB_URI: 'mongodb://localhost:27017',
        mongoDatabase: 'recipeBook',
        recipeCollection: 'recipes',

        sidebarNavWidthSmall: 180,
        sidebarNavWidthMedium: 250,
    },
}
