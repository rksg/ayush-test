#!/usr/bin/env bash

set -xe

GROUP=$1
RUN_COMMAND="node ./node_modules/.bin/nx"
FILE="./test_cases.table"

# Source the test cases file
source $FILE

    
# Dynamically reference the group array
declare -n nx_params=$GROUP

# Loop through and execute each command
for nx_param in "${nx_params[@]}"; do
    cmd="${RUN_COMMAND} ${nx_param}"
    echo "Executing: $cmd"
    eval "$cmd"
done

eval "mkdir -p /app/coverage"

