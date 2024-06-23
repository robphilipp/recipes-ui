#!/bin/bash
sleep 10
mongosh --host mongo1:27017 <<EOF
  rs.initiate({
    "_id": "recipesReplicaSet",
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
cd /deployment/deployment/mongo/backups; \
mongoimport --db='recipeBook' --collection='recipes' --host='recipesReplicaSet/mongo1,mongo2,mongo3' --file='recipes-export.json' --bypassDocumentValidation; \
mongoimport --db='recipeBook' --collection='changelog' --host='recipesReplicaSet/mongo1,mongo2,mongo3' --file='changelog-export.json' --maintainInsertionOrder; \
cd /

echo "checking changelog"
mongosh --host 'recipesReplicaSet/mongo1,mongo2,mongo3' <<EOF
use recipeBook;
db.changelog.find();
EOF


