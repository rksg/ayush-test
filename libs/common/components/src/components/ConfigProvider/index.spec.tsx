import '@testing-library/jest-dom'

import {
  default as AntProConfigProvider,
  ConfigProviderProps as AntConfigProviderProps
} from 'antd/lib/config-provider'
import { rest } from 'msw'

import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { ConfigProvider, getAntdPopupContainer } from '.'

type Props = { children: React.ReactNode }

jest.mock('antd/lib/config-provider', () => jest.fn().mockImplementation((props: Props) => <div
  {...props}
  data-testid='ant-pro-config-provider'
/>))

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  // eslint-disable-next-line max-len
  ConfigProvider: jest.fn().mockImplementation(({ getPopupContainer, ...props }: React.FC<AntConfigProviderProps>) => <div
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
      expect(AntProConfigProvider).toHaveBeenCalledWith({
        children: expect.anything(),
        form: { validateMessages: expect.anything() },
        locale: expect.objectContaining({ language: 'Language' })
      }, {})
    })
  })
})

describe('getAntdPopupContainer', () => {
  it('returns parent element if triggerNode has parent with class .ant-select-selector', () => {
    const triggerNode = document.createElement('div')
    const parentElement = document.createElement('div')
    parentElement.classList.add('ant-select-selector')
    parentElement.appendChild(triggerNode)
    document.body.appendChild(parentElement)
    const result = getAntdPopupContainer(triggerNode)
    expect(result).toBe(parentElement)
  })

  it('returns parent element if triggerNode has class .ant-select-selector', () => {
    const triggerNode = document.createElement('div')
    triggerNode.classList.add('ant-select-selector')
    const parentElement = document.createElement('div')
    parentElement.appendChild(triggerNode)
    document.body.appendChild(parentElement)
    const result = getAntdPopupContainer(triggerNode)
    expect(result).toBe(parentElement)
  })

  // eslint-disable-next-line max-len
  it('returns document.body if triggerNode has class .ant-select-selector but parent element is null', () => {
    const triggerNode = document.createElement('div')
    triggerNode.classList.add('ant-select-selector')
    const result = getAntdPopupContainer(triggerNode)
    expect(result).toBe(document.body)
  })

  it('returns document.body if triggerNode is undefined', () => {
    const result = getAntdPopupContainer(undefined)
    expect(result).toBe(document.body)
  })
})