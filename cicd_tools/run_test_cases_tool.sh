#!/bin/bash

RUN_COMMAND="node ./node_modules/.bin/nx"
NX_RUN_OPTIONS="--coverage --maxWorkers=30% --noStackTrace --bail --memoryLimit=4096"

if [ -z "${PRECOMMIT}" ] || [ "${PRECOMMIT}" == "true" ] || [ "${GIT_COMMIT_BRANCH}" == "master" ]; then

    ## Disrupt NX daemon exception.
    ${RUN_COMMAND} run --help > /dev/null 2>&1 & 

    set -xe

    echo "Start executing unit tests script file - ./cicd_tools/run_test_cases_tool.sh"

    ## All unit tests. ##
    CICD_BUILD=true ${RUN_COMMAND} run rc:test ${NX_RUN_OPTIONS}
    CICD_BUILD=true ${RUN_COMMAND} run rc-components:test ${NX_RUN_OPTIONS}
    CICD_BUILD=true ${RUN_COMMAND} run-many --target=test --projects=main,main-components ${NX_RUN_OPTIONS}
    CICD_BUILD=true ${RUN_COMMAND} run analytics-components:test ${NX_RUN_OPTIONS}
    CICD_BUILD=true ${RUN_COMMAND} run-many --target=test --projects=msp,msp-components ${NX_RUN_OPTIONS}
    CICD_BUILD=true ${RUN_COMMAND} run-many --target=test --all --exclude=rc,rc-components,main,analytics-components,msp,msp-components,main-components ${NX_RUN_OPTIONS}
    ## All unit tests. ##
fi
