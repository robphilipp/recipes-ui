# mongodb backups

If you've been following along and setting up the raspberry pi, then your mongo version is likely 4.4 (unless you built version 5 from scratch), and the [mongo database tools](https://docs.mongodb.com/database-tools/) won't be installed on the raspberry pi. 

You have two options:
1. You can attempt to install the mongo database tools on the raspberry.
2. Or you can use the ones from your local (development) box (macos, windows). 

In the first case, you can use `mongodump`/`mongorestore` to back up the entire database. And you can also use `mongoexport`/`mongoimport`.

In the second case, there is an additional wrinkle. Using `mongodump`/`mongorestore` requires that the source and destination database have the same major version. So for example, if you run `mongodump` on your raspberry pi and wish to restore the mongo database on your development box, they must be the same version. And, most likely, your development box has a later version, in which case you can resort to using `mongoexport`/`mongoimport`.

## (mongodump/mongorestore) a complete backup

Using [mongodump](https://docs.mongodb.com/database-tools/mongodump/) gives a complete backup of the database.

> Note that `mongorestore` can only go to databases of the same major version. Raspberry π database is 4.4, and local database is 5.0.

```shell
mongodump -h <hostname or ip>
```

## (mongoexport/mongoimport) a backup of the data

Using [mongoexport](https://docs.mongodb.com/database-tools/mongoexport/) allows pulling out the data.

```shell
mongoexport --db='recipeBook' --collection='recipes' --host='<hostname or ip>' --jsonFormat=canonical --out='recipes-export.json'
```

Then use [mongoimport](https://docs.mongodb.com/database-tools/mongoimport/) to import the data after setting up and running the migration scripts.

```shell
mongoimport --db='recipeBook' --collection='recipes' --host='<hostname or ip>' --file='recipes-export.json'
```