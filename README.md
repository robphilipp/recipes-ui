# recipes

Basic recipe book for cooking great things.

## contributing

The recipe book app uses mongodb to store the recipes. You'll want to set up or point to a mongo database.

### setting up mongo db

On macos with homebrew

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

### adding the collection and schema validation
Using `mongosh` or some other tool, create the `recipeBook` database with the `use recipeBook` command. Then create the `recipes` collection with the schema validator.
```
use recipeBook
db.createCollection("recipes", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "createdOn", "modifiedOn", "tags", "yield", "ingredients", "steps"],
            properties: {
                _id: {},
                name: {
                    bsonType: "string",
                    description: "must be a string and is required"
                },
                createdOn: {
                    bsonType: ["int", "long"],
                    description: "'createdOn' must be a date and is required"
                },
                modifiedOn: {
                    bsonType: ["int", "long", "null"],
                    description: "'createdOn' must be a date and is required"
                },
                tags: {
                    bsonType: ["array"],
                    minItems: 0,
                    maxItems: 10,
                    items: {
                        bsonType: "string",
                        description: "must be an array of strings and is optional"
                    }
                },
                yield: {
                    bsonType: ["object"],
                    required: ["value", "unit"],
                    properties: {
                        value: {
                            bsonType: ["int", "double", "decimal"],
                            minimum: 0,
                            description: "must be a double, positive, and is required"
                        },
                        unit: {
                            bsonType: "string",
                            description: "must be a string and is required"
                        }
                    }
                },
                ingredients: {
                    bsonType: ["array"],
                    minItems: 1,
                    maxItems: 100,
                    items: {
                        bsonType: "object",
                        required: ["name", "brand", "amount"],
                        description: "'ingredients' must contain the stated fields.",
                        properties: {
                            name: {
                                bsonType: "string",
                                description: "must be a string and is required"
                            },
                            amount: {
                                bsonType: ["object"],
                                required: ["value", "unit"],
                                properties: {
                                    value: {
                                        bsonType: ["int", "double", "decimal"],
                                        minimum: 0,
                                        description: "must be a double, positive, and is required"
                                    },
                                    unit: {
                                        enum: [
                                            "mg", "g", "kg", "oz", "ozs", "lb", "lbs",
                                            "ml", "l", "tsp", "tsps", "tbsp", "tbsps", "fl oz", "fl ozs",
                                            "cup", "cups", "pt", "pts", "qt", "qts", "gal", "gals", "piece"
                                        ],
                                        description: "must be a string and is required"
                                    }
                                }
                            },
                            brand: {
                                bsonType: ["string", "null"],
                                description: "must be a string and is optional"
                            }
                        }
                    }
                },
                steps: {
                    bsonType: ["array"],
                    items: {
                        bsonType: ["object"],
                        required: ["title", "text"],
                        properties: {
                            title: {
                                bsonType: ["string", "null"],
                                description: "must be a string and is optional"
                            },
                            text: {
                                bsonType: "string",
                                description: "must be a string and is required"
                            }
                        }
                    }
                }
            }
        }
    }
})
```

Then insert one or more recipe into the database. For example, insert a basic pancake recipe.
```
db.recipes.insertOne({
    "name": "basic pancakes",
    "createdOn": Long("1634417241000"),
    "modifiedOn": null,
    "tags": ["breakfast", "american"],
    "yield": {
        "value": 6,
        "unit": "pancakes"
    },
    "ingredients": [
        {
            "name": "flour",
            "brand": "King Arthur",
            "amount": {
                "value": 1,
                "unit": "cup"
            }
        },
        {
            "name": "baking powder",
            "brand": null,
            "amount": {
                "value": 1,
                "unit": "tsp"
            }
        },
        {
            "name": "baking soda",
            "brand": null,
            "amount": {
                "value": 0.5,
                "unit": "tsp"
            }
        },
        {
            "name": "milk",
            "brand": null,
            "amount": {
                "value": 0.5,
                "unit": "cup"
            }
        },
        {
            "name": "oil",
            "brand": null,
            "amount": {
                "value": 1,
                "unit": "tbsp"
            }
        },
        {
            "name": "egg",
            "brand": null,
            "amount": {
                "value": 1,
                "unit": "piece"
            }
        }
    ],
    "steps": [
        {"title": null, "text": "mix dry ingredients"},
        {"title": null, "text": "add wet ingredients"},
        {"title": null, "text": "cook on griddle"}
    ]
})
```