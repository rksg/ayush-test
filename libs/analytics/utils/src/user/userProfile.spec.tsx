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
    setUserProfile(defaultMockUserProfile.data)
    expect(getUserProfile()).toEqual({
      ...defaultMockUserProfile.data,
      selectedTenant: { ...defaultMockUserProfile.data.tenants[0] }
    })
    expect(mockedUpdatePendo).toHaveBeenCalledTimes(1)
    setUserProfile(defaultMockUserProfile.data)
    expect(mockedUpdatePendo).toHaveBeenCalledTimes(1)
  })
  it('should set user profile acc to tenant from url', () => {
    const t = window.btoa(
      JSON.stringify([defaultMockUserProfile.data.tenants[1].id])
    )
    window.location.search = `selectedTenants=${t}`
    setUserProfile(defaultMockUserProfile.data)
    expect(getUserProfile()).toEqual({
      ...defaultMockUserProfile.data,
      selectedTenant: { ...defaultMockUserProfile.data.tenants[1] }
    })
  })
  it('should return pendo config', () => {
    setUserProfile(defaultMockUserProfile.data)
    expect(getPendoConfig()).toEqual({
      account: {
        id: '2',
        isTrial: false,
        name: '2',
        productName: 'RuckusAI'
      },
      visitor: {
        delegated: true,
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
