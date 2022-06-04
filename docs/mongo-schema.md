# mongo schema and sample data

```shell
mongosh
```

To view the scheme in `mongosh`

```shell
db.getCollectionInfos({name:'recipes'})
```

to have all the objects expanded, rather than seeing [object] or [array]

```shell
config.set("inspectDepth", Infinity)
```

see the [mongosh docs](https://docs.mongodb.com/mongodb-shell/reference/configure-shell-settings/) for more details.

```shell
use recipeBook
```

```js
// create the schema for the recipe book
db.createCollection("recipes", {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: [
                'name',       'createdOn',
                'modifiedOn', 'tags',
                'yield',      'ingredients',
                'steps',      'notes',
                'ratings'
            ],
            properties: {
                _id: {},
                story: { bsonType: 'string', description: 'must be a string' },
                name: {
                    bsonType: 'string',
                    description: 'must be a string and is required'
                },
                createdOn: {
                    bsonType: [ 'int', 'long' ],
                    description: "'createdOn' must be a date and is required"
                },
                modifiedOn: {
                    bsonType: [ 'int', 'long', 'null' ],
                    description: "'createdOn' must be a date and is required"
                },
                tags: {
                    bsonType: [ 'array' ],
                    minItems: 0,
                    maxItems: 10,
                    items: {
                        bsonType: 'string',
                        description: 'must be an array of strings and is optional'
                    }
                },
                yield: {
                    bsonType: [ 'object' ],
                    required: [ 'value', 'unit' ],
                    properties: {
                        value: {
                            bsonType: [ 'int', 'double', 'decimal' ],
                            minimum: 0,
                            description: 'must be a double, positive, and is required'
                        },
                        unit: {
                            bsonType: 'string',
                            description: 'must be a string and is required'
                        }
                    }
                },
                requiredTime: {
                    bsonType: [ 'object' ],
                    required: [ 'total', 'active' ],
                    properties: {
                        total: {
                            bsonType: [ 'object' ],
                            required: [ 'value', 'unit' ],
                            properties: {
                                value: {
                                    bsonType: [ 'int', 'double', 'decimal' ],
                                    minimum: 0,
                                    description: 'must be a positive number'
                                },
                                unit: {
                                    enum: [ 'minute', 'hour', 'day', 'month' ],
                                    description: 'must be a unit of time'
                                }
                            }
                        },
                        active: {
                            bsonType: [ 'object' ],
                            required: [ 'value', 'unit' ],
                            properties: {
                                value: {
                                    bsonType: [ 'int', 'double', 'decimal' ],
                                    minimum: 0,
                                    description: 'must be a positive number'
                                },
                                unit: {
                                    enum: [ 'minute', 'hour', 'day', 'month' ],
                                    description: 'must be a unit of time'
                                }
                            }
                        }
                    }
                },
                ingredients: {
                    bsonType: [ 'array' ],
                    minItems: 1,
                    maxItems: 100,
                    items: {
                        bsonType: 'object',
                        required: [ 'id', 'name', 'brand', 'amount', 'section' ],
                        description: "'ingredients' must contain the stated fields.",
                        properties: {
                            id: {
                                bsonType: 'string',
                                description: 'must be a string and is required'
                            },
                            name: {
                                bsonType: 'string',
                                description: 'must be a string and is required'
                            },
                            amount: {
                                bsonType: [ 'object' ],
                                required: [ 'value', 'unit' ],
                                properties: {
                                    value: {
                                        bsonType: [ 'int', 'double', 'decimal' ],
                                        minimum: 0,
                                        description: 'must be a double, positive, and is required'
                                    },
                                    unit: {
                                        enum: [
                                            'mg',    'g',   'kg',
                                            'oz',    'lb',  'ml',
                                            'l',     'tsp', 'tbsp',
                                            'fl oz', 'cup', 'pt',
                                            'qt',    'gal', 'piece',
                                            'pinch'
                                        ],
                                        description: 'must be a string and is required'
                                    }
                                }
                            },
                            brand: {
                                bsonType: [ 'string', 'null' ],
                                description: 'must be a string and is optional'
                            },
                            section: {
                                bsonType: [ 'string', 'null' ],
                                description: 'must be a string or null and is optional'
                            }
                        }
                    }
                },
                steps: {
                    bsonType: [ 'array' ],
                    items: {
                        bsonType: [ 'object' ],
                        required: [ 'id', 'title', 'text' ],
                        properties: {
                            id: {
                                bsonType: 'string',
                                description: 'must be a string and is required'
                            },
                            title: {
                                bsonType: [ 'string', 'null' ],
                                description: 'must be a string and is optional'
                            },
                            text: {
                                bsonType: 'string',
                                description: 'must be a string and is required'
                            }
                        }
                    }
                },
                notes: {
                    bsonType: [ 'string', 'null' ],
                    description: 'must be a string and is required'
                },
                author: {
                    bsonType: [ 'string', 'null' ],
                    description: 'must be a string'
                },
                addedBy: {
                    bsonType: [ 'string', 'null' ],
                    description: 'must be a string'
                },
                ratings: {
                    bsonType: [ 'array' ],
                    minItems: 5,
                    maxItems: 5,
                    items: {
                        bsonType: 'int',
                        description: 'must be an array of strings and is optional'
                    }
                }
            }
        }
    }
})
```

```js
db.recipes.insertOne({
    story: "Basic pancake iteration 4",
    name: "basic pancakes",
    createdOn: Long("1634417241000"),
    modifiedOn: null,
    tags: ["breakfast", "american"],
    yield: {
        value: 6,
        unit: "pancakes"
    },
    requiredTime: {
        total: {value: 20, unit: "minute"},
        active: {value: 20, unit: "minute"}
    },
    ingredients: [
        {
            id: "1",
            name: "flour",
            brand: "King Arthur",
            amount: {
                value: 1,
                unit: "cup"
            }
        },
        {
            id: "2",
            name: "baking powder",
            brand: null,
            amount: {
                value: 1,
                unit: "tsp"
            }
        },
        {
            id: "3",
            name: "baking soda",
            brand: null,
            amount: {
                value: 0.5,
                unit: "tsp"
            }
        },
        {
            id: "4",
            name: "milk",
            brand: null,
            amount: {
                value: 0.5,
                unit: "cup"
            }
        },
        {
            id: "5",
            name: "oil",
            brand: null,
            amount: {
                value: 1,
                unit: "tbsp"
            }
        },
        {
            id: "6",
            name: "egg",
            brand: null,
            amount: {
                value: 1,
                unit: "piece"
            }
        }
    ],
    steps: [
        {id: "1", title: null, text: "mix dry ingredients"},
        {id: "2", title: null, text: "add wet ingredients"},
        {id: "3", title: null, text: "cook on griddle"}
    ],
    notes: "medium heat, flip when edges start to lose their shine"
})
```

```js
db.recipes.insertOne({
    story: "",
    name: "scrambled eggs",
    createdOn: Long("1636588800000"),
    modifiedOn: null,
    tags: ["breakfast", "eggs"],
    yield: {
        value: 1,
        unit: "serving"
    },
    requiredTime: {
        total: {value: 20, unit: "minute"},
        active: {value: 20, unit: "minute"}
    },
    ingredients: [
        {
            id: "1",
            name: "oil",
            brand: null,
            amount: {
                value: 1,
                unit: "tsp"
            }
        },
        {
            id: "2",
            name: "egg",
            brand: null,
            amount: {
                value: 2,
                unit: "piece"
            }
        }
    ],
    steps: [
        {id: "1", title: null, text: "heat frying pan over medium heat, and when hot add oil"},
        {id: "2", title: null, text: "break eggs into bowl and whip with fork"},
        {id: "3", title: null, text: "when oil is hot add eggs"},
        {id: "4", title: null, text: "after about 1 minute flip and break eggs"},
        {id: "5", title: null, text: "season with salt and pepper, to taste"}
    ],
    notes: null
})
```

```js
db.recipes.insertOne({
    story: "",
    name: "crepes",
    createdOn: Long("1638230400000"),
    modifiedOn: Long("1638576000000"),
    tags: ["french", "desert", "dinner"],
    yield: {
        value: 8,
        unit: "crepes"
    },
    requiredTime: {
        total: {value: 30, unit: "minute"},
        active: {value: 30, unit: "minute"}
    },
    ingredients: [
        {
            id: "1",
            name: "flour",
            brand: null,
            amount: {
                value: 1,
                unit: "cup"
            }
        },
        {
            id: "2",
            name: "oil",
            brand: null,
            amount: {
                value: 1,
                unit: "tsp"
            }
        },
        {
            id: "3",
            name: "milk",
            brand: null,
            amount: {
                value: 0.5,
                unit: "cup"
            }
        },
        {
            id: "4",
            name: "water",
            brand: null,
            amount: {
                value: 0.5,
                unit: "cup"
            }
        },
        {
            id: "5",
            name: "egg",
            brand: null,
            amount: {
                value: 1,
                unit: "piece"
            }
        }
    ],
    steps: [
        {id: "1", title: null, text: "mix ingredients in bowl with whisk"},
        {id: "2", title: null, text: "add to crepe pan as thin pancake"}
    ],
    notes: null
})
```

```js
db.recipes.insertOne({
    story: "",
    name: 'broken eggs',
    yield: { value: 2, unit: '' },
    createdOn: Long("1639685862792"),
    modifiedOn: null,
    tags: [],
    requiredTime: {
        total: {value: 2, unit: "minute"},
        active: {value: 2, unit: "minute"}
    },
    ingredients: [
        {
            id: "1",
            name: 'eggs',
            brand: null,
            amount: { value: 2, unit: 'piece' }
        }
    ],
    steps: [ {id: "1",  title: null, text: 'break the eggs' } ],
    notes: "don't make a mess"
})
```

```js
db.recipes.insertOne({
    story: "This is a test recipe",
    name: 'broken eggs again',
    yield: {value: 3, unit: ''},
    createdOn: Long("1639688607238"),
    modifiedOn: null,
    tags: [],
    requiredTime: {
        total: {value: 3, unit: "minute"},
        active: {value: 3, unit: "minute"}
    },
    ingredients: [
        {
            id: "1",
            name: 'eggs',
            brand: null,
            amount: {value: 2, unit: 'piece'}
        }
    ],
    steps: [{id: "1", title: null, text: 'break the eggs'}],
    notes: "don't make a big mess"
})
```