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
if [[ "$PRECOMMIT" == "true" || "$GIT_COMMIT_BRANCH" == "master" ]]; then
    echo "Conditions met: PRECOMMIT=$PRECOMMIT or GIT_COMMIT_BRANCH=$GIT_COMMIT_BRANCH"
    
    # Dynamically reference the group array
    declare -n nx_params=$GROUP

    # Loop through and execute each command
    for nx_param in "${nx_params[@]}"; do
        cmd="${RUN_COMMAND} ${nx_param}"
        echo "Executing: $cmd"
        eval "$cmd"
    done
else
    echo "Conditions not met: Creating /app/coverage instead"
    eval "mkdir -p /app/coverage"
fi

