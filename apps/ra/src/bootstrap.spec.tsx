import '@testing-library/jest-dom'
import { rest }       from 'msw'
import { createRoot } from 'react-dom/client'

import { act, screen, mockServer } from '@acx-ui/test-utils'

import * as bootstrap from './bootstrap'

jest.mock('./AllRoutes', () => () => <div data-testid='all-routes' />)
jest.mock('@acx-ui/theme', () => {}, { virtual: true })
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  ConfigProvider: (props: { children: React.ReactNode }) => <div
    {...props}
    data-testid='config-provider'
  />
}))
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
  })
}))
const renderPendo = jest.mocked(require('@acx-ui/utils').renderPendo)
jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  UserProfileProvider: (props: { children: React.ReactNode }) => <div
    {...props}
    data-testid='profile-provider'
  />
}))
jest.mock('@acx-ui/config', () => ({
  get: jest.fn().mockImplementation((name: string) => ({
    MLISA_REGION: 'test region',
    MLISA_VERSION: 'test version'
  })[name] as string)
}))

describe('bootstrap.init', () => {
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
  afterEach(() => {
    mockServer.resetHandlers()
  })
  it('calls pendo and renders', async () => {
    const rootEl = document.createElement('div')
    rootEl.id = 'root'
    document.body.appendChild(rootEl)
    const root = createRoot(rootEl)
    await act(() => bootstrap.init(root))
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

  describe('loadMessages', () => {
    it('should handle unknown msg locales', () => {
      const unknownLocal = bootstrap.loadMessages([])
      expect(unknownLocal).toMatch('en-US')
    })
  })
})
