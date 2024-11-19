#!/usr/bin/env bash

set -xe

GROUP=$1
PRECOMMIT=$2
GIT_COMMIT_BRANCH=$3
RUN_COMMAND="node ./node_modules/.bin/nx"
FILE="./test_cases.table"

# Source the test cases file
source $FILE

# Check PRECOMMIT and GIT_COMMIT_BRANCH conditions
    
# Dynamically reference the group array
declare -n nx_params=$GROUP

# Loop through and execute each command
for nx_param in "${nx_params[@]}"; do
    cmd="${RUN_COMMAND} ${nx_param}"
    echo "Executing: $cmd"
    eval "node ./node_modules/.bin/nx run common-formatter:test --coverage --maxWorkers=50%"
    eval "node ./node_modules/.bin/nx run common-icons:test --coverage --maxWorkers=50%"
done
eval "mkdir -p /app/coverage"

