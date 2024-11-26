#!/bin/bash

RUN_COMMAND="node ./node_modules/.bin/nx"
NX_RUN_OPTIONS="--coverage --maxWorkers=30% --noStackTrace --bail"

export NX_DAEMON=false

set -xe

${RUN_COMMAND} run rc:test ${NX_RUN_OPTIONS}
${RUN_COMMAND} run rc-components:test ${NX_RUN_OPTIONS}
${RUN_COMMAND} run-many --target=test --projects=main,main-components ${NX_RUN_OPTIONS}
${RUN_COMMAND} run analytics-components:test ${NX_RUN_OPTIONS}
${RUN_COMMAND} run-many --target=test --projects=msp,msp-components ${NX_RUN_OPTIONS}
${RUN_COMMAND} run-many --target=test --all --exclude=rc,rc-components,main,analytics-components,msp,msp-components,main-components ${NX_RUN_OPTIONS}

mkdir -p /app/coverage
