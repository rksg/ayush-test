#!/bin/sh

COMPILED_PATH="apps/main/src/locales/compiled"

echo "Locale files generation started..."

for file in $(find apps/main/src/locales/* -name '*.json' -not -path "$COMPILED_PATH/*")
do
  npx formatjs compile $file --out-file "$COMPILED_PATH/$(basename $file)"
  echo "compiled $file > $COMPILED_PATH/$(basename $file)"
done

echo "Locale files generation completed!!"
