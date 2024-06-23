#!/bin/sh

# migrates the mongo database cluster to the latest version found
# in dbmigrations/migrations
#
# note that the strategy here is the following:
#  - in the deployment/mongo/mongo_setup.sh script, do mongo imports of the collections
#    you would like to preserve. importantly, make sure that you export/import the
#    changelog collection that contains the current migration step. The migration will
#    then continue from the state of your collections to the latest version in this release
echo "migrating mongo..."
cd /usr/app/deployment/mongo
migrate-mongo up
cd /usr/app
