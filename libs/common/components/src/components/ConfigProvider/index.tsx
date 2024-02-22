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
  onIntlError
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
  moment.locale(props.lang)
  const isMLISA = true //get('IS_MLISA_SA')
  return (
    <LocaleProvider lang={props.lang}>
      <LocaleContext.Consumer>
        {locale => (
          <IntlProvider locale={locale.lang}
            defaultRichTextElements={isMLISA ? {
              venueSingular: () => 'zone',
              venuePlural: () => 'zones',
              VenueSingular: () => 'Zone',
              VenuePlural: () => 'Zones'
            } : {
              venueSingular: () => 'venue',
              venuePlural: () => 'venues',
              VenueSingular: () => 'Venue',
              VenuePlural: () => 'Venues'
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

