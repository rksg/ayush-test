#!/bin/bash

new_test_files=$(git diff --cached --name-only --diff-filter=AMRT | grep -E ".*\\.spec\\.(js|ts|tsx|jsx)$")

echo $new_test_files

if [ -z "$new_test_files" ]; then
  echo "No new test files to lint."
  exit 0
fi

for file in $new_test_files; do
  echo  "Running test $file"
  npx flaky-test-detector --run-tests "node 'node_modules/.bin/jest' $file -c './jest.config.ts'" --test-output-file=./test-results.xml --test-output-format=junit --repeat=5
done