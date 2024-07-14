#!/bin/bash

print "###### Waiting for mongo1:27017 instance startup.."
until mongosh --host mongo1:27017 --eval 'quit(db.runCommand({ ping: 1 }).ok ? 0 : 2)' &>/dev/null; do
  print '.'
  sleep 1
done
print "###### Working mongo1:27017 instance found"


#mongod --replSet recipesReplicaSet --bind_ip localhost,mongo1 --keyFile /data/authentication/internal-replica-key-file.key
#
#echo "###### Waiting for localhost:27017 instance startup.."
#until mongosh --host localhost:27017 --eval 'quit(db.runCommand({ ping: 1 }).ok ? 0 : 2)' &>/dev/null; do
#  printf '.'
#  sleep 1
#done
#echo "###### Working localhost:27017 instance found, initiating user setup & initializing rs setup.."

## set up the replica set, setting the priority for mongo1 higher
## than the others so that it will always be the PRIMARY
## Knowing that mongo1 will be the primary allows us to set up
## the admin and clusterAdmin users. The clusterAdmin user is used
## for communication between the replica sets.
#mongosh <<EOF
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
#  rs.status();
#EOF

#mongosh --host localhost:27017 <<EOF
#
#  var db_admin = "looker"
#  var password = "he-w3nt-2-tHehou5eto-lo0k"
#
#  var admin = db.getSiblingDB("admin")
#
#  admin.createUser(
#    {
#      "user" : db_admin,
#      "pwd" : password,
#      roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
#    }
#  )
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

# ========================================================================
# Add admin clusterAdmin users to secure the database
#
#db_admin="looker"
#cluster_admin="clusterer"
#password="he-w3nt-2-tHehou5eto-lo0k"
#
##mongosh --host 'recipesReplicaSet/localhost' <<EOF
#mongosh <<EOF
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