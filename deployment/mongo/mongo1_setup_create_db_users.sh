##!/bin/bash
#
#print "###### Waiting for mongo1:27017 instance startup.."
#until mongosh --host mongo1:27017 --eval 'quit(db.runCommand({ ping: 1 }).ok ? 0 : 2)' &>/dev/null; do
#  print '.'
#  sleep 1
#done
#print "###### Working mongo1:27017 instance found"
