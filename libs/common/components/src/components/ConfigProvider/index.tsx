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

import { Loader } from '../Loader'

export type ConfigProviderProps = Omit<AntConfigProviderProps, 'locale'> & {
  lang?: LocaleProviderProps['lang']
}

export function ConfigProvider (props: ConfigProviderProps) {
  return (
    <LocaleProvider lang={props.lang}>
      <LocaleContext.Consumer>
        {context => <Loader states={[{ isLoading: !Boolean(context.messages) }]}>
          <IntlProvider locale={context.lang} messages={context.messages}>
            <AntConfigProvider locale={context.messages}>
              <AntProConfigProvider {...props} locale={context.messages} />
            </AntConfigProvider>
          </IntlProvider>
        </Loader>}
      </LocaleContext.Consumer>
    </LocaleProvider>
  )
}
