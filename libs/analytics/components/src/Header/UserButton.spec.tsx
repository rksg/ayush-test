import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { useUserProfileContext } from '@acx-ui/analytics/utils'
import { Provider }              from '@acx-ui/store'
import { render, screen }        from '@acx-ui/test-utils'
import {
  UserProfile,
  UserProfileContext,
  UserProfileContextProps
} from '@acx-ui/user'

import { UserButton } from './UserButton'

const params = { tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1' }
const userProfile = {
  initials: 'FL',
  email: 'dog12@email.com',
  username: 'dog12@email.com'
} as UserProfile

jest.mock('@acx-ui/analytics/utils', () => (
  {
    ...jest.requireActual('@acx-ui/analytics/utils'),
    useUserProfileContext: jest.fn()
  }))
const mockPermissions = {
  'view-analytics': true,
  'view-report-controller-inventory': true,
  'view-data-explorer': true,
  'manage-service-guard': false,
  'manage-call-manager': false,
  'manage-mlisa': true,
  'manage-occupancy': true,
  'manage-label': true,
  'manage-tenant-settings': true,
  'manage-config-recommendation': false
}
describe('UserButton', () => {
  it('should render button with user profile', async () => {
    const mockUserProfile = {
      data: {
        accountId: 'accountId',
        firstName: 'firstName',
        lastName: 'lastName',
        tenants: [
          { id: 'accountId', permissions: mockPermissions },
          { id: 'accountId2', permissions: [] }
        ]
      }
    }
    const mockUseUserProfileContext = useUserProfileContext as jest.Mock
    mockUseUserProfileContext.mockReturnValue(mockUserProfile)
    render(
      <Provider>
        <UserProfileContext.Provider
          value={{ data: mockUserProfile } as unknown as UserProfileContextProps}>
          <UserButton />
        </UserProfileContext.Provider>
      </Provider>,
      { route: { params } }
    )
    expect(screen.getByRole('button')).toHaveTextContent('FL')

    await userEvent.click(screen.getByRole('button'))
    const links = screen.getAllByRole('link')
    const items = [
      { text: 'My Profile', href: '/analytics/profile/settings' },
      { text: 'Accounts', href: '/analytics/profile/tenants' }
    ]
    items.forEach((item, i) => {
      expect(links[i]).toHaveTextContent(item.text)
      expect(links[i]).toHaveAttribute('href', item.href)
      expect(links[i]).toHaveAttribute('rel', 'noreferrer noopener')
      expect(links[i]).toHaveAttribute('target', '_blank')
    })
  })

  it('should handle logout', async () => {
    const mockUseUserProfileContext = useUserProfileContext as jest.Mock

    const mockUserProfile = {
      data: {
        accountId: 'accountId',
        tenants: [
          { id: 'accountId', permissions: { ...mockPermissions, 'view-analytics': false } },
          { id: 'accountId2', permissions: [] }
        ]
      }
    }
    mockUseUserProfileContext.mockReturnValue(mockUserProfile)
    const { location } = window
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: { href: '' }
    })
    render(
      <Provider>
        <UserProfileContext.Provider
          value={{ data: mockUserProfile } as unknown as UserProfileContextProps}>
          <UserButton />
        </UserProfileContext.Provider>
      </Provider>,
      { route: { params } }
    )
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Log out' }))
    expect(window.location.href).toEqual('/logout')

    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: location
    })
  })

  it('should handle logout with JWT', async () => {
    sessionStorage.setItem('jwt', 'testToken1122')
    const token = sessionStorage.getItem('jwt')
    const { location } = window
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: { href: '' }
    })

    const isRwbigdogUserProfile = { ...userProfile, email: 'test@rwbigdog.com' }
    render(
      <Provider>
        <UserProfileContext.Provider
          value={{ data: isRwbigdogUserProfile } as UserProfileContextProps}>
          <UserButton />
        </UserProfileContext.Provider>
      </Provider>,
      { route: { params } }
    )
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Log out' }))
    expect(window.location.href).toEqual(`/logout?token=${token}`)

    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: location
    })
  })
})
