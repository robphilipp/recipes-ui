# strategy loading collections

In cases where you would like to do a deploy a blank copy of the recipe book:
1. Remove any code from the `deployment/mongo/mongo_setup.sh` that imports data into the new mongodb cluster. See the comments towards the bottom of that file for additional info.
2. Then run `docker compose`.

In cases where you would like to deploy a new recipe app, but with existing data, this is the strategy:
1. Export (with `mongoexport`) the collections you would like to include in the new cluster and place them into the `deployment/mongo/backups` directory.
2. Export (with `mongoexport`) the `changelog` collection that holds the `migrate-mongo` state and place it into the `deployment/mongo/backups` directory. We need these so that we can run `migrate-mongo` on your new database to bring it to the current state.
3. In the `deployment/mongo/mongo_setup.sh` add lines to import (with `mongoimport`) the exported collections.
4. Then run `docker compose.`

## mongoexport/mongoimport

To export existing collections, use the following lines. You'll need to do a `mongoexport` for each collection you wish to import into the new mongodb.

```shell
mongoexport --db='recipeBook' --collection='changelog' --host='<host:port>' --jsonFormat=canonical --out='changelog-export.json'
mongoexport --db='recipeBook' --collection='recipes' --host='<host:port>' --jsonFormat=canonical --out='recipes-export.json'
```
After the comment

```shell

```

Add the following lines for the import:

```shell
cd /deployment/deployment/mongo/backups; \
mongoimport --db='recipeBook' --collection='recipes' --host='recipesReplicaSet/mongo1,mongo2,mongo3' --file='recipes-export.json' --bypassDocumentValidation; \
mongoimport --db='recipeBook' --collection='changelog' --host='recipesReplicaSet/mongo1,mongo2,mongo3' --file='changelog-export.json' --maintainInsertionOrder; \
cd /
```

> Note that you may need to add the `--bypassDocumentValidation` flag to bypass schema validation for the `recipes` collection.
> Note that you MUST add the `--maintainInsertionOrder` flag to the import for the `changelog` collection to ensure that the order in which the migrations were applied is the order they appear in the new database (probably unnecessary).

And, add additional imports, one for each of the `mongoexport` commands run.