#!/usr/bin/env bash

COLOR_GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${COLOR_GREEN}-----------------------------------------------------"
echo -e "              Start SSH Service"
echo -e "-----------------------------------------------------${NC}"

# Start the ssh service. This is required by the playable web server
service ssh start

# Check if volume needs to be mounted from S3

if [[ ${MOUNT_S3} = "True" ]];
  then
    echo -e "${COLOR_GREEN}-----------------------------------------------------"
    echo "       Mounting Amazon S3 Bucket to /opt/ansible-projects"
    echo -e "-----------------------------------------------------${NC}"
    yas3fs s3://${S3_PATH} /opt/ansible-projects -f &
fi

echo -e "${COLOR_GREEN}-----------------------------------------------------"
echo -e "              Start MONGODB Service"
echo -e "-----------------------------------------------------${NC}"
# Start MongoDB database in the background
mongod &

echo -e "${COLOR_GREEN}-----------------------------------------------------"
echo -e "              Start Web Server"
echo -e "-----------------------------------------------------${NC}"
# Serve web server
gulp serve:dist:no_build
