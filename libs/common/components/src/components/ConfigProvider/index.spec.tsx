import '@testing-library/jest-dom'

import { default as AntConfigProvider } from 'antd/lib/config-provider'
import { rest }                         from 'msw'

import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { ConfigProvider } from '.'

type Props = { children: React.ReactNode }

jest.mock('antd/lib/config-provider', () => jest.fn().mockImplementation((props: Props) => <div
  {...props}
  data-testid='ant-pro-config-provider'
/>))

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  ConfigProvider: jest.fn().mockImplementation((props: Props) => <div
    {...props}
    data-testid='ant-config-provider'
  />)
}))

describe('ConfigProvider', () => {
  it('renders correctly', async () => {
    mockServer.use(rest.get(
      '/locales/compiled/en-US.json',
      (req, res, ctx) => res(ctx.json({ language: 'Language' }))
    ))

    render(
      <ConfigProvider>
        <div data-testid='target' />
      </ConfigProvider>
    )

    expect(await screen.findByTestId('target')).toBeVisible()

    await waitFor(() => {
      expect(AntConfigProvider).toHaveBeenCalledWith({
        children: expect.anything(),
        form: { validateMessages: expect.anything() },
        locale: expect.objectContaining({ language: 'Language' })
      }, {})
    })
  })
})
