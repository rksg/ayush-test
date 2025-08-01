#!/bin/sh

NX_RUN_OPTIONS="--coverage --maxWorkers=30% --noStackTrace --bail"

AFFECTED_PROJECTS=$(cat /app/test.txt)

IFS=',' read -ra PROJECTS <<< "$AFFECTED_PROJECTS"

for project in "${PROJECTS[@]}"; do
  echo "🔧 Running test for project: $project"
  nx run "$project:test" $NX_RUN_OPTIONS || exit 1
done
