import { getTenantId } from '@acx-ui/utils'

import { AgeTimeUnit, MtuRequestTimeoutUnit, MtuTypeEnum, NetworkSegmentTypeEnum, TunnelTypeEnum } from '../../models'
import { TunnelProfile, TunnelProfileViewData }                                                    from '../../types/policies/tunnelProfile'

import { ageTimeUnitConversion, getTunnelProfileFormDefaultValues, getTunnelProfileOptsWithDefault, getTunnelTypeString, getVlanVxlanDefaultTunnelProfileOpt, getVxlanDefaultTunnelProfileOpt, isDefaultTunnelProfile, isVlanVxlanDefaultTunnelProfile, isVxlanDefaultTunnelProfile, mtuRequestTimeoutUnitConversion } from './tunnelProfileUtils'

const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
const defaultVxLANProfileName = 'Default tunnel profile (PIN)'
const defaultVLANVxLANProfileName = 'Default tunnel profile (SD-LAN)'

const mockedVxlanDefaultTunnelProfileViewData = {
  id: tenantId,
  name: defaultVxLANProfileName,
  tags: ['tag2'],
  mtuType: 'AUTO',
  mtuSize: 0,
  forceFragmentation: false,
  personalIdentityNetworkIds: ['nsg1', 'nsg2'],
  networkIds: ['network1', 'network2'],
  type: 'VXLAN'
} as TunnelProfileViewData

const mockedVlanVxlanDefaultTunnelProfileViewData = {
  ...mockedVxlanDefaultTunnelProfileViewData,
  id: `SL${tenantId}`,
  type: NetworkSegmentTypeEnum.VLAN_VXLAN,
  name: defaultVLANVxLANProfileName
}

const mockedNonDefaultProfile = {
  ...mockedVxlanDefaultTunnelProfileViewData,
  id: 'mocked_tunnel_1',
  name: 'mocked tunnel profile 1'
}

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getTenantId: jest.fn().mockReturnValue(tenantId)
}))

describe('tunnelProfileUtils', () => {
  describe('isDefaultTunnelProfile', () => {
    it('should recognize default VxLAN tunnel', () => {
      expect(isDefaultTunnelProfile(mockedVxlanDefaultTunnelProfileViewData)).toBe(true)
    })
    it('should recognize default VLAN_VxLAN tunnel', () => {
      expect(isDefaultTunnelProfile(mockedVlanVxlanDefaultTunnelProfileViewData)).toBe(true)
    })
    it('should correctly return false', () => {
      expect(isDefaultTunnelProfile(mockedNonDefaultProfile)).toBe(false)
      expect(isDefaultTunnelProfile(undefined)).toBe(false)
    })
  })

  describe('isVxlanDefaultTunnelProfile', () => {
    it('should recognize default VxLAN tunnel', () => {
      expect(isVxlanDefaultTunnelProfile(tenantId)).toBe(true)
    })
    it('should return false when it is an VLAN_VxLAN default', () => {
      expect(isVxlanDefaultTunnelProfile(`SL${tenantId}`)).toBe(false)
    })
    it('should return false when non-default', () => {
      expect(isVxlanDefaultTunnelProfile('mocked_tenant')).toBe(false)
    })
    it('should return false when profile id is missing', () => {
      const noID = {} as TunnelProfileViewData
      expect(isVxlanDefaultTunnelProfile(noID.id)).toBe(false)
    })
    it('should return false when tenantId is undefined', () => {
      jest.mocked(getTenantId).mockReturnValueOnce(undefined)
      expect(isVxlanDefaultTunnelProfile(tenantId)).toBe(false)
    })
  })

  describe('isVlanVxlanDefaultTunnelProfile', () => {
    it('should recognize default VLAN_VxLAN tunnel', () => {
      expect(isVlanVxlanDefaultTunnelProfile(`SL${tenantId}`)).toBe(true)
    })
    it('should return false when it is VxLAN default', () => {
      expect(isVlanVxlanDefaultTunnelProfile(tenantId)).toBe(false)
    })
    it('should return false when non-default', () => {
      expect(isVlanVxlanDefaultTunnelProfile('mocked_tenant')).toBe(false)
    })
    it('should return false when profile id is missing', () => {
      const noID = {} as TunnelProfileViewData
      expect(isVlanVxlanDefaultTunnelProfile(noID.id)).toBe(false)
    })
    it('should return false when tenantId is undefined', () => {
      jest.mocked(getTenantId).mockReturnValueOnce(undefined)
      expect(isVlanVxlanDefaultTunnelProfile(`SL${tenantId}`)).toBe(false)
    })
  })

  describe('getVxlanDefaultTunnelProfileOpt', () => {
    it('should return correct data', () => {
      expect(getVxlanDefaultTunnelProfileOpt()).toStrictEqual({
        value: tenantId,
        label: defaultVxLANProfileName
      })
    })
    it('should return undefined value when tenantId is undefined', () => {
      jest.mocked(getTenantId).mockReturnValueOnce(undefined)
      expect(getVxlanDefaultTunnelProfileOpt()).toStrictEqual({
        value: '',
        label: defaultVxLANProfileName
      })
    })
  })

  describe('getVlanVxlanDefaultTunnelProfileOpt', () => {
    it('should return correct data', () => {
      expect(getVlanVxlanDefaultTunnelProfileOpt()).toStrictEqual({
        value: `SL${tenantId}`,
        label: defaultVLANVxLANProfileName
      })
    })
    it('should return undefined value when tenantId is undefined', () => {
      jest.mocked(getTenantId).mockReturnValueOnce(undefined)
      expect(getVlanVxlanDefaultTunnelProfileOpt()).toStrictEqual({
        value: '',
        label: defaultVLANVxLANProfileName
      })
    })
  })

  describe('getTunnelProfileOptsWithDefault', () => {
    const mockedNoDefaultTunnelProfiles = [mockedNonDefaultProfile]
    const mockedWithDefaultTunnelProfiles = [
      mockedVxlanDefaultTunnelProfileViewData,
      mockedVlanVxlanDefaultTunnelProfileViewData,
      mockedNonDefaultProfile
    ]

    it('should return both vxlan and vlanVxlan when no target type', () => {
      expect(getTunnelProfileOptsWithDefault(mockedNoDefaultTunnelProfiles))
        .toStrictEqual([
          { label: mockedNonDefaultProfile.name, value: mockedNonDefaultProfile.id },
          { label: defaultVxLANProfileName, value: tenantId },
          { label: defaultVLANVxLANProfileName, value: `SL${tenantId}` }
        ])
    })
    it('should return vxlan default when is only need vxlan', () => {
      // eslint-disable-next-line max-len
      expect(getTunnelProfileOptsWithDefault(mockedNoDefaultTunnelProfiles, NetworkSegmentTypeEnum.VXLAN))
        .toStrictEqual([
          { label: mockedNonDefaultProfile.name, value: mockedNonDefaultProfile.id },
          { label: defaultVxLANProfileName, value: tenantId }
        ])
    })

    it('should return vlan_vxlan default when is only need vlan_vxlan', () => {
      // eslint-disable-next-line max-len
      expect(getTunnelProfileOptsWithDefault(mockedNoDefaultTunnelProfiles, NetworkSegmentTypeEnum.VLAN_VXLAN))
        .toStrictEqual([
          { label: mockedNonDefaultProfile.name, value: mockedNonDefaultProfile.id },
          { label: defaultVLANVxLANProfileName, value: `SL${tenantId}` }
        ])
    })

    it('should handle with existing default profile', () => {
      expect(getTunnelProfileOptsWithDefault(mockedWithDefaultTunnelProfiles))
        .toStrictEqual([
          { label: defaultVxLANProfileName, value: tenantId },
          { label: defaultVLANVxLANProfileName, value: `SL${tenantId}` },
          { label: mockedNonDefaultProfile.name, value: mockedNonDefaultProfile.id }
        ])
    })

    it('should return empty when profile is invalid', () => {
      expect(getTunnelProfileOptsWithDefault(undefined))
        .toStrictEqual([])
    })
  })

  describe('ageTimeUnitConversion', () => {
    it('should parse into minutes', () => {
      expect(ageTimeUnitConversion(30)).toStrictEqual({
        value: 30,
        unit: AgeTimeUnit.MINUTES
      })
      expect(ageTimeUnitConversion(1455)).toStrictEqual({
        value: 1455,
        unit: AgeTimeUnit.MINUTES
      })
      expect(ageTimeUnitConversion(2000)).toStrictEqual({
        value: 2000,
        unit: AgeTimeUnit.MINUTES
      })
      expect(ageTimeUnitConversion(15000)).toStrictEqual({
        value: 15000,
        unit: AgeTimeUnit.MINUTES
      })
    })

    it('should parse into days', () => {
      expect(ageTimeUnitConversion(60*24*6)).toStrictEqual({
        value: 6,
        unit: AgeTimeUnit.DAYS
      })
    })

    it('should parse into weeks', () => {
      expect(ageTimeUnitConversion(60*24*7*2)).toStrictEqual({
        value: 2,
        unit: AgeTimeUnit.WEEK
      })
    })

    it('should handle undefined', () => {
      expect(ageTimeUnitConversion(undefined)).toStrictEqual(undefined)
    })
  })

  describe('getTunnelProfileFormDefaultValues', () => {
    it('should return default data when given undefined', () => {
      expect(getTunnelProfileFormDefaultValues(undefined)).toStrictEqual({
        mtuType: MtuTypeEnum.AUTO,
        ageTimeMinutes: 20,
        ageTimeUnit: AgeTimeUnit.MINUTES,
        keepAliveInterval: 2,
        keepAliveRetry: 5,
        mtuRequestRetry: 5,
        mtuRequestTimeout: 2,
        mtuRequestTimeoutUnit: MtuRequestTimeoutUnit.SECONDS,
        natTraversalEnabled: false
      })
    })

    it('should return default data with given valid profile', () => {
      expect(getTunnelProfileFormDefaultValues({
        id: 'mocked_tunnel_id',
        name: 'mockd_tunnel_3',
        mtuType: 'AUTO',
        mtuSize: 0,
        ageTimeMinutes: 1440*2,
        forceFragmentation: false,
        type: 'VXLAN',
        keepAliveInterval: 6,
        keepAliveRetry: 6,
        mtuRequestRetry: 6,
        mtuRequestTimeout: 6
      } as TunnelProfile))
        .toStrictEqual({
          mtuType: MtuTypeEnum.AUTO,
          ageTimeMinutes: 2,
          ageTimeUnit: AgeTimeUnit.DAYS,
          id: 'mocked_tunnel_id',
          name: 'mockd_tunnel_3',
          mtuSize: 0,
          forceFragmentation: false,
          type: 'VXLAN',
          keepAliveInterval: 6,
          keepAliveRetry: 6,
          mtuRequestRetry: 6,
          mtuRequestTimeout: 6,
          mtuRequestTimeoutUnit: MtuRequestTimeoutUnit.MILLISECONDS,
          natTraversalEnabled: false
        })
    })
  })

  describe('mtuRequestTimeoutUnitConversion', () => {
    it('should parse into MILLISECONDS', () => {
      expect(mtuRequestTimeoutUnitConversion(10)).toStrictEqual({
        value: 10,
        unit: MtuRequestTimeoutUnit.MILLISECONDS
      })
      expect(mtuRequestTimeoutUnitConversion(990)).toStrictEqual({
        value: 990,
        unit: MtuRequestTimeoutUnit.MILLISECONDS
      })
    })

    it('should parse into SECONDS', () => {
      expect(mtuRequestTimeoutUnitConversion(3000)).toStrictEqual({
        value: 3,
        unit: MtuRequestTimeoutUnit.SECONDS
      })
    })

    it('should handle undefined', () => {
      expect(mtuRequestTimeoutUnitConversion(undefined)).toStrictEqual(undefined)
    })
  })

  describe('getTunnelTypeString', () => {
    const mockT = ({ defaultMessage }: { defaultMessage: string }) => defaultMessage

    it('should return VXLAN GPE', () => {
      expect(getTunnelTypeString(mockT, TunnelTypeEnum.VXLAN_GPE))
        .toStrictEqual('VXLAN GPE')
    })
    it('should return L2GRE', () => {
      expect(getTunnelTypeString(mockT, TunnelTypeEnum.L2GRE))
        .toStrictEqual('L2GRE')
    })
    it('should return empty string when tunnel type is undefined', () => {
      expect(getTunnelTypeString(mockT, undefined)).toStrictEqual('')
    })
  })
})
