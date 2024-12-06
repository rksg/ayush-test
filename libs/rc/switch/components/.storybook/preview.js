import '@acx-ui/theme'

import { ConfigProvider } from '@acx-ui/components'
import { useLocaleContext } from '@acx-ui/utils'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  },
  options: {
    storySort: {
      method: 'alphabetical'
    }
  }
}

export const decorators = [
  (Story) => {
    return (
      <ConfigProvider lang='en-US'>
        <div>
          <WaitLocale>
            <Story />
          </WaitLocale>
        </div>
      </ConfigProvider>
    )
  }
]

function WaitLocale (props) {
  const locale = useLocaleContext()

  if (!locale.messages) return null
  return props.children
}
