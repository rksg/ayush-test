import { EdgeScopes, ScopeKeys, SwitchScopes, WifiScopes } from '@acx-ui/types'
import { getUserProfile, setUserProfile }                  from '@acx-ui/user'

import { ServiceType }     from '../../constants'
import { PolicyType }      from '../../types'
import { PolicyOperation } from '../policy'

import { filterByAccessForServicePolicyMutation, getScopeKeyByPolicy, getScopeKeyByService } from './servicePolicyAbacUtils'
import { ServiceOperation }                                                                  from './serviceRouteUtils'

const mockedFilterByAccess = jest.fn()
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterByAccess: (items: any[]) => mockedFilterByAccess(items)
}))

describe('servicePolicyAbacUtils', () => {
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
    expect(getScopeKeyByService(ServiceType.NETWORK_SEGMENTATION, ServiceOperation.EDIT).sort())
      .toEqual<ScopeKeys>([WifiScopes.UPDATE, SwitchScopes.UPDATE, EdgeScopes.UPDATE].sort())
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

  describe('filterByAccessForServicePolicyMutation', () => {
    afterEach(() => {
      mockedFilterByAccess.mockClear()
    })

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
})

