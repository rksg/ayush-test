#!/bin/bash

RUN_COMMAND="node ./node_modules/.bin/nx"

set -xe

${RUN_COMMAND} run rc:test --coverage --maxWorkers=30% --noStackTrace --bail
${RUN_COMMAND} run rc-components:test --coverage --maxWorkers=30% --noStackTrace --bail
${RUN_COMMAND} run-many --target=test --projects=main,main-components --coverage --maxWorkers=30% --noStackTrace --bail
${RUN_COMMAND} run analytics-components:test --coverage --maxWorkers=30% --noStackTrace --bail
${RUN_COMMAND} run-many --target=test --projects=msp,msp-components --coverage --maxWorkers=30% --noStackTrace --bail
${RUN_COMMAND} run-many --target=test --all --exclude=rc,rc-components,main,analytics-components,msp,msp-components,main-components --coverage --maxWorkers=30% --noStackTrace --bail

mkdir -p /app/coverage
