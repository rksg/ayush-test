#!/bin/bash

# Get all test files that have been added / updated on branch
updated_test_files_on_branch=$(git diff --name-only master...HEAD  | grep -E ".*\\.spec\\.(js|ts|tsx|jsx)$")

if [ -z "$updated_test_files_on_branch" ]; then
  echo "No new test files to test."
  exit 0
fi

for file in $updated_test_files_on_branch; do
  echo "Running test $file"
  # Run flaky test detector on file, 10 times
  npx flaky-test-detector --run-tests "node 'node_modules/.bin/jest' $file -c './jest.config.ts'" --test-output-file=./flaky-test-detector-results.xml --test-output-format=junit --repeat=10
done
