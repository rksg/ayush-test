#!/bin/sh

if [ -z "${PRECOMMIT}" ] || [ "${PRECOMMIT}" == "true" ] || [ "${GIT_COMMIT_BRANCH}" == "master" ]; then
  echo "Conditions met: running tests"
else
  echo "Skipping tests (PRECOMMIT=$PRECOMMIT, BRANCH=$GIT_COMMIT_BRANCH)"
  exit 0
fi

NX_RUN_OPTIONS="--coverage --maxWorkers=30% --noStackTrace --bail"

AFFECTED_PROJECTS=$(cat /tmp/diff.txt)

PROJECT_LIST=$(echo "$AFFECTED_PROJECTS" | tr -d ' ' | tr ',' ' ')

echo "Testing affected projects: $PROJECT_LIST"

for project in $PROJECT_LIST; do
  echo "Running test for project: $project"
  node ./node_modules/.bin/nx run "$project:test" $NX_RUN_OPTIONS || exit 1
done