import React from 'react'

import { OnErrorFn, IntlErrorCode, MissingTranslationError } from '@formatjs/intl'
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

export const onError: OnErrorFn = (error) => {
  if (process.env['NODE_ENV'] === 'production') return
  if (error.code === IntlErrorCode.MISSING_TRANSLATION) return
  // eslint-disable-next-line no-console
  console.error(error)
}

export function ConfigProvider (props: ConfigProviderProps) {
  return (
    <LocaleProvider lang={props.lang}>
      <LocaleContext.Consumer>
        {context => <Loader states={[{ isLoading: !Boolean(context.messages) }]}>
          <IntlProvider locale={context.lang} messages={context.messages} onError={onError}>
            <AntConfigProvider locale={context.messages}>
              <AntProConfigProvider {...props} locale={context.messages} />
            </AntConfigProvider>
          </IntlProvider>
        </Loader>}
      </LocaleContext.Consumer>
    </LocaleProvider>
  )
}
