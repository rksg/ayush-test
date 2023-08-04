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
  UserProfileProvider: (props: { children: React.ReactNode }) => <div
    {...props}
    data-testid='user-profile-provider'
  />,
  useLocaleContext: () => ({ messages: { 'en-US': { lang: 'Language' } } })
}))


describe('bootstrap.init', () => {
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
        (_req, res, ctx) => res(ctx.json({ data: {
          preferredLanguage: 'en-US'
        } }))
      )
    )
  })
  it('renders correctly', async () => {
    const rootEl = document.createElement('div')
    rootEl.id = 'root'
    document.body.appendChild(rootEl)
    const root = createRoot(rootEl)
    await act(() => bootstrap.init(root))
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByTestId('all-routes')).toBeVisible()
  })
})
