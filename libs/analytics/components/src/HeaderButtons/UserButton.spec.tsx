import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import {
  UserProfileContext,
  UserProfileContextProps
} from '@acx-ui/analytics/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { UserButton } from './UserButton'

const params = { tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1' }

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
const mockUserProfile = {
  accountId: 'accountId',
  firstName: 'firstName',
  lastName: 'lastName',
  tenants: [
    { id: 'accountId', permissions: mockPermissions },
    { id: 'accountId2', permissions: [] }
  ]
}
describe('UserButton', () => {
  it('should render button with user profile', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={{ data: mockUserProfile } as UserProfileContextProps}>
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
    render(
      <Provider>
        <UserProfileContext.Provider
          value={{ data: mockUserProfile } as UserProfileContextProps}>
          <UserButton />
        </UserProfileContext.Provider>
      </Provider>,
      { route: { params } }
    )

    const submit = window.HTMLFormElement.prototype.submit
    const mockSubmit = jest.fn()
    window.HTMLFormElement.prototype.submit = mockSubmit

    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Log out' }))
    expect(mockSubmit).toHaveBeenCalled()

    window.HTMLFormElement.prototype.submit = submit
  })

  it('should not render My Profile if view-analytics is false', async () => {
    const mockUserProfileNotViewAnalytics = {
      ...mockUserProfile,
      tenants: [
        { id: 'accountId', permissions: { ...mockPermissions, 'view-analytics': false } }
      ]
    }
    render(
      <Provider>
        <UserProfileContext.Provider
          value={{ data: mockUserProfileNotViewAnalytics } as UserProfileContextProps}>
          <UserButton />
        </UserProfileContext.Provider>
      </Provider>,
      { route: { params } }
    )

    await userEvent.click(screen.getByRole('button'))
    expect(screen.queryByRole('link', { name: 'My Profile' })).toBeNull()
  })
})
