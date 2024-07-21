#!/bin/bash

# setups of security for mongo cluster:
#  1. sets up the key-file for internal cluster communication
#  2. sets up authentication for clients to access the database

printf "(mongo_security_setup) creating internal replica key-file..."
mkdir -p /deployment/deployment/mongo/generated
openssl rand -base64 756 > /deployment/deployment/mongo/generated/internal-replica-key-file.key
chmod 400 /deployment/deployment/mongo/generated/internal-replica-key-file.key
printf "done\n"
