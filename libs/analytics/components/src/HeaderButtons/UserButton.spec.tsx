import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { getUserProfile, permissions } from '@acx-ui/analytics/utils'
import type { Invitation, Tenant }     from '@acx-ui/analytics/utils'
import { Provider }                    from '@acx-ui/store'
import { render, screen }              from '@acx-ui/test-utils'

import { UserButton } from './UserButton'

const params = { tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1' }

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: jest.fn()
}))
const userProfile = jest.mocked(getUserProfile)

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  userLogout: jest.fn()
}))

const mockPermissions = {
  ...Object.keys(permissions)
    .reduce((permissions, name) => ({ ...permissions, [name]: true }), {}),
  READ_AI_DRIVEN_RRM: false,
  READ_AI_OPERATIONS: false
}
const mockUserProfile = {
  accountId: 'accountId',
  firstName: 'firstName',
  lastName: 'lastName',
  email: '',
  userId: '',
  role: '',
  support: false,
  invitations: [] as Invitation[],
  selectedTenant: { id: 'accountId', permissions: mockPermissions } as Tenant,
  tenants: [
    { id: 'accountId', permissions: mockPermissions },
    { id: 'accountId2', permissions: [] }
  ] as Tenant[]
}
describe('UserButton', () => {
  beforeEach(() => {
    userProfile.mockReturnValue(mockUserProfile)
  })
  it('should render button with user profile', async () => {
    render(
      <Provider>
        <UserButton />
      </Provider>,
      { route: { params } }
    )
    expect(screen.getByRole('button')).toHaveTextContent('FL')

    await userEvent.click(screen.getByRole('button'))
    const links = screen.getAllByRole('link')
    const items = [
      { text: 'My Profile', href: `/${params.tenantId}/t/profile/settings` }
    ]
    items.forEach((item, i) => {
      expect(links[i]).toHaveTextContent(item.text)
      expect(links[i]).toHaveAttribute('href', item.href)
    })
  })

  it('should handle logout', async () => {
    const mockUserLogout = require('@acx-ui/utils').userLogout
    const { location } = window
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: { hostname: 'not.localhost' }
    })

    render(
      <Provider>
        <UserButton />
      </Provider>,
      { route: { params } }
    )

    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Log out' }))

    expect(mockUserLogout).toHaveBeenCalled()
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: location
    })
  })

  it('does not throw error if names are empty', async () => {
    userProfile.mockReturnValue({
      ...mockUserProfile,
      firstName: '',
      lastName: ''
    })
    render(
      <Provider>
        <UserButton />
      </Provider>,
      { route: { params } }
    )
    expect(screen.getByRole('button')).toHaveTextContent('')
  })

  it('should not render My Profile if view-analytics is false', async () => {
    const permissions = { ...mockPermissions, READ_INCIDENTS: false }
    userProfile.mockReturnValue({
      ...mockUserProfile,
      accountId: 'accountId1',
      selectedTenant: { id: 'accountId1', permissions } as Tenant,
      tenants: [
        { id: 'accountId1', permissions }
      ] as Tenant[]
    })
    render(
      <Provider>
        <UserButton />
      </Provider>,
      { route: { params } }
    )

    await userEvent.click(screen.getByRole('button'))
    expect(screen.queryByRole('link', { name: 'My Profile' })).toBeNull()
  })
})
