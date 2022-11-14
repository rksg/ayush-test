import '@testing-library/jest-dom'

import { default as AntConfigProvider } from 'antd/lib/config-provider'
import { rest }                         from 'msw'

import { mockServer, render, screen } from '@acx-ui/test-utils'

import { Loader, LoaderProps } from '../Loader'

import { ConfigProvider } from '.'

type Props = { children: React.ReactNode }

jest.mock('antd/lib/config-provider', () => jest.fn().mockImplementation((props: Props) => <div
  {...props}
  data-testid='ant-pro-config-provider'
/>))

jest.mock('antd', () => ({
  ConfigProvider: jest.fn().mockImplementation((props: Props) => <div
    {...props}
    data-testid='ant-config-provider'
  />)
}))

jest.mock('../Loader', () => ({
  Loader: jest.fn().mockImplementation((props: LoaderProps) => <div
    data-testid='loader'
    // eslint-disable-next-line testing-library/no-node-access
    children={props.states?.some(v => v.isLoading) ? null : props.children}
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

    expect(AntConfigProvider).toHaveBeenCalledWith({
      children: expect.anything(),
      form: { validateMessages: expect.anything() },
      locale: expect.objectContaining({ language: 'Language' })
    }, {})
  })

  it('renders nothing when messages not available', async () => {
    mockServer.use(rest.get(
      '/locales/compiled/en-US.json',
      (req, res, ctx) => res(ctx.status(404))
    ))

    render(
      <ConfigProvider>
        <div data-testid='target' />
      </ConfigProvider>
    )

    const loader = screen.getByTestId('loader')
    expect(loader).toBeEmptyDOMElement()

    const expectedProps = expect.objectContaining({ states: [{ isLoading: true }] })
    expect(Loader).toHaveBeenCalledWith(expectedProps, {})
  })
})
