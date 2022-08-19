#!/bin/sh

echo "Locale files generation started..."
if [ -d  apps/main/src/locales/compiled ]; then
  echo "path exists"
  rm -rf 'apps/main/src/locales/compiled'
  echo "folder temp deleted"
else
  echo "No temp dir"
fi

for file in $(find apps/main/src/locales/* -name '*.json')
do
  echo "sara testing " $file
  npx formatjs compile $file --out-file 'apps/main/temp/'$file
  echo $file
done

mv 'apps/main/temp/apps/main/src/locales'  'apps/main/src/locales/compiled'
rm -rf 'apps/main/temp'

echo "Locale files generation completed!!"
