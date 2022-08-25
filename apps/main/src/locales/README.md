# I18n strings extraction and compilation

## STEPS TO GENERATE LOCALE LANG FILES
###1 - Add new keys in the code eg - $t({ defaultMessage: 'New static string added' }) or defineMessage({ defaultMessage: 'Type:' })
###2 - Update apps/main/src/locales/en-US.json by running the default extraction  Refer to  [Locale.md](Locale.md)
###3 - Repeat step #2 to update apps/main/src/locales/[other-locale].json with new keys from apps/main/src/locales/en-US.json
###4 - To compile into apps/main/src/locales/compiled/[other-locale].json - Run sh ./tools/docker/localesGenerator.sh

For more Refer to  [Locale.md](Locale.md)
