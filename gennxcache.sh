#!/bin/bash

# Check if parameter is provided
if [ $# -eq 0 ]; then
    echo "Please provide a directory path"
    exit 1
fi

# First parameter as directory
FEATURE_BRANCH="feature/$1"
CACHE_PATH="nxcache/feature/$1"

# Check if directory does NOT exist
if [ ! -d "$CACHE_PATH" ]; then
    # Directory does not exist, so create it
    mkdir -p "$CACHE_PATH"
fi

#Build the Docker Image
sudo docker build -f Dockerfile.nxcache -t acx-ui-nx-cache .

#Create a Temporary Docker Container
sudo docker create --name temp-container acx-ui-nx-cache sh

#Copy the Cache from the Container
sudo docker cp temp-container:/app/node_modules/.cache/nx ./nxcachetmp

#Remove the Temporary Container
sudo docker rm temp-container

#Compress the Cache
tar -cvJf "$CACHE_PATH/nxcache.tar.xz" -C nxcachetmp .

#Delete cache directory
sudo rm -rf nxcachetmp

#create nx cache feature branch through slack "/alto-ci createfb ACX-73320 acx-ui-cache" before execute commands below
#commit cache
cd nxcache
git checkout -b $FEATURE_BRANCH
git add .
git commit -m $FEATURE_BRANCH
git push --set-upstream -u origin $FEATURE_BRANCH