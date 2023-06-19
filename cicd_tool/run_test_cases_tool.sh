#!/usr/bin/env bash

GROUP=$1
RUN_COMMAND="node ./node_modules/.bin/nx"
FILE="./test_cases.table"

source $FILE

IFS=$'\n'

declare -n nx_params=$GROUP

for nx_param in ${nx_params[@]}
do
    cmd="${RUN_COMMAND} ${nx_param}"
    echo $cmd
    bash -c $cmd
    ret=$?
    echo "ret: $ret"
    if [ ! "$ret" -eq 0 ]; then
        echo "$cmd"
        echo "[Fail] Test case is failure."
        exit 1
    fi
done

bash -c "mkdir -p /app/coverage"
