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
  getReSkinningElements
} from '@acx-ui/utils'

const getAntdPopupContainer = (triggerNode: HTMLElement | undefined) => {
  if (triggerNode?.closest('.ant-select-selector')) {
    return triggerNode.parentElement ?? document.body
  }
  return document.body
}

export type ConfigProviderProps = Omit<AntConfigProviderProps, 'locale'> & {
  lang?: LocaleProviderProps['lang']
}

function AntConfigProviders (props: ConfigProviderProps) {
  const locale = useLocaleContext()
  const validateMessages = prepareAntdValidateMessages(useIntl())

  return (
    <AntConfigProvider locale={locale.messages}
      form={{ validateMessages }}
      getPopupContainer={getAntdPopupContainer}
    >
      <AntProConfigProvider {...props}
        locale={locale.messages}
        form={{ validateMessages }}
      />
    </AntConfigProvider>
  )
}

export function ConfigProvider (props: ConfigProviderProps) {
  moment.locale(props.lang)
  return (
    <LocaleProvider lang={props.lang}>
      <LocaleContext.Consumer>
        {locale => (
          <IntlProvider locale={locale.lang}
            defaultRichTextElements={getReSkinningElements(locale)}
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

