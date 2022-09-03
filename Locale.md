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

4. Use `IntlSingleton` for usage outside of React
    ```ts
    import {
      IntlSingleton
    } from '@acx-ui/components'

    const intlInstance = IntlSingleton.getInstance()
    const intl = IntleSingleton.getIntl()!

    const messages = {
      msg1: intl.formatMessage({ defaultMessage: 'Message 1' }),
      msg2: intl.formatMessage({ defaultMessage: 'Message 1' })
    }

    function MyComponent () {
      return <div>
        {messages.msg1}
        {messages.msg2}
      </div>
    }

## Update i18n messages for all locales

Run command below when there are new/updated contents added to the code base

```bash
./tools/docker/locales/generate.sh
```

### Extraction
```sh
npx formatjs extract '{apps,libs}/**/src/**/*.{ts,tsx}' --ignore='**/*{.d.ts,.spec.ts,.spec.tsx}' --out-file apps/main/src/locales/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]' --additional-function-names '$t'
```

### Compiling Messages
```sh
npx formatjs compile apps/main/src/locales/en-US.json --out-file apps/main/src/locales/compiled/en-US.json
```

### Extract & Compile
```sh
npx formatjs extract '{apps,libs}/**/src/**/*.{ts,tsx}' --ignore='**/*{.d.ts,.spec.ts,.spec.tsx}' --out-file apps/main/src/locales/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]' --additional-function-names '$t' && npx formatjs compile 'apps/main/src/locales/en-US.json' --out-file apps/main/src/locales/compiled/en-US.json
```

### Translation Management System (TMS) Integration
```sh
npx formatjs extract '{apps,libs}/**/src/**/*.{ts,tsx}' --ignore='**/*{.d.ts,.spec.ts,.spec.tsx}' --out-file apps/main/src/locales/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]' --additional-function-names '$t' --format simple
```
