import React from 'react'

import {
  default as AntConfigProvider,
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
            <AntConfigProvider {...props} locale={context.messages} />
          </IntlProvider>
        ) : null}
      </LocaleContext.Consumer>
    </LocaleProvider>
  )
}
