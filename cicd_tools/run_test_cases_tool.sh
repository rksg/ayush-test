#!/usr/bin/env bash

set -xe

GROUP=$1
RUN_COMMAND="node ./node_modules/.bin/nx"
FILE="./test_cases.table"

if ! source "$FILE"; then
    echo "Error: Failed to load $FILE."
    exit 1
fi

declare -n nx_params=$GROUP
if [ -z "${nx_params[*]}" ]; then
    echo "Error: Group '$GROUP' is empty or not defined."
    exit 1
fi

for nx_param in "${nx_params[@]}"; do
    cmd="${RUN_COMMAND} ${nx_param}"
    echo "Executing: $cmd"
    eval "$cmd" || { echo "Command failed: $cmd"; exit 1; }
done

COVERAGE_DIR="/app/coverage"
if ! mkdir -p "$COVERAGE_DIR"; then
    echo "Error: Unable to create $COVERAGE_DIR."
    exit 1
fi
