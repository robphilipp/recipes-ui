#!/bin/bash

recipes_replica_set_name=recipesReplicaSet
print "Initiating the replica set; replica_set_name: $recipes_replica_set_name"
#mongosh --host mongo1:27017 <<EOF
#  rs.initiate({
#    "_id": "$recipes_replica_set_name",
#    "version": 1,
#    "members": [
#      {
#        "_id": 0,
#        "host": "mongo1:27017",
#        "priority": 2
#      }
#     ]
#  });
#EOF
mongosh --host mongo1:27017 <<EOF
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

# ========================================================================
# Update the code below for post-db-creation updates.
#
# For example, to import recipe data from an existing
# deployment, run "mongoimport" on those collections.
#

# pre-migration put the database and the changelog into its current state
#
# this should allow the migration to continue from the imported changelog
#cd /deployment/deployment/mongo/backups; \
#mongoimport --db='recipeBook' --collection='recipes' --host="$recipes_replica_set_name/mongo1" --file='recipes-export.json' --bypassDocumentValidation; \
#mongoimport --db='recipeBook' --collection='changelog' --host="$recipes_replica_set_name/mongo1" --file='changelog-export.json' --maintainInsertionOrder; \
#cd /
cd /deployment/deployment/mongo/backups; \
mongoimport --db='recipeBook' --collection='recipes' --host="$recipes_replica_set_name/mongo1,mongo2,mongo3" --file='recipes-export.json' --bypassDocumentValidation; \
mongoimport --db='recipeBook' --collection='changelog' --host="$recipes_replica_set_name/mongo1,mongo2,mongo3" --file='changelog-export.json' --maintainInsertionOrder; \
cd /

print "checking changelog"
#mongosh --host "$recipes_replica_set_name/mongo1" <<EOF
#use recipeBook;
#db.changelog.find();
#EOF
mongosh --host "$recipes_replica_set_name/mongo1,mongo2,mongo3" <<EOF
use recipeBook;
db.changelog.find();
EOF


