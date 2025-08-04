#!/bin/sh

NX_RUN_OPTIONS="--coverage --maxWorkers=30% --noStackTrace --bail"

AFFECTED_PROJECTS=$(cat /tmp/diff.txt)

PROJECT_LIST=$(echo "$AFFECTED_PROJECTS" | tr -d ' ' | tr ',' ' ')

echo "Testing affected projects: $PROJECT_LIST"

for project in $PROJECT_LIST; do
  echo "Running test for project: $project"
  npx nx run "$project:test" $NX_RUN_OPTIONS || exit 1
done
