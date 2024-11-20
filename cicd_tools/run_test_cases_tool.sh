#!/bin/bash

trap 'echo "Caught SIGTERM, exiting gracefully"; exit 0' SIGTERM SIGINT

set -xe

node ./node_modules/.bin/nx run rc:test --coverage --maxWorkers=30% --noStackTrace --bail
node ./node_modules/.bin/nx run rc-components:test --coverage --maxWorkers=30% --noStackTrace --bail
node ./node_modules/.bin/nx run-many --target=test --projects=main,main-components --coverage --maxWorkers=30% --noStackTrace --bail
node ./node_modules/.bin/nx run analytics-components:test --coverage --maxWorkers=30% --noStackTrace --bail
node ./node_modules/.bin/nx run-many --target=test --projects=msp,msp-components --coverage --maxWorkers=30% --noStackTrace --bail
node ./node_modules/.bin/nx run-many --target=test --all --exclude=rc,rc-components,main,analytics-components,msp,msp-components,main-components --coverage --maxWorkers=30% --noStackTrace --bail

mkdir -p /app/coverage

