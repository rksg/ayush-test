import React from 'react'

import { OnErrorFn, IntlErrorCode }               from '@formatjs/intl'
import { ConfigProvider as AntConfigProvider }    from 'antd'
import {
  default as AntProConfigProvider,
  ConfigProviderProps as AntConfigProviderProps
} from 'antd/lib/config-provider'
import { useIntl, RawIntlProvider } from 'react-intl'

import { LocaleProvider, LocaleContext, LocaleProviderProps, prepareAntdValidateMessages, IntlSingleton } from '@acx-ui/utils'

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
        {context => {
          // singleton pattern, called withing changing react context
          const intlInstance = IntlSingleton.getInstance()
          intlInstance.setUpIntl({
            locale: context.lang,
            messages: context.messages,
            onError
          })
          return (<Loader states={[{ isLoading: !Boolean(context.messages) }]}>
            <RawIntlProvider value={intlInstance.getIntl()!} >
              <AntConfigProviders {...props} />
            </RawIntlProvider>
          </Loader>)}}
      </LocaleContext.Consumer>
    </LocaleProvider>
  )
}

