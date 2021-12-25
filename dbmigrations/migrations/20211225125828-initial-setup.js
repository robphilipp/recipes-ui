// noinspection JSUnusedGlobalSymbols

module.exports = {
    async up(db) {
        await db.createCollection("recipes", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["name", "createdOn", "modifiedOn", "tags", "yield", "ingredients", "steps", "notes"],
                    properties: {
                        _id: {},
                        story: {
                            bsonType: "string",
                            description: "must be a string"
                        },
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
                        requiredTime: {
                            bsonType: ["object"],
                            required: ["total", "active"],
                            properties: {
                                total: {
                                    bsonType: ["object"],
                                    required: ["value", "unit"],
                                    properties: {
                                        value: {
                                            bsonType: ["int", "double", "decimal"],
                                            minimum: 0,
                                            description: "must be a positive number"
                                        },
                                        unit: {
                                            enum: ["minute", "hour", "day", "month"],
                                            description: "must be a unit of time"
                                        }
                                    }
                                },
                                active: {
                                    bsonType: ["object"],
                                    required: ["value", "unit"],
                                    properties: {
                                        value: {
                                            bsonType: ["int", "double", "decimal"],
                                            minimum: 0,
                                            description: "must be a positive number"
                                        },
                                        unit: {
                                            enum: ["minute", "hour", "day", "month"],
                                            description: "must be a unit of time"
                                        }
                                    }
                                }
                            }
                        },
                        ingredients: {
                            bsonType: ["array"],
                            minItems: 1,
                            maxItems: 100,
                            items: {
                                bsonType: "object",
                                required: ["id", "name", "brand", "amount"],
                                description: "'ingredients' must contain the stated fields.",
                                properties: {
                                    id: {
                                        bsonType: "string",
                                        description: "must be a string and is required"
                                    },
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
                                                    "mg", "g", "kg", "oz", "lb",
                                                    "ml", "l", "tsp", "tbsp", "fl oz",
                                                    "cup", "pt", "qt", "gal", "piece"
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
                                required: ["id", "title", "text"],
                                properties: {
                                    id: {
                                        bsonType: "string",
                                        description: "must be a string and is required"
                                    },
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
                        },
                        notes: {
                            bsonType: ["string", "null"],
                            description: "must be a string and is required"
                        }
                    }
                }
            }
        })
    },

    async down() {
        await Promise.resolve()
    }
};
