import '@testing-library/jest-dom'

import { MissingDataError, MissingTranslationError } from '@formatjs/intl'
import { default as AntConfigProvider }              from 'antd/lib/config-provider'
import { rest }                                      from 'msw'

import { mockServer, render, screen } from '@acx-ui/test-utils'

import { Loader, LoaderProps } from '../Loader'

import { ConfigProvider, onError } from '.'

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

  describe('onError', () => {
    const oldEnv = process.env

    beforeEach(() => {
      jest.spyOn(console, 'error')
    })

    afterEach(() => {
      process.env = oldEnv
      jest.restoreAllMocks()
    })

    const error = new Error('error')
    const missingTranslationError = new MissingTranslationError({}, 'en-US')
    const missingDataError = new MissingDataError('message', error)
    /* eslint-disable no-console */
    it('calls console error', () => {
      const err = missingDataError
      const logError = jest.mocked(console.error).mockImplementation(() => {})
      onError(err)
      expect(logError).toHaveBeenCalledWith(err)
    })
    it('silent MissingTranslationError', () => {
      const err = missingTranslationError
      onError(err)
      expect(jest.mocked(console.error)).not.toHaveBeenCalledWith(err)
    })
    it('silent in production', () => {
      process.env = { NODE_ENV: 'production' }
      const err = missingDataError
      onError(err)
      expect(jest.mocked(console.error)).not.toHaveBeenCalledWith(err)
    })
    /* eslint-enable no-console */
  })
})
