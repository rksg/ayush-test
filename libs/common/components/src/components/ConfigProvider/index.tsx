import React from 'react'

import { ConfigProvider as AntConfigProvider }    from 'antd'
import {
  default as AntProConfigProvider,
  ConfigProviderProps as AntConfigProviderProps
} from 'antd/lib/config-provider'
import { useIntl, IntlProvider } from 'react-intl'

import {
  LocaleProvider,
  LocaleContext,
  LocaleProviderProps,
  prepareAntdValidateMessages,
  onIntlError
} from '@acx-ui/utils'

import { Loader } from '../Loader'

export type ConfigProviderProps = Omit<AntConfigProviderProps, 'locale'> & {
  lang?: LocaleProviderProps['lang']
}

function AntConfigProviders (props: ConfigProviderProps) {
  const context = React.useContext(LocaleContext)
  const validateMessages = prepareAntdValidateMessages(useIntl())

  return (
    <AntConfigProvider locale={context.messages} form={{ validateMessages }}>
      <AntProConfigProvider {...props} locale={context.messages} form={{ validateMessages }} />
    </AntConfigProvider>
  )
}

export function ConfigProvider (props: ConfigProviderProps) {
  return (
    <LocaleProvider lang={props.lang}>
      <LocaleContext.Consumer>
        {context => (
          <Loader states={[{ isLoading: !Boolean(context.messages) }]}>
            <IntlProvider locale={context.lang} messages={context.messages} onError={onIntlError}>
              <AntConfigProviders {...props} />
            </IntlProvider>
          </Loader>
        )}
      </LocaleContext.Consumer>
    </LocaleProvider>
  )
}

