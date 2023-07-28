import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'
import { RolesEnum }      from '@acx-ui/types'
import {
  UserProfile as UserProfileInterface,
  UserProfileContext,
  UserProfileContextProps,
  setUserProfile
}         from '@acx-ui/user'

import { UserProfile } from './index'

const params = { tenantId: 'tenant-id' }
const mockedUsedNavigate = jest.fn()
const userProfile = {
  initials: 'FL',
  fullName: 'First Last',
  role: RolesEnum.ADMINISTRATOR,
  email: 'dog12@email.com',
  dateFormat: 'yyyy/mm/dd',
  detailLevel: 'su'
} as UserProfileInterface

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/msp/components', () => ({
  ...jest.requireActual('@acx-ui/msp/components'),
  MultiFactor: () => <div data-testid='MultiFactor' />
}))

describe('UserProfile', () => {
  it('should render correctly', async () => {
    setUserProfile({ profile: userProfile, allowedOperations: [] })

    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      >
        <UserProfile />
      </UserProfileContext.Provider>
    </Provider>, { route: { params } })

    expect(screen.getByText('FL')).toBeVisible()
    expect(screen.getByText('First Last')).toBeVisible()
    expect(screen.getByText('Administrator')).toBeVisible()
    expect(screen.getByText('dog12@email.com')).toBeVisible()
    expect(screen.getByText('tenant-id')).toBeVisible()

    expect(screen.getByRole('tab', { name: 'Settings' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Security' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Recent Logins' })).toBeVisible()

    expect(screen.getByText('YYYY/MM/DD')).toBeVisible()
    expect(screen.getByText('Super User')).toBeVisible()

    userEvent.click(screen.getByRole('tab', { name: 'Security' }))
    expect(await screen.findByTestId('MultiFactor')).toBeVisible()
  })

})
