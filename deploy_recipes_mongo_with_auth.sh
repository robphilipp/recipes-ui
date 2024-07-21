#!/bin/bash

#
# two step process to deploy. the first step is to do a base deploy
# using docker compose (compose configuration is ../../compose.yaml).
# the second step is to finish the mongo cluster authentication.
#

compose_file='compose-hardened.yaml'
db_admin_name='looker'
admin_password="he-w3nt-2-tHehou5eto-lo0k"
cluster_admin_name='clusterer'
cluster_admin_password="he-w3nt-2-tHehou5eto-lo0k"

recipes_replica_set_name='recipesReplicaSet'
mongo_nodes='mongo1,mongo2,mongo3'

#
# set up the environment for compose (ugh)
#
# create an environment file for docker compose to use, and then copy it to
# the deployment directory so that it can be used by the next auth
cat > .env <<EOF
NEXTAUTH_URL_INTERNAL: "http://localhost:3000"
NEXTAUTH_URL: "http://localhost:8081"
NEXTAUTH_SECRET: "caa8eeccc7d0e6e3f02d7f3a0c21bd43ed30b4f7cfe897448bb92ff4890bf6ef"
MONGO_ADMIN_USERNAME: "$db_admin_name"
MONGO_ADMIN_PASSWORD: "$admin_password"
MONGO_NODES: "$mongo_nodes"
EOF

# variables for next auth (need to move the secret into a secret)
# (holds the next-auth secret and should be unique for your deployment)
cp .env deployment/.env.compose

#
# run docker compose to get the cluster up in its base configuration
#

# do the base deployment of the mongo cluster and the recipes app
printf "(deploy_recipes_mongo_with_auth) starting base deployment; compose_config: $compose_file..."
docker compose --file "$compose_file" up --detach
printf "done\n"

#
# set up the mongo replica set, adding node-to-node authentication,
# importing the backed up collections,  update the schema to the latest version,
# and adding basic data.
#

# todo change the rs.initiate config to depend on the number of replica
# initial the mongo cluster's replica set
printf "(deploy_recipes_mongo_with_auth) initiating the replica set; replica_set_name: $recipes_replica_set_name..."
docker compose --file "$compose_file" exec --no-TTY mongo1 mongosh --host localhost:27017 <<EOF
rs.initiate({
  "_id": "$recipes_replica_set_name",
  "version": 1,
  "members": [
    {
      "_id": 0,
      "host": "mongo1:27017",
      "priority": 2
    },
    {
      "_id": 1,
      "host": "mongo2:27017",
      "priority": 0
    },
    {
      "_id": 2,
      "host": "mongo3:27017",
      "priority": 0
    }
  ]
});
EOF
printf "done\n"

# wait for mongo1 to become the primary, which it will based on the
# priorities set in the rs.initiate(...) call.
printf "(deploy_recipes_mongo_with_auth) waiting for mongo1 to become the primary replica"
while [ $(docker compose --file "$compose_file" exec --no-TTY mongo1 mongosh --host localhost:27017 --eval "rs.status().members[0].stateStr") != "PRIMARY" ]; do
  printf "."
  sleep 1
done
printf "done\n\n"

# add an admin user and a cluster-admin user to the mongo cluster
# for authenticating queries. the admin users (looker) has root access
# to enable importing and migrating data
# todo is there a more restricted access that allows importing, reading, writing, backups, etc
printf "(deploy_recipes_mongo_with_auth) adding database admin user...\n"
docker compose --file "$compose_file" exec --no-TTY mongo1 mongosh --host localhost:27017 <<EOF
var db_admin = "looker"
var password = "he-w3nt-2-tHehou5eto-lo0k"

var admin = db.getSiblingDB("admin")

admin.createUser(
  {
    "user" : db_admin,
    "pwd" : password,
    "roles": [ { "role": "root", "db": "admin" } ]
  }
)
EOF
printf "done\n\n"

printf "(deploy_recipes_mongo_with_auth) adding cluster admin user...\n"
docker compose --file "$compose_file" exec --no-TTY mongo1 mongosh \
  --host mongo1:27017 \
  --username="$db_admin_name" \
  --password="$admin_password" <<EOF
var db_admin = "$db_admin_name"
var cluster_admin = "$cluster_admin_name"
var password = "$admin_password"

var admin = db.getSiblingDB("admin")

admin.auth(db_admin, password)

admin.createUser(
  {
    "user" : cluster_admin,
    "pwd" : password,
    "roles": [ { "role" : "clusterAdmin", "db" : "admin" } ]
  }
)
EOF
printf "done\n\n"

# pre-migration: put the database and the changelog into its current state
#

# todo change "mongo1,mongo2,mongo3" to a string that depends on the number of replica
printf "(deploy_recipes_mongo_with_auth) importing existing recipes (recipes-export.json)..."
docker compose --file "$compose_file" exec --no-TTY mongo1 mongoimport \
  --username="$db_admin_name" \
  --password="$admin_password" \
  --authenticationDatabase="admin" \
  --db='recipeBook' \
  --collection='recipes' \
  --host="$recipes_replica_set_name/mongo1,mongo2,mongo3" \
  --file='/data/setup/backups/recipes-export.json' \
  --bypassDocumentValidation
printf "done\n\n"

printf "(deploy_recipes_mongo_with_auth) importing changelog for migrate-mongo (changelog-export.json)..."
docker compose --file "$compose_file" exec --no-TTY mongo1 mongoimport \
  --username="$db_admin_name" \
  --password="$admin_password" \
  --authenticationDatabase="admin" \
  --db='recipeBook' \
  --collection='changelog' \
  --host="$recipes_replica_set_name/mongo1,mongo2,mongo3" \
  --file='/data/setup/backups/changelog-export.json' \
  --maintainInsertionOrder
printf "done\n\n"

printf "(deploy_recipes_mongo_with_auth) checking changelog..."
docker compose --file "$compose_file" exec --no-TTY mongo1 mongosh \
  --host "$recipes_replica_set_name/mongo1,mongo2,mongo3" \
  --username="$db_admin_name" \
  --password="$admin_password" \
  --authenticationDatabase="admin" <<EOF
use recipeBook;
db.changelog.find();
EOF
printf "done\n\n"

# migrates the mongo database cluster to the latest version found in dbmigrations/migrations
printf "(deploy_recipes_mongo_with_auth) migrating mongo cluster to current state..."
docker compose --file "$compose_file" exec --no-TTY app /usr/app/deployment/mongo/migrate_mongo.sh
printf "done\n\n"

printf "(deploy_recipes_mongo_with_auth) moving the .env file out of the way..."
mv .env deployment/.env.for.docker.compose.old
printf "moved to .env.for.docker.compose.old"

printf "(deploy_recipes_mongo_with_auth) completed!\n"