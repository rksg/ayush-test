import '@acx-ui/theme'

import { ConfigProvider } from '@acx-ui/components'

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
      <ConfigProvider lang='en-US'>
        <div>
          <Story />
        </div>
      </ConfigProvider>
    )
  }
]
