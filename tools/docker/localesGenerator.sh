#!/bin/sh

for file in $(find apps/main/src/locales/* -name '*.json' -not -path 'apps/main/src/locales/compiled/*')
do
  npx formatjs compile $file --out-file "apps/main/src/locales/compiled/$(basename $file)"
  echo "compiled $file"
done

echo "Locale files generation completed!!"
