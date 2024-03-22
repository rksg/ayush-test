import '@testing-library/jest-dom'
import { AnyAction, Dispatch, MiddlewareAPI } from '@reduxjs/toolkit'
import { rest }                               from 'msw'
import { createRoot }                         from 'react-dom/client'
import { addMiddleware }                      from 'redux-dynamic-middlewares'

import { showActionModal }         from '@acx-ui/components'
import { act, screen, mockServer } from '@acx-ui/test-utils'

import { showExpiredSessionModal, init } from './bootstrap'

jest.mock('./AllRoutes', () => () => <div data-testid='all-routes' />)
jest.mock('@acx-ui/theme', () => {}, { virtual: true })
jest.mock('redux-dynamic-middlewares', () => ({
  ...jest.requireActual('redux-dynamic-middlewares'),
  addMiddleware: jest.fn()
}))
const middleware = jest.mocked(addMiddleware)
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showActionModal: jest.fn(),
  ConfigProvider: (props: { children: React.ReactNode }) => <div
    {...props}
    data-testid='config-provider'
  />
}))
const actionModal = jest.mocked(showActionModal)
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  renderPendo: jest.fn(),
  LocaleProvider: (props: { children: React.ReactNode }) => <div
    {...props}
    data-testid='locale-provider'
  />,
  useLocaleContext: () => ({
    messages: { 'en-US': { lang: 'Language' } },
    lang: 'en-US'
  }),
  getIntl: jest.fn().mockReturnValue({ $t: jest.fn() }),
  setUpIntl: jest.fn()
}))
jest.mock('@acx-ui/analytics/utils')
const renderPendo = jest.mocked(require('@acx-ui/utils').renderPendo)
jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  setUserProfile: () => {},
  getPendoConfig: jest.fn().mockImplementation(() => ({
    account: {
      id: 'tid1',
      name: 'n1',
      isTrial: true,
      productName: 'RuckusAI'
    },
    visitor: {
      delegated: false,
      email: 'e1',
      full_name: 'fn1 ln1',
      id: 'uid1',
      region: 'test region',
      role: 'r1',
      support: true,
      varTenantId: 'tid1',
      version: 'test version'
    }
  }
  )),
  getUserProfile: () => ({
    preferences: {
      preferredLanguage: 'en-US'
    }
  })
}))
jest.mock('@acx-ui/config', () => ({
  get: jest.fn().mockImplementation((name: string) => ({
    MLISA_REGION: 'test region',
    MLISA_VERSION: 'test version'
  })[name] as string)
}))

describe('bootstrap.init', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...window.location,
        reload: jest.fn()
      }
    })
  })
  afterEach(() => {
    mockServer.resetHandlers()
  })
  it('calls pendo and renders', async () => {
    mockServer.use(
      rest.get(
        '/analytics/api/rsa-mlisa-rbac/users/profile',
        (_req, res, ctx) => res(ctx.json({
          tenants: [{
            id: 'tid1',
            name: 'n1',
            isTrial: true,
            support: true,
            role: 'r1'
          }, {
            id: 'tid2',
            name: 'n2',
            isTrial: false,
            support: false,
            role: 'r2'
          }],
          userId: 'uid1',
          firstName: 'fn1',
          lastName: 'ln1',
          accountId: 'tid1',
          email: 'e1'
        }))
      )
    )
    const rootEl = document.createElement('div')
    rootEl.id = 'root'
    document.body.appendChild(rootEl)
    const root = createRoot(rootEl)
    await act(() => init(root))
    expect(screen.getByTestId('all-routes')).toBeVisible()
    expect(renderPendo).toHaveBeenCalled()
    expect(await renderPendo.mock.calls[0][0]()).toEqual({
      account: {
        id: 'tid1',
        name: 'n1',
        isTrial: true,
        productName: 'RuckusAI'
      },
      visitor: {
        delegated: false,
        email: 'e1',
        full_name: 'fn1 ln1',
        id: 'uid1',
        region: 'test region',
        role: 'r1',
        support: true,
        varTenantId: 'tid1',
        version: 'test version'
      }
    })
  })
  it('shows expired session if profile or any api gives 401', async () => {
    mockServer.use(
      rest.get(
        '/analytics/api/rsa-mlisa-rbac/users/profile',
        (_, res, ctx) => res(ctx.status(401))
      )
    )
    const rootEl = document.createElement('div')
    rootEl.id = 'root'
    document.body.appendChild(rootEl)
    const root = createRoot(rootEl)
    await act(() => init(root))
    expect(actionModal).toHaveBeenCalled()
    actionModal.mock.calls[0][0].onOk!()
    expect(window.location.reload).toHaveBeenCalled()
    expect(middleware).toHaveBeenCalled()
    const next = jest.fn()
    const mw = middleware.mock.calls[0][0]({} as MiddlewareAPI<Dispatch<AnyAction>, unknown>)(next)
    mw({ meta: { baseQueryMeta: { response: { status: 200 } } } })
    expect(next).toHaveBeenCalledTimes(1)
    expect(actionModal).toHaveBeenCalledTimes(1)
    mw({ meta: { baseQueryMeta: { response: { status: 401 } } } })
    expect(next).toHaveBeenCalledTimes(1)
    expect(actionModal).toHaveBeenCalledTimes(2)
  })
  it('should handle if getIntl is empty', () => {
    const mockedSetUpIntl = require('@acx-ui/utils').setUpIntl
    mockedSetUpIntl.mockImplementation(undefined)
    showExpiredSessionModal()
    expect(mockedSetUpIntl).toHaveBeenCalledWith({ locale: 'en-US' })
  })
})
