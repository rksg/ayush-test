#!/bin/bash

# Get all test files that have been added / updated on branch
updated_test_files_on_branch=$(git diff --name-only origin/master...HEAD  | grep -E ".*\\.spec\\.(js|ts|tsx|jsx)$" | tr '\n' ' ')

if [ -z "$updated_test_files_on_branch" ]; then
  echo "No new test files to test."
  exit 0
fi

# Run flaky test detector on file, 7 times
npx flaky-test-detector --run-tests "node 'node_modules/.bin/jest' $updated_test_files_on_branch -c './jest.config.ts'" --test-output-file=./flaky-test-detector-results.xml --test-output-format=junit --repeat=7
