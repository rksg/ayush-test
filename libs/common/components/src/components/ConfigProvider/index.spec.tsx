import '@testing-library/jest-dom'
import { ReactElement } from 'react'

import { default as AntConfigProvider } from 'antd/lib/config-provider'
import { IntlProvider }                 from 'react-intl'

import { render, screen }                   from '@acx-ui/test-utils'
import { LocaleContext, LocaleContextType } from '@acx-ui/utils'

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

jest.mock('react-intl', () => ({
  IntlProvider: jest.fn().mockImplementation((props) => require('react').createElement('div', {
    ...props,
    'data-testid': 'intl-provider'
  }))
}))

jest.mock('@acx-ui/utils', () => ({
  LocaleProvider: jest.fn().mockImplementation((props: Props) => <div
    {...props}
    data-testid='locale-provider'
  />),
  LocaleContext: { Consumer: jest.fn() }
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
    const context = {
      lang: 'en-US',
      messages: { language: 'Language' }
    } as unknown as LocaleContextType

    jest.mocked(LocaleContext.Consumer)
      // eslint-disable-next-line testing-library/no-node-access
      .mockImplementation((props) => props.children(context) as ReactElement)

    render(
      <ConfigProvider>
        <div data-testid='target' />
      </ConfigProvider>
    )

    expect(screen.getByTestId('target')).toBeVisible()

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

  it('renders nothing when messages not available', async () => {
    const context = {
      lang: 'en-US'
    } as unknown as LocaleContextType

    jest.mocked(LocaleContext.Consumer)
      // eslint-disable-next-line testing-library/no-node-access
      .mockImplementation((props) => props.children(context) as ReactElement)

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
