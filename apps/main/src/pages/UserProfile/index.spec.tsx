import '@testing-library/jest-dom'
import { UserProfileContext, UserProfileContextProps } from '@acx-ui/rc/components'
import {
  UserProfile as UserProfileInterface,
  RolesEnum
} from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

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

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('UserProfile', () => {
  it('should render correctly', async () => {
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
  })
})
