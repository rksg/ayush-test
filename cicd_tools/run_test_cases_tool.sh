#!/bin/bash

RUN_COMMAND="node ./node_modules/.bin/jest -c"
NX_RUN_OPTIONS="--coverage --maxWorkers=40% --noStackTrace --bail"

if [ -z "${PRECOMMIT}" ] || [ "${PRECOMMIT}" == "true" ] || [ "${GIT_COMMIT_BRANCH}" == "master" ]; then

    ## Disrupt NX daemon exception.
    ${RUN_COMMAND} run --help > /dev/null 2>&1 & 

    set -xe

    echo "Start executing unit tests script file - ./cicd_tools/run_test_cases_tool.sh"

    ## All unit tests. ##
    ${RUN_COMMAND} apps/rc/jest.config.ts ${NX_RUN_OPTIONS}
    ${RUN_COMMAND} libs/rc/shared/components/jest.config.ts ${NX_RUN_OPTIONS}
    ${RUN_COMMAND} apps/main/jest.config.ts ${NX_RUN_OPTIONS}
    ${RUN_COMMAND} libs/main/components/jest.config.ts ${NX_RUN_OPTIONS}
    ${RUN_COMMAND} libs/analytics/components/jest.config.ts ${NX_RUN_OPTIONS}
    ${RUN_COMMAND} apps/msp/jest.config.ts ${NX_RUN_OPTIONS}
    ${RUN_COMMAND} libs/rc/msp/components/jest.config.ts ${NX_RUN_OPTIONS}
    ${RUN_COMMAND} libs/rc/switch/components/jest.config.ts ${NX_RUN_OPTIONS}
    ${RUN_COMMAND} libs/rc/edge/components/jest.config.ts ${NX_RUN_OPTIONS}
    ${RUN_COMMAND} libs/rc/wifi/components/jest.config.ts ${NX_RUN_OPTIONS}
    ${RUN_COMMAND} run-many --target=test --all --exclude=rc,rc-components,main,analytics-components,msp,msp-components,main-components,edge-components,switch-components,wifi-components ${NX_RUN_OPTIONS}
    ## All unit tests. ##
fi
