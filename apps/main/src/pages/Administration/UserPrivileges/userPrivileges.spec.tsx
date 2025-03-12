
import { Provider }                                                    from '@acx-ui/store'
import { render, screen }                                              from '@acx-ui/test-utils'
import { UserProfileContext, setUserProfile, UserProfileContextProps } from '@acx-ui/user'

import { fakeUserProfile } from './__tests__/fixtures'

import UserPrivileges from './index'


const isPrimeAdmin : () => boolean = jest.fn().mockReturnValue(true)

const userProfileContextValues = {
  data: fakeUserProfile,
  isPrimeAdmin
} as UserProfileContextProps

jest.mock('@acx-ui/msp/services', () => ({
  useGetMspEcProfileQuery: jest.fn().mockReturnValue({
    data: []
  })
}))

jest.mock('@acx-ui/rc/services', () => ({
  useGetTenantDetailsQuery: jest.fn().mockReturnValue({
    data: []
  }),
  useGetAdminListQuery: jest.fn().mockReturnValue({
    data: []
  }),
  useGetAdminGroupsQuery: jest.fn().mockReturnValue({
    data: []
  }),
  useGetDelegationsQuery: jest.fn().mockReturnValue({
    data: []
  }),
  useGetPrivilegeGroupsQuery: jest.fn().mockReturnValue({
    data: []
  }),
  useGetCustomRolesQuery: jest.fn().mockReturnValue({
    data: []
  }),
  useGetTenantAuthenticationsQuery: jest.fn().mockReturnValue({
    data: []
  })
}))

// 模擬子組件
jest.mock('./UsersTable', () => {
  return jest.fn(() => <div data-testid='mocked-UsersTable' />)
})

describe('UserPrivileges', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    setUserProfile({ profile: fakeUserProfile, allowedOperations: [] })
    params = { tenantId: '8c36a0a9ab9d4806b060e112205add6f' }
  })

  it('should render UsersTable', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider value={userProfileContextValues}>
          <UserPrivileges />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await screen.findByTestId('mocked-UsersTable')
    expect(screen.getByTestId('mocked-UsersTable')).toBeInTheDocument()
  })
})
