#!/bin/sh

SOURCE_PATH="apps/main/src/locales"
COMPILED_PATH="apps/main/src/locales/compiled"

echo "Locale files generation started..."

echo "Extract messages from source code"
npx formatjs extract '{apps,libs}/**/src/**/*.{ts,tsx}' \
  --ignore='**/{*.d.ts,*.spec.ts,*.spec.tsx,stories.tsx}' \
  --out-file apps/main/src/locales/en-US.json \
  --id-interpolation-pattern '[sha512:contenthash:base64:6]' \
  --additional-function-names '$t'

echo "Compile messages"
for file in $(find apps/main/src/locales/* -name '*.json' -not -path "$COMPILED_PATH/*")
do
  FILE_NAME="$(basename $file)"
  echo "$FILE_NAME: Processing..."
  if [ "$FILE_NAME" != "en-US.json" ]
  then
    echo "$FILE_NAME: Add/remove keys based on en-US.json"
    node tools/docker/locales/generate.js "$SOURCE_PATH/en-US.json" "$SOURCE_PATH/$FILE_NAME"
  fi
  npx formatjs compile $file --out-file "$COMPILED_PATH/$FILE_NAME"
  echo "$FILE_NAME: Compiled into $COMPILED_PATH/$FILE_NAME"
done

echo "Locale files generation completed!!"
