import React from 'react'

import { ConfigProvider as AntConfigProvider }    from 'antd'
import {
  default as AntProConfigProvider,
  ConfigProviderProps as AntConfigProviderProps
} from 'antd/lib/config-provider'
import moment                    from 'moment-timezone'
import { useIntl, IntlProvider } from 'react-intl'

import { get }  from '@acx-ui/config'
import {
  LocaleProvider,
  LocaleContext,
  useLocaleContext,
  LocaleProviderProps,
  prepareAntdValidateMessages,
  onIntlError,
  getIntl,
  DEFAULT_SYS_LANG,
  setUpIntl
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
  setUpIntl({ locale: props.lang || DEFAULT_SYS_LANG })
  const { $t } = getIntl()
  moment.locale(props.lang)
  const isMLISA = true //get('IS_MLISA_SA')
  return (
    <LocaleProvider lang={props.lang}>
      <LocaleContext.Consumer>
        {locale => (
          <IntlProvider locale={locale.lang}
            defaultRichTextElements={isMLISA ? {
              venueSingular: () => $t({ defaultMessage: 'zone' }),
              venuePlural: () => $t({ defaultMessage: 'zones' }),
              VenueSingular: () => $t({ defaultMessage: 'Zone' }),
              VenuePlural: () => $t({ defaultMessage: 'Zones' })
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

