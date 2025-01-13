#!/bin/bash

# new_test_files=$(git diff --cached --name-only master...HEAD --diff-filter=AMRT | grep -E ".*\\.spec\\.(js|ts|tsx|jsx)$")
new_test_files_on_branch=$(git diff --name-only master...HEAD  | grep -E ".*\\.spec\\.(js|ts|tsx|jsx)$")

if [ -z "$new_test_files_on_branch" ]; then
  echo "No new test files to test."
  exit 0
fi

for file in $new_test_files_on_branch; do
  echo  "Running test $file"
  npx flaky-test-detector --run-tests "node 'node_modules/.bin/jest' $file -c './jest.config.ts'" --test-output-file=./flaky-test-detector-results.xml --test-output-format=junit --repeat=10
done