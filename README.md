# recipes

Basic recipe book for cooking great things.

## contributing

The recipe book app uses mongodb to store the recipes. You'll want to set up or point to a mongo database.

### setting up mongo db

On macOS with homebrew

Install `mongodb`
```shell
brew tap mongodb/brew
brew install mongodb-community@5.0
```

Start `mongodb` with
```shell
brew services start mongodb-community@5.0
```

Stop `mongodb` with
```shell
brew services stop mongodb-community@5.0
```

### migrate-mongo
This project uses [migrate-mongo](https://www.npmjs.com/package/migrate-mongo) to set up the recipe collection in mongoDB and to migrate changes to the schema and data. To get going, install `migrate-mongo`.

```shell
npm install -g migrate-mongo
```

Then from the `dbmigrations` directory, run
```shell
migrate-mongo up
```

This will create the `recipes` collection and its validation schema. Now you can add recipes using the UI, or use the sample queries provided in [docs/mongo-schema.md](./docs/mongo-schema.md) after the example schema definition.

### adding the collection and schema validation
Using `mongosh` or some other tool, create the `recipeBook` database with the `use recipeBook` command. Then create the `recipes` collection with the schema validator.

See [mongo-schema.md](./docs/mongo-schema.md) for the schema and a few example recipes insert commands.