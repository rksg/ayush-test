#!/bin/sh

AFFECTED_PROJECTS=$(cat /tmp/diff.txt)

PROJECT_LIST=$(echo "$AFFECTED_PROJECTS" | tr -d ' ' | tr ',' ' ')

if [ -z "$PROJECT_LIST" ]; then
  echo "No affected projects to lint."
  exit 0
fi

echo "Linting affected projects: $PROJECT_LIST"

npx nx run-many --target=lint --projects="$PROJECT_LIST" --verbose
