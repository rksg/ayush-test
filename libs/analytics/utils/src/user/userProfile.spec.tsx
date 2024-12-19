import { Tenant, Settings }                                                                  from './types'
import { getUserProfile, setUserProfile, getPendoConfig, updateSelectedTenant, getUserName } from './userProfile'

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
  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { search: '' }
    })
  })
  it('should set user profile', () => {
    const value = { search: '' }
    Object.defineProperty(window, 'location', {
      writable: true,
      value
    })
    setUserProfile({
      ...defaultMockUserProfile.data,
      firstName: 'FirstName', lastName: 'LastName'
    })
    expect(getUserProfile()).toEqual({
      ...defaultMockUserProfile.data,
      firstName: 'FirstName', lastName: 'LastName',
      selectedTenant: { ...defaultMockUserProfile.data.tenants[0] }
    })
    expect(value.search).toEqual('?selectedTenants=WyIxIl0=')
    expect(getUserName()).toBe('FirstName LastName')
  })
  it('should set selected tenant from url', () => {
    setUserProfile(defaultMockUserProfile.data)
    const search = '?selectedTenants=' + window.btoa(
      JSON.stringify([defaultMockUserProfile.data.tenants[1].id])
    )
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { search }
    })
    updateSelectedTenant()
    expect(getUserProfile()).toEqual({
      ...defaultMockUserProfile.data,
      selectedTenant: { ...defaultMockUserProfile.data.tenants[1] }
    })
    expect(mockedUpdatePendo).toHaveBeenCalledTimes(1)
  })
  it('should set selected tenant to own account', () => {
    setUserProfile(defaultMockUserProfile.data)
    updateSelectedTenant()
    expect(getUserProfile()).toEqual({
      ...defaultMockUserProfile.data,
      selectedTenant: { ...defaultMockUserProfile.data.tenants[0] }
    })
  })
  it('should return pendo config', () => {
    setUserProfile(defaultMockUserProfile.data)
    expect(getPendoConfig()).toEqual({
      account: {
        id: '1',
        isTrial: false,
        name: '1',
        sfdcId: '1',
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
