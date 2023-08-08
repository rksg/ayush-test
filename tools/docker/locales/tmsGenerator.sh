#!/bin/sh

echo 'Translation Management System (TMS) Integration with I18n delta diff'
node -v
echo "$HOME"
file_path="$HOME/workspace"
locales_path=apps/main/src/locales
source_path=$file_path/acx-ui/$locales_path
destination_path=$file_path/acx-ui-static-resources
echo "$NVM_DIR"
source "$NVM_DIR/nvm.sh"
nvm use 14.10
node -v

echo '***** Copying en-US un-compiled and compiled files to repo acx-ui-static-resource > i18n-diff *****'

npx formatjs extract '{apps,libs}/**/src/**/*.{ts,tsx}' --ignore='**/{*.d.ts,*.spec.ts,*.spec.tsx,stories.tsx}' --out-file $locales_path/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]' --additional-function-names '$t'
npx formatjs compile "$locales_path/en-US.json" --out-file "$locales_path/compiled/en-US.json"

cp "$source_path/en-US.json" "$destination_path/i18n-diff/en-US.json"
cp "$source_path/en-US.json" "$destination_path/locales/en-US.json"
cp "$source_path/compiled/en-US.json" "$destination_path/locales/compiled/en-US.json"

echo '***** Copying completed to i18n-diff *****'
