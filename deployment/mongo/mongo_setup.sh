#!/bin/bash

# To set up a mongo cluster with three nodes instead of just one you must
# uncomment and comment code in this file, and in the two other files.
#
# **See the compose.yaml file for full instructions for changes to other files.**
#
# In this file:
#  1. Comment out the "mongosh" command with the replica set holding only one node.
#  2. Uncomment the "mongosh" command with the replica set holding the three nodes.
#  3. Comment out the "cd" section with the two "mongo import" commands where the
#     host that refers only to "mongo1".
#  4. Uncomment the "cd" section with the two "mongo import" commands where the
#     host that refers two to "mongo1,mongo2,mongo3".
#  5. Comment out the "mongosh" command at the end of the file whose host refers
#     only to "mongo1".
#  6. Uncomment out the "mongosh" command at the end of the file whose host refers
#     to "mongo1,mongo2,mongo3".

#echo ">>>>>> Waiting for mongo1:27017 instance startup..."
#until mongosh --host mongo1:27017 --eval 'quit(db.runCommand({ ping: 1 }).ok ? 0 : 2)' &>/dev/null; do
#  printf '.'
#  sleep 1
#done
#echo ">>>>>> Working mongo1:27017 instance found, initiating user setup & initializing rs setup..."

#mongosh --host mongo1:27017 <<EOF
#  rs.initiate({
#    "_id": "recipesReplicaSet",
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

# set up the replica set, setting the priority for mongo1 higher
# than the others so that it will always be the PRIMARY
# Knowing that mongo1 will be the primary allows us to set up
# the admin and clusterAdmin users. The clusterAdmin user is used
# for communication between the replica sets.
#  db.getSiblingDB("admin").auth("looker", "he-w3nt-2-tHehou5eto-lo0k")
#
#mongosh --host mongo1:27017 <<EOF
#  db.getSiblingDB("admin").auth("admin", "admin")
#
#  rs.initiate({
#    "_id": "recipesReplicaSet",
#    "version": 1,
#    "members": [
#      {
#        "_id": 0,
#        "host": "mongo1:27017",
#        "priority": 2
#      },
#      {
#        "_id": 1,
#        "host": "mongo2:27017",
#        "priority": 0
#      },
#      {
#        "_id": 2,
#        "host": "mongo3:27017",
#        "priority": 0
#      }
#    ]
#  });
#
#  rs.status()
#EOF

### ========================================================================
### Add admin and clusterAdmin users to secure the database
##
#mongosh --host mongo1:27017 <<EOF
#var db_admin = "looker"
#var cluster_admin = "clusterer"
#var password = "he-w3nt-2-tHehou5eto-lo0k"
#
#var admin = db.getSiblingDB("admin")
#
#admin.createUser(
#  {
#    user: db_admin,
#    pwd: password,
#    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
#  }
#)
#
#admin.auth(db_admin, password)
#
#admin.createUser(
#  {
#    "user" : cluster_admin,
#    "pwd" : password,
#    roles: [ { "role" : "clusterAdmin", "db" : "admin" } ]
#  }
#)
#EOF

#mongosh --host mongo1:27017 <<EOF
#
#  var db_admin = "looker"
#  var cluster_admin = "clusterer"
#  var password = "he-w3nt-2-tHehou5eto-lo0k"
#
#  var admin = db.getSiblingDB("admin")
#
#  admin.auth(db_admin, password)
#
#  admin.createUser(
#    {
#      "user" : cluster_admin,
#      "pwd" : password,
#      roles: [ { "role" : "clusterAdmin", "db" : "admin" } ]
#    }
#  )
#EOF


#db_admin="looker"
#cluster_admin="clusterer"
#password="he w3nt 2 tHe hou\$e to lo0k"
#
#mongosh --host 'recipesReplicaSet/mongo1' <<EOF
#admin = db.getSiblingDB("admin")
#
#admin.createUser(
#  {
#    user: "$db_admin",
#    pwd: "$password",
#    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
#  }
#)
#
#admin.auth("$db_admin", "$password")
#
#admin.createUser(
#  {
#    "user" : "$cluster_admin",
#    "pwd" : "$password",
#    roles: [ { "role" : "clusterAdmin", "db" : "admin" } ]
#  }
#)
#EOF

# ========================================================================
# Add admin clusterAdmin users to secure the database

#mongosh --host 'recipesReplicaSet/localhost' <<EOF
#mongosh --host mongo1:27017 <<EOF
#
#  var db_admin = "looker"
#  var cluster_admin = "clusterer"
#  var password = "he-w3nt-2-tHehou5eto-lo0k"
#
#  var admin = db.getSiblingDB("admin")
#
#  admin.createUser(
#    {
#      user: db_admin,
#      pwd: password,
#      roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
#    }
#  )
#
#  admin.auth(db_admin, password)
#
#  admin.createUser(
#    {
#      "user" : cluster_admin,
#      "pwd" : password,
#      roles: [ { "role" : "clusterAdmin", "db" : "admin" } ]
#    }
#  )
#
#  rs.initiate({
#    "_id": "recipesReplicaSet",
#    "version": 1,
#    "members": [
#      {
#        "_id": 0,
#        "host": "mongo1:27017",
#        "priority": 2
#      },
#      {
#        "_id": 1,
#        "host": "mongo2:27017",
#        "priority": 0
#      },
#      {
#        "_id": 2,
#        "host": "mongo3:27017",
#        "priority": 0
#      }
#    ]
#  });
#EOF
#

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
#mongoimport --db='recipeBook' --collection='recipes' --host='recipesReplicaSet/mongo1' --file='recipes-export.json' --bypassDocumentValidation; \
#mongoimport --db='recipeBook' --collection='changelog' --host='recipesReplicaSet/mongo1' --file='changelog-export.json' --maintainInsertionOrder; \
#cd /
cd /deployment/deployment/mongo/backups; \
mongoimport --db='recipeBook' --collection='recipes' --host='recipesReplicaSet/mongo1,mongo2,mongo3' --file='recipes-export.json' --bypassDocumentValidation; \
mongoimport --db='recipeBook' --collection='changelog' --host='recipesReplicaSet/mongo1,mongo2,mongo3' --file='changelog-export.json' --maintainInsertionOrder; \
cd /

echo "checking changelog"
#mongosh --host 'recipesReplicaSet/mongo1' <<EOF
#use recipeBook;
#db.changelog.find();
#EOF
mongosh --host 'recipesReplicaSet/mongo1,mongo2,mongo3' <<EOF
use recipeBook;
db.changelog.find();
EOF


