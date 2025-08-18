/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { TenantType }             from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'
import { UserProfileContext, UserProfileContextProps, setUserProfile } from '@acx-ui/user'

import { fakeUserProfile, fakeMspEcProfile, fakeTenantDetails } from './__tests__/fixtures'

import Administrators from './index'

const isPrimeAdmin : () => boolean = jest.fn().mockReturnValue(true)
const userProfileContextValues = {
  data: fakeUserProfile,
  isPrimeAdmin
} as UserProfileContextProps

jest.mock('./DelegationsTable', () => ({
  __esModule: true,
  default: () => {
    return <div data-testid='mocked-DelegationsTable'></div>
  }
}))
jest.mock('./AdministratorsTable', () => ({
  __esModule: true,
  default: () => {
    return <div data-testid='mocked-AdministratorsTable'></div>
  }
}))
jest.mock('./AdminGroups', () => ({
  __esModule: true,
  default: () => {
    return <div data-testid='mocked-AdminGroups'></div>
  }
}))

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/rc/services', () => ({
  useGetTenantDetailsQuery: jest.fn().mockReturnValue({
    data: {
      id: 'ee87b5336d5d483faeda5b6aa2cbed6f',
      createdDate: '2023-01-31T04:19:00.241+00:00',
      updatedDate: '2023-02-15T02:34:21.877+00:00',
      entitlementId: '140360222',
      maintenanceState: false,
      name: 'Dog Company 1551',
      externalId: '0012h00000NrlYAAAZ',
      upgradeGroup: 'production',
      tenantMFA: {
        mfaStatus: 'DISABLED',
        recoveryCodes: '["825910","333815","825720","919107","836842"]' },
      preferences: '{"global":{"mapRegion":"UA"}}',
      ruckusUser: false,
      isActivated: true,
      status: 'active',
      tenantType: 'REC'
    }
  }),
  useGetAdminListQuery: jest.fn().mockReturnValue({
    data: []
  }),
  useGetAdminListPaginatedQuery: jest.fn().mockReturnValue({
    data: { totalCount: 0, content: [] },
    isLoading: false,
    isFetching: false
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
    data: [
      {
        id: '9db335ef808',
        clientID: '8358489e',
        clientSecret: '6bb84ba',
        scopes: 'PRIME_ADMIN',
        authenticationType: 'GOOGLE_WORKSPACE',
        name: 'Prime',
        clientIDStatus: 'ACTIVE',
        samlSignatureEnabled: false
      }
    ]
  })
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const services = require('@acx-ui/msp/services')
const rcServices = require('@acx-ui/rc/services')

describe('Administrators', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    setUserProfile({ profile: fakeUserProfile, allowedOperations: [] })

    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f'
    }

    services.useGetMspEcProfileQuery = jest.fn().mockImplementation(() => {
      return { data: fakeMspEcProfile }
    })

  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Administrators />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await screen.findByTestId('mocked-AdministratorsTable')
    await screen.findByTestId('mocked-DelegationsTable')
  })

  it('should correctly render when delegation not ready', async () => {
    const tenantDetails = { ...fakeTenantDetails, tenantType: TenantType.VAR }
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: tenantDetails }
    })

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Administrators />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await screen.findByTestId('mocked-AdministratorsTable')
    expect(screen.queryByTestId('mocked-DelegationsTable')).toBeNull()
  })

  it('should correctly render in delegated mode', async () => {
    services.useGetMspEcProfileQuery = jest.fn().mockImplementation(() => {
      return {
        data: {
          ...fakeMspEcProfile,
          msp_label: 'msp_ec'
        }
      }
    })

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Administrators />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await screen.findByTestId('mocked-AdministratorsTable')
    await screen.findByTestId('mocked-DelegationsTable')
  })

  it('should correctly render when isGroupBasedLoginEnabled is on', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      (ff === Features.GROUP_BASED_LOGIN_TOGGLE))
    services.useGetMspEcProfileQuery = jest.fn().mockImplementation(() => {
      return {
        data: {
          ...fakeMspEcProfile,
          msp_label: 'msp_ec'
        }
      }
    })

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Administrators />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    expect(await screen.findByText('Local Admins (0)')).toBeInTheDocument()
    expect(await screen.findByText('Admin Groups (0)')).toBeInTheDocument()
    await userEvent.click(await screen.findByText('Admin Groups (0)'))

    expect(mockedUsedNavigate).toHaveBeenCalled()
  })
})
