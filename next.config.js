module.exports = {
    env: {
        siteName: 'B & R ecipes',
        bookTitle: "Bonnie and Rob's City Recipes",

        recipesApi: 'http://localhost:9090/rest/v1/recipes',

        MONGODB_URI: 'mongodb://localhost:27017',
        mongoDatabase: 'recipeBook',
        recipeCollection: 'recipeDao'
    },
}