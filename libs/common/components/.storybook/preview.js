import { ConfigProvider as ProProvider, enUSIntl } from '@ant-design/pro-provider'
import { ConfigProvider }                          from 'antd'
import enUS                                        from 'antd/lib/locale/en_US'

import '@acx-ui/theme'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  }
}

export const decorators = [
  (Story) => {
    return (
      <ConfigProvider locale={enUS}>
        <ProProvider value={{ intl: enUSIntl }}>
          <Story />
        </ProProvider>
      </ConfigProvider>
    )
  }
]
