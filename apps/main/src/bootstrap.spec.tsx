import '@testing-library/jest-dom'

import { createRoot } from 'react-dom/client'

import { act, screen } from '@acx-ui/test-utils'

import * as bootstrap from './bootstrap'

jest.mock('./AllRoutes', () => () => <div data-testid='all-routes' />)
jest.mock('@acx-ui/theme', () => {}, { virtual: true })
jest.mock('@acx-ui/components', () => ({
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
  />
}))


describe('bootstrap.init', () => {
  it('renders correctly', async () => {
    const rootEl = document.createElement('div')
    rootEl.id = 'root'
    document.body.appendChild(rootEl)
    const root = createRoot(rootEl)

    await act(() => bootstrap.init(root))
    expect(screen.getByTestId('all-routes')).toBeVisible()
  })
})
