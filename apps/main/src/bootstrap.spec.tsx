import '@testing-library/jest-dom'
import { rest }       from 'msw'
import { createRoot } from 'react-dom/client'

import { AdministrationUrlsInfo }                             from '@acx-ui/rc/utils'
import { act, screen, mockServer, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { UserUrlsInfo }                                       from '@acx-ui/user'

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
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  UserProfileProvider: (props: { children: React.ReactNode }) => <div
    {...props}
    data-testid='user-profile-provider'
  />,
  useUserProfileContext: () => ({ allowedOperations: ['some-operation'] })
}))
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  renderPendo: jest.fn(),
  UserProfileProvider: (props: { children: React.ReactNode }) => <div
    {...props}
    data-testid='user-profile-provider'
  />,
  useLocaleContext: () => ({ messages: { 'en-US': { lang: 'Language' } } })
}))
const renderPendo = jest.mocked(require('@acx-ui/utils').renderPendo)

describe('bootstrap.init', () => {
  const data = {
    externalId: '123',
    firstName: 'firstName1',
    lastName: 'lastName1',
    role: 'PRIME_ADMIN',
    pver: '1.0.0',
    var: true,
    varTenantId: '123',
    support: true,
    dogfood: true,
    region: 'us',
    username: 'username1',
    tenantId: '123',
    email: 'email1',
    companyName: 'companyName1'
  }
  beforeEach(() => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json({ global: {
          defaultLanguage: 'en-US'
        } }))
      ),
      rest.get(
        UserUrlsInfo.getUserProfile.url,
        (_req, res, ctx) => res(ctx.json({
          ...data,
          preferredLanguage: 'en-US'
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
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByTestId('all-routes')).toBeVisible()
    expect(renderPendo).toHaveBeenCalled()
    expect(await renderPendo.mock.calls[0][0]()).toEqual({
      account: {
        id: '123',
        name: 'companyName1',
        productName: 'RuckusOne'
      },
      visitor: {
        delegated: false,
        dogfood: true,
        email: 'email1',
        full_name: 'firstName1 lastName1',
        id: '123',
        region: 'us',
        role: 'PRIME_ADMIN',
        support: true,
        username: 'username1',
        var: true,
        varTenantId: '123',
        version: '1.0.0'
      }
    })
  })
})
