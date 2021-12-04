module.exports = {
    env: {
        siteName: 'City Recipes',
        bookTitle: "City Recipes",

        recipesApi: 'http://localhost:9090/rest/v1/recipes',

        MONGODB_URI: 'mongodb://localhost:27017',
        mongoDatabase: 'recipeBook',
        recipeCollection: 'recipes'
        // recipeCollection: 'recipeDao'
    },
}
