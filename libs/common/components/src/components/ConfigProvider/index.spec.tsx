import '@testing-library/jest-dom'
import { default as AntConfigProvider } from 'antd/lib/config-provider'
import { IntlProvider }                 from 'react-intl'

import { render, screen, waitFor } from '@acx-ui/test-utils'

import { ConfigProvider } from '.'

type Props = { children: React.ReactNode }
type Context = {
  lang: string
  messages: Record<string, string>
}
type PropsRender = { children: (context: Context) => React.ReactElement }

jest.mock('antd/lib/config-provider', () => jest.fn().mockImplementation((props: Props) => <div
  {...props}
  data-testid='ant-config-provider'
/>))

jest.mock('@acx-ui/utils', () => ({
  LocaleProvider: jest.fn().mockImplementation((props: Props) => <div {...props} />),
  LocaleContext: {
    // eslint-disable-next-line testing-library/no-node-access
    Consumer: jest.fn().mockImplementation((props: PropsRender) => props.children({
      lang: 'en-US',
      messages: { language: 'Language' }
    }))
  }
}))

describe('ConfigProvider', () => {
  it('renders correctly', async () => {
    render(
      <ConfigProvider>
        <div data-testid='target' />
      </ConfigProvider>
    )

    await waitFor(() => expect(screen.getByTestId('target')).toBeVisible())

    expect(AntConfigProvider).toHaveBeenCalledWith({
      children: expect.anything(),
      locale: { language: 'Language' }
    }, {})
    expect(IntlProvider).toHaveBeenCalledWith({
      locale: 'en-US',
      messages: { language: 'Language' },
      children: expect.anything()
    }, {})
  })
})
