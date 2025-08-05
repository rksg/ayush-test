#!/bin/sh

# if [ -z "${PRECOMMIT}" ] || [ "${PRECOMMIT}" == "true" ] || [ "${GIT_COMMIT_BRANCH}" == "master" ]; then
#   echo "Conditions met: running tests"
# else
#   echo "Skipping tests (PRECOMMIT=$PRECOMMIT, BRANCH=$GIT_COMMIT_BRANCH)"
#   exit 0
# fi

NX_RUN_OPTIONS="--coverage --maxWorkers=30% --noStackTrace --bail --parallel=1"

AFFECTED_PROJECTS=$(cat /tmp/diff.txt)

PROJECT_LIST=$(echo "$AFFECTED_PROJECTS" | tr -d ' ')

if [ -z "$PROJECT_LIST" ]; then
  echo "No affected projects to test."
  exit 0
fi

echo "Testing affected projects: $PROJECT_LIST"

npx nx run-many --target=test --projects="$PROJECT_LIST" $NX_RUN_OPTIONS 
