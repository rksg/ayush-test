import { Tenant, Settings }                               from './types'
import { getUserProfile, setUserProfile, getPendoConfig } from './userProfile'

jest.mock('@acx-ui/config', () => ({
  get: () => ''
}))
const mockedUpdatePendo = jest.fn()
jest.mock('@acx-ui/utils', () => (
  {
    ...jest.requireActual('@acx-ui/utils'),
    updatePendo: () => mockedUpdatePendo()
  }))

const defaultMockUserProfile = {
  data: {
    accountId: '1',
    firstName: '',
    lastName: '',
    email: '',
    userId: '',
    invitations: [] as Tenant[],
    tenants: [
      {
        id: '1',
        name: '1',
        permissions: {} as Permissions,
        settings: {} as Settings,
        role: '',
        isTrial: false,
        resourceGroupId: '',
        isRADEOnly: false,
        support: false
      },
      {
        id: '2',
        name: '2',
        permissions: {} as Permissions,
        settings: {} as Settings,
        role: '',
        isTrial: false,
        resourceGroupId: '',
        isRADEOnly: false,
        support: false
      }
    ] as unknown as Tenant[],
    selectedTenant: {} as Tenant
  }
}
describe('User Profile', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  it('should set user profile once', () => {
    setUserProfile(defaultMockUserProfile.data, null)
    expect(getUserProfile()).toEqual({
      ...defaultMockUserProfile.data,
      selectedTenant: { ...defaultMockUserProfile.data.tenants[0] }
    })
    expect(mockedUpdatePendo).toHaveBeenCalledTimes(1)
    setUserProfile(defaultMockUserProfile.data, null)
    expect(mockedUpdatePendo).toHaveBeenCalledTimes(1)
  })
  it('should set user profile acc to tenant from url', () => {
    setUserProfile(
      defaultMockUserProfile.data,
      btoa(JSON.stringify([defaultMockUserProfile.data.tenants[1].id]))
    )
    expect(getUserProfile()).toEqual({
      ...defaultMockUserProfile.data,
      selectedTenant: { ...defaultMockUserProfile.data.tenants[1] }
    })
  })
  it('should return pendo config', () => {
    setUserProfile(defaultMockUserProfile.data, null)
    expect(getPendoConfig()).toEqual({
      account: {
        id: '1',
        isTrial: false,
        name: '1',
        productName: 'RuckusAI'
      },
      visitor: {
        delegated: false,
        email: '',
        full_name: ' ',
        id: '',
        region: '',
        role: '',
        support: false,
        varTenantId: '1',
        version: ''
      }
    })
  })
})
