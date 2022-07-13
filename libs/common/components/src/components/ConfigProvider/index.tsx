import React from 'react'

import {
  ConfigProvider as AntConfigProvider
}    from 'antd'
import {
  default as AntProConfigProvider,
  ConfigProviderProps as AntConfigProviderProps
} from 'antd/lib/config-provider'
import { IntlProvider } from 'react-intl'

import { LocaleProvider, LocaleContext, LocaleProviderProps } from '@acx-ui/utils'

export type ConfigProviderProps = Omit<AntConfigProviderProps, 'locale'> & {
  lang?: LocaleProviderProps['lang']
}

export function ConfigProvider (props: ConfigProviderProps) {
  return (
    <LocaleProvider lang={props.lang}>
      <LocaleContext.Consumer>
        {context => context.messages ? (
          <IntlProvider locale={context.lang} messages={context.messages}>
            <AntConfigProvider locale={context.messages}>
              <AntProConfigProvider {...props} locale={context.messages} />
            </AntConfigProvider>
          </IntlProvider>
        ) : null}
      </LocaleContext.Consumer>
    </LocaleProvider>
  )
}
