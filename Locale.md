This doc is for I18n management for local development

## Wrap contents with ways below to have them available in the locale JSON files

1. Use `$t`
    ```ts
    import { useIntl } from 'react-intl'

    function MyComponent () {
      const { $t } = useIntl()

      return <p>${$t({ defaultMessage: 'Content' })}</p>
    }
    ```
2. Use `FormattedMessage`
    ```ts
    import { FormattedMessage } from 'react-intl'

    function MyComponent () {
      return <FormattedMessage
        defaultMessage'<highlight>Content</highlight>'
        values={{
          highlight: (content) => <b>{content}</b>
        }}
      />
    }
    ```
3. Use `defineMessage`
    ```ts
    import {
      defineMessage,
      useIntl,
      FormattedMessage
    } from 'react-intl'

    const messages = {
      msg1: defineMessage({ defaultMessage: 'Message 1' }),
      msg2: defineMessage({ defaultMessage: 'Message 2' })
    }

    function MyComponent () {
      const { $t } = useIntl()
      return <div>
        {$t(messages.msg1)}
        <FormattedMessage {...messages.msg2}  />
      </div>
    }
    ```

4. Use `getIntl function` for usage outside of React

    Check the [IncidentTable services -> transformData method](apps/analytics/src/components/IncidentTable/services.ts) for usage outside of React.


## Commands & Steps to extract strings & word count for translator
```sh
# Extract latest i18n strings
git checkout origin/master         # Switch to the branch you wish to do the extraction
nvm use 14                         # switch to Node.js v14
./tools/docker/locales/generate.sh # extract and compile JSONs

# Unique Strings
# 1. Open apps/main/src/locales/compiled/en-US.json
# 2. Visually observe it, it will be total lines - 2

# Word Count
# 1. In VS Code open apps/main/src/locales/compiled/en-US.json
# 2. Go the last entry and add comma at the end, e.g. `"zz6ObK": "Restore",`
# 3. Find `": "`
# 4. Press (Option ⌥ + ⏎ Return)
# 5. Press (Right ▶) > (Command ⌘ + Delete) > (Command ⌘ + Right ▶) > Delete > Delete
# 6. Remove L1 and last line to remove the initial `{}` of JSON file
# 7. Save & run command below
wc -w apps/main/src/locales/compiled/en-US.json

# Unique Word Count
tr ' ' '\n' < apps/main/src/locales/compiled/en-US.json | sort | uniq -c | wc -l
```

Sample result
```
Unique Strings:     4,396
Word Count:        27,190
Unique Word Count:  5,367
```

## Update i18n messages for all locales

Run command below when there are new/updated contents added to the code base

```bash
./tools/docker/locales/generate.sh
```

### Extraction
```sh
npx formatjs extract '{apps,libs}/**/src/**/*.{ts,tsx}' --ignore='**/{*.d.ts,*.spec.ts,*.spec.tsx,stories.tsx}' --out-file apps/main/src/locales/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]' --additional-function-names '$t'
```

### Compiling Messages
```sh
npx formatjs compile apps/main/src/locales/en-US.json --out-file apps/main/src/locales/compiled/en-US.json
```

### Extract & Compile
```sh
npx formatjs extract '{apps,libs}/**/src/**/*.{ts,tsx}' --ignore='**/{*.d.ts,*.spec.ts,*.spec.tsx,stories.tsx}' --out-file apps/main/src/locales/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]' --additional-function-names '$t' && npx formatjs compile 'apps/main/src/locales/en-US.json' --out-file apps/main/src/locales/compiled/en-US.json
```

### Translation Management System (TMS) Integration
```sh
npx formatjs extract '{apps,libs}/**/src/**/*.{ts,tsx}' --ignore='**/{*.d.ts,*.spec.ts,*.spec.tsx,stories.tsx}' --out-file apps/main/src/locales/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]' --additional-function-names '$t' --format simple
```
