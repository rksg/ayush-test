#!/bin/sh
set -e

echo "Running tsc validation..."
for file in $(find apps libs -type f \( -name 'tsconfig.app.json' -or -name 'tsconfig.lib.json' \))
do
  FILE_NAME=$file
  DIR_NAME="$(dirname "${file}")"
  echo "Validating $DIR_NAME..."
  npx tsc --noemit -p $file
done
echo "All files pass tsc validation."
