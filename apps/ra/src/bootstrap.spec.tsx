import '@testing-library/jest-dom'
import { Dispatch, MiddlewareAPI } from '@reduxjs/toolkit'
import { rest }                    from 'msw'
import { createRoot }              from 'react-dom/client'

import { showActionModal }         from '@acx-ui/components'
import { dynamicMiddleware }       from '@acx-ui/store'
import { act, screen, mockServer } from '@acx-ui/test-utils'

import { init } from './bootstrap'

jest.mock('./AllRoutes', () => () => <div data-testid='all-routes' />)
jest.mock('@acx-ui/theme', () => {}, { virtual: true })
jest.mock('@acx-ui/store', () => ({
  ...jest.requireActual('@acx-ui/store'),
  dynamicMiddleware: { addMiddleware: jest.fn() }
}))
const middleware = jest.mocked(dynamicMiddleware.addMiddleware)
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
  userLogout: jest.fn()
}))
const userLogout = jest.mocked(require('@acx-ui/utils').userLogout)
const renderPendo = jest.mocked(require('@acx-ui/utils').renderPendo)
jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
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
  getUserProfile: jest.fn().mockImplementation(() => ({}))
}))
const getUserProfile = jest.mocked(require('@acx-ui/analytics/utils').getUserProfile)
jest.mock('@acx-ui/config', () => ({
  get: jest.fn().mockImplementation((name: string) => ({
    MLISA_REGION: 'test region',
    MLISA_VERSION: 'test version'
  })[name] as string)
}))

describe('bootstrap.init', () => {
  afterEach(() => {
    mockServer.resetHandlers()
    // eslint-disable-next-line testing-library/no-node-access
    document.body.removeChild(document.querySelector('#root')!)
  })
  describe('if logged in', () => {
    beforeEach(() => {
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
    })
    it('calls pendo and renders', async () => {
      getUserProfile.mockImplementation(() => ({
        userId: 'some-user-id',
        preferences: {
          preferredLanguage: 'ja-JP'
        }
      }))
      const rootEl = document.createElement('div')
      rootEl.id = 'root'
      document.body.appendChild(rootEl)
      const root = createRoot(rootEl)
      await act(() => init(root))
      expect(screen.getByTestId('all-routes')).toBeVisible()
      expect(screen.getByTestId('config-provider').getAttribute('lang')).toEqual('ja-JP')
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
    it('defaults to en-US if preferredLanguage is not set', async () => {
      getUserProfile.mockImplementation(() => ({
        userId: 'some-user-id',
        preferences: {}
      }))
      const rootEl = document.createElement('div')
      rootEl.id = 'root'
      document.body.appendChild(rootEl)
      const root = createRoot(rootEl)
      await act(() => init(root))
      expect(screen.getByTestId('config-provider').getAttribute('lang')).toEqual('en-US')
    })
  })
  describe('if not logged in', () => {
    const { location } = window
    beforeEach(() => {
      mockServer.use(
        rest.get(
          '/analytics/api/rsa-mlisa-rbac/users/profile',
          (_, res, ctx) => res(ctx.status(401))
        )
      )
    })
    afterAll(() => {
      Object.defineProperty(window, 'location', { writable: true, value: { location } })
    })
    it('shows expired session modal if dev mode', async () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...location, hostname: 'localhost' }
      })
      const rootEl = document.createElement('div')
      rootEl.id = 'root'
      document.body.appendChild(rootEl)
      const root = createRoot(rootEl)
      await act(() => init(root))
      expect(actionModal).toHaveBeenCalled()
      actionModal.mock.calls[0][0].onOk!()
      expect(middleware).toHaveBeenCalled()
      const next = jest.fn()
      const mw = middleware.mock
        .calls[0][0]({} as MiddlewareAPI<Dispatch, unknown>)(next)
      mw({ meta: { baseQueryMeta: { response: { status: 200 } } } })
      expect(next).toHaveBeenCalledTimes(1)
      expect(actionModal).toHaveBeenCalledTimes(1)
      mw({ meta: { baseQueryMeta: { response: { status: 401 } } } })
      expect(next).toHaveBeenCalledTimes(1)
      expect(actionModal).toHaveBeenCalledTimes(2)
    })
    it('logs out if not dev mode', async () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...location, hostname: 'not.localhost' }
      })
      const rootEl = document.createElement('div')
      rootEl.id = 'root'
      document.body.appendChild(rootEl)
      const root = createRoot(rootEl)
      await act(() => init(root))
      expect(userLogout).toHaveBeenCalled()
    })
  })
})
