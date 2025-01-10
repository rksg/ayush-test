import { render, screen }                                  from '@acx-ui/test-utils'
import { EdgeScopes, ScopeKeys, SwitchScopes, WifiScopes } from '@acx-ui/types'
import { getUserProfile, setUserProfile }                  from '@acx-ui/user'

import { ServiceType, ServiceOperation } from '../../constants'
import { PolicyType, PolicyOperation }   from '../../types'

import { hasSomeServicesPermission }                                                                                                 from './allowedOperationUtils'
import { AddProfileButton, filterByAccessForServicePolicyMutation, getScopeKeyByPolicy, getScopeKeyByService, hasServicePermission } from './servicePolicyAbacUtils'

const mockedFilterByAccess = jest.fn().mockImplementation(items => items)
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterByAccess: (items: any[]) => mockedFilterByAccess(items)
}))

const mockedGetServiceAllowedOperation = jest.fn()
jest.mock('./allowedOperationUtils', () => ({
  ...jest.requireActual('./allowedOperationUtils'),
  getServiceAllowedOperation: () => mockedGetServiceAllowedOperation()
}))

describe('servicePolicyAbacUtils', () => {
  afterEach(() => {
    mockedGetServiceAllowedOperation.mockReset()
    mockedFilterByAccess.mockClear()
  })

  describe('serviceTypeScopeMap', () => { // Test for a combination of all service types and operations to ensure they are all covered
    Object.values(ServiceType).forEach(serviceType => {
      Object.values(ServiceOperation).filter(oper => !isNaN(Number(oper))).forEach(oper => {
        it(`should return valid ScopeKeys for ${serviceType} and ${oper}`, () => {
          const result = getScopeKeyByService(serviceType, oper as ServiceOperation)
          new Set(result.flat()).forEach(scopeKey => {
            expect([
              ...Object.values(WifiScopes),
              ...Object.values(SwitchScopes),
              ...Object.values(EdgeScopes)
            ]).toContain(scopeKey)
          })
        })
      })
    })
  })
  it('getScopeKeyByService', () => {
    // eslint-disable-next-line max-len
    expect(getScopeKeyByService(ServiceType.PORTAL, ServiceOperation.EDIT)).toEqual<ScopeKeys>([WifiScopes.UPDATE])
    // eslint-disable-next-line max-len
    expect(getScopeKeyByService(ServiceType.PORTAL, ServiceOperation.CREATE)).toEqual<ScopeKeys>([WifiScopes.CREATE])
    // eslint-disable-next-line max-len
    expect(getScopeKeyByService(ServiceType.PORTAL, ServiceOperation.DELETE)).toEqual<ScopeKeys>([WifiScopes.DELETE])

    // eslint-disable-next-line max-len
    expect(getScopeKeyByService(ServiceType.EDGE_DHCP, ServiceOperation.EDIT)).toEqual<ScopeKeys>([EdgeScopes.UPDATE])
    // eslint-disable-next-line max-len
    expect(getScopeKeyByService(ServiceType.EDGE_DHCP, ServiceOperation.CREATE)).toEqual<ScopeKeys>([EdgeScopes.CREATE])
    // eslint-disable-next-line max-len
    expect(getScopeKeyByService(ServiceType.EDGE_DHCP, ServiceOperation.DELETE)).toEqual<ScopeKeys>([EdgeScopes.DELETE])

    // eslint-disable-next-line max-len
    expect(getScopeKeyByService(ServiceType.EDGE_SD_LAN, ServiceOperation.CREATE)).toEqual<ScopeKeys>([EdgeScopes.CREATE])
    // eslint-disable-next-line max-len
    expect(getScopeKeyByService(ServiceType.EDGE_SD_LAN, ServiceOperation.EDIT)).toEqual<ScopeKeys>([EdgeScopes.UPDATE])
    // eslint-disable-next-line max-len
    expect(getScopeKeyByService(ServiceType.EDGE_SD_LAN, ServiceOperation.DELETE)).toEqual<ScopeKeys>([EdgeScopes.DELETE])
    expect(getScopeKeyByService(ServiceType.EDGE_SD_LAN, ServiceOperation.LIST).sort())
      .toEqual<ScopeKeys>([EdgeScopes.READ, WifiScopes.READ].sort())

    // eslint-disable-next-line max-len
    expect(getScopeKeyByService(ServiceType.WEBAUTH_SWITCH, ServiceOperation.EDIT)).toEqual<ScopeKeys>([SwitchScopes.UPDATE])
    // eslint-disable-next-line max-len
    expect(getScopeKeyByService(ServiceType.WEBAUTH_SWITCH, ServiceOperation.CREATE)).toEqual<ScopeKeys>([SwitchScopes.CREATE])
    // eslint-disable-next-line max-len
    expect(getScopeKeyByService(ServiceType.WEBAUTH_SWITCH, ServiceOperation.DELETE)).toEqual<ScopeKeys>([SwitchScopes.DELETE])

    // eslint-disable-next-line max-len
    expect(getScopeKeyByService(ServiceType.PIN, ServiceOperation.EDIT).sort())
      .toEqual<ScopeKeys>([SwitchScopes.UPDATE, EdgeScopes.UPDATE].sort())
  })

  describe('policyTypeScopeMap', () => { // Test for a combination of all policy types and operations to ensure they are all covered
    Object.values(PolicyType).forEach(policyType => {
      Object.values(PolicyOperation).filter(oper => !isNaN(Number(oper))).forEach(oper => {
        it(`should return valid ScopeKeys for ${policyType} and ${oper}`, () => {
          const result = getScopeKeyByPolicy(policyType, oper as PolicyOperation)
          new Set(result.flat()).forEach(scopeKey => {
            expect([
              ...Object.values(WifiScopes),
              ...Object.values(SwitchScopes),
              ...Object.values(EdgeScopes)
            ]).toContain(scopeKey)
          })
        })
      })
    })
  })

  it('getScopeKeyByPolicy', () => {
    // eslint-disable-next-line max-len
    expect(getScopeKeyByPolicy(PolicyType.AAA, PolicyOperation.EDIT)).toEqual<ScopeKeys>([WifiScopes.UPDATE])
    // eslint-disable-next-line max-len
    expect(getScopeKeyByPolicy(PolicyType.AAA, PolicyOperation.CREATE)).toEqual<ScopeKeys>([WifiScopes.CREATE])
    // eslint-disable-next-line max-len
    expect(getScopeKeyByPolicy(PolicyType.AAA, PolicyOperation.DELETE)).toEqual<ScopeKeys>([WifiScopes.DELETE])
  })

  it('check service permission when rbacOpsApiEnabled is true', () => {
    setUserProfile({
      ...getUserProfile(),
      allowedOperations: ['POST:/wifiCallingServiceProfiles'],
      rbacOpsApiEnabled: true
    })

    mockedGetServiceAllowedOperation.mockReturnValue(['POST:/wifiCallingServiceProfiles'])
    // eslint-disable-next-line max-len
    expect(hasServicePermission({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.CREATE })).toBe(true)

    // eslint-disable-next-line max-len
    mockedGetServiceAllowedOperation.mockReturnValue(['PUT:/wifiCallingServiceProfiles/{serviceId}'])
    // eslint-disable-next-line max-len
    expect(hasServicePermission({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.EDIT })).toBe(false)
  })

  describe('filterByAccessForServicePolicyMutation', () => {
    it('should return an empty array if hasCrossVenuesPermission returns false', () => {
      const userProfile = getUserProfile()
      setUserProfile({
        ...userProfile,
        abacEnabled: true,
        hasAllVenues: false,
        profile: {
          ...userProfile.profile,
          roles: ['My-Custom-Role']
        }
      })
      const items = [{ id: 1 }, { id: 2 }]
      const result = filterByAccessForServicePolicyMutation(items)

      expect(result).toEqual([])
      expect(mockedFilterByAccess).not.toHaveBeenCalled()
    })

    it('should call filterByAccess if hasCrossVenuesPermission returns true', () => {
      const profile = getUserProfile()
      setUserProfile({
        ...profile,
        abacEnabled: true,
        hasAllVenues: true
      })

      const items = [{ id: 1 }, { id: 2 }]
      filterByAccessForServicePolicyMutation(items)
      expect(mockedFilterByAccess).toHaveBeenCalledWith(items)
    })
  })

  describe('AddProfileButton', () => {
    it('renders the link when permission is allowed and operation check is enabled', () => {
      setUserProfile({
        ...getUserProfile(),
        allowedOperations: ['POST:/wifiCallingServiceProfiles'],
        rbacOpsApiEnabled: true
      })

      render(
        <AddProfileButton
          hasSomeProfilesPermission={() => hasSomeServicesPermission(ServiceOperation.CREATE)}
          linkText={'Add Service'}
          targetPath={'/add-service'}
        />,{
          route: { params: { tenantId: '_TENANT_ID' }, path: '/:tenantId' }
        }
      )

      expect(screen.getByText('Add Service')).toBeInTheDocument()
      expect(screen.getByRole('link')).toHaveAttribute('href', '/_TENANT_ID/t/add-service')
    })

    it('returns null when no permission and operation check is enabled', () => {
      setUserProfile({
        ...getUserProfile(),
        allowedOperations: [],
        rbacOpsApiEnabled: true
      })

      render(
        <AddProfileButton
          hasSomeProfilesPermission={() => hasSomeServicesPermission(ServiceOperation.CREATE)}
          linkText={'Add Service'}
          targetPath={'/add-service'}
        />,{
          route: { params: { tenantId: '_TENANT_ID' }, path: '/:tenantId' }
        }
      )

      expect(screen.queryByText('Add Service')).toBeNull()
    })

    it('renders the link when operation check is disabled', () => {
      setUserProfile({
        ...getUserProfile(),
        allowedOperations: [],
        rbacOpsApiEnabled: false
      })

      render(
        <AddProfileButton
          hasSomeProfilesPermission={() => hasSomeServicesPermission(ServiceOperation.CREATE)}
          linkText={'Add Service'}
          targetPath={'/add-service'}
        />,{
          route: { params: { tenantId: '_TENANT_ID' }, path: '/:tenantId' }
        }
      )

      expect(screen.getByText('Add Service')).toBeInTheDocument()
      expect(screen.getByRole('link')).toHaveAttribute('href', '/_TENANT_ID/t/add-service')
    })
  })
})

