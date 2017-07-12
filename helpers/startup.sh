#!/usr/bin/env bash

COLOR_GREEN='\033[0;32m'

echo ""

# Start the ssh service. This is required by the playable web server
service ssh start

# Check if volume needs to be mounted from S3

if [[ ${MOUNT_S3} = "True" ]];
  then
    echo "Mounting Amazon S3 Bucket to /opt/ansible-projects"
    yas3fs s3://${S3_PATH} /opt/ansible-projects -f
fi

# Start MongoDB database in the background
mongod &

# Serve web server
gulp serve:dist:no_build
