#!/bin/bash

# First parameter as directory
FEATURE_BRANCH=$(git branch --show-current)
CACHE_PATH="nxcache"

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
tar -cJf "$CACHE_PATH/nxcache.tar.xz" -C nxcachetmp .

#Delete cache directory
sudo rm -rf nxcachetmp

#create nx cache feature branch through slack "/alto-ci createfb ACX-73320 acx-ui-cache" before execute commands below
#commit cache
cd nxcache
if git rev-parse --verify "$FEATURE_BRANCH" > /dev/null 2>&1; then
    # Branch exists, so just switch to it
    git checkout "$FEATURE_BRANCH"
else
    # Branch doesn't exist, create it from master
    git checkout -b "$FEATURE_BRANCH" master
fi
git add .
git commit -m $FEATURE_BRANCH
git push --set-upstream -u origin $FEATURE_BRANCH