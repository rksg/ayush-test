import React from 'react'

import { ConfigProvider as AntConfigProvider }    from 'antd'
import {
  default as AntProConfigProvider,
  ConfigProviderProps as AntConfigProviderProps
} from 'antd/lib/config-provider'
import moment                    from 'moment-timezone'
import { useIntl, IntlProvider } from 'react-intl'

import {
  LocaleProvider,
  LocaleContext,
  useLocaleContext,
  LocaleProviderProps,
  prepareAntdValidateMessages,
  onIntlError,
  getIntl,
  DEFAULT_SYS_LANG,
  setUpIntl,
  getJwtTokenPayload,
  AccountVertical
} from '@acx-ui/utils'

export type ConfigProviderProps = Omit<AntConfigProviderProps, 'locale'> & {
  lang?: LocaleProviderProps['lang']
}

function AntConfigProviders (props: ConfigProviderProps) {
  const locale = useLocaleContext()
  const validateMessages = prepareAntdValidateMessages(useIntl())

  return (
    <AntConfigProvider locale={locale.messages} form={{ validateMessages }}>
      <AntProConfigProvider {...props} locale={locale.messages} form={{ validateMessages }} />
    </AntConfigProvider>
  )
}

export function ConfigProvider (props: ConfigProviderProps) {
  try {
    getIntl()
  } catch (error) {
    setUpIntl({ locale: props.lang || DEFAULT_SYS_LANG })
  }
  const { $t } = getIntl()
  const { acx_account_vertical } = getJwtTokenPayload()
  moment.locale(props.lang)
  return (
    <LocaleProvider lang={props.lang}>
      <LocaleContext.Consumer>
        {locale => (
          <IntlProvider locale={locale.lang}
            defaultRichTextElements={acx_account_vertical === AccountVertical.HOSPITALITY ? {
              venueSingular: () => $t({ defaultMessage: 'space' }),
              venuePlural: () => $t({ defaultMessage: 'spaces' }),
              VenueSingular: () => $t({ defaultMessage: 'Space' }),
              VenuePlural: () => $t({ defaultMessage: 'Spaces' })
            } : {
              venueSingular: () => $t({ defaultMessage: 'venue' }),
              venuePlural: () => $t({ defaultMessage: 'venues' }),
              VenueSingular: () => $t({ defaultMessage: 'Venue' }),
              VenuePlural: () => $t({ defaultMessage: 'Venues' })
            }}
            messages={locale.messages}
            onError={onIntlError}
          >
            <AntConfigProviders {...props} />
          </IntlProvider>
        )}
      </LocaleContext.Consumer>
    </LocaleProvider>
  )
}

