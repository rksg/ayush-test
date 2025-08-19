/* eslint-disable max-len */
import _, { cloneDeep } from 'lodash'

import { CatchErrorDetails } from '@acx-ui/utils'

import { EdgeIpModeEnum, EdgePortTypeEnum, EdgeServiceStatusEnum, EdgeStatusEnum }                 from '../../models/EdgeEnum'
import { CommonErrorsResult, EdgeLag, EdgePort, EdgePortWithStatus, EdgeStatus, EdgeSubInterface } from '../../types'

import { EdgeAlarmFixtures, EdgeGeneralFixtures }                from './__tests__/fixtures'
import { mockedEdgeLagList, createMockLag, createMockLagMember } from './__tests__/fixtures/lag'
import { mockEdgePortConfig }                                    from './__tests__/fixtures/portsConfig'
import {
  allowRebootShutdownForStatus,
  allowResetForStatus,
  convertEdgeNetworkIfConfigToApiPayload,
  convertEdgeSubInterfaceToApiPayload,
  executeWithCallback,
  genExpireTimeString,
  getEdgeAppCurrentVersions,
  getEdgeModelDisplayText,
  getEdgeNatPools,
  getEdgeServiceHealth,
  getIpWithBitMask,
  getMergedLagTableDataFromLagForm,
  getSuggestedIpRange,
  isAllPortsLagMember,
  isEdgeMatchedRequiredFirmware,
  isInterfaceInVRRPSetting,
  optionSorter,
  getLagGateways
} from './edgeUtils'

const { requireAttentionAlarmSummary, poorAlarmSummary } = EdgeAlarmFixtures
const { mockEdgeClusterList, mockedHaNetworkSettings } = EdgeGeneralFixtures

describe('Edge utils', () => {

  it('should get good service health', () => {
    const serviceHealth = getEdgeServiceHealth([])
    expect(serviceHealth).toBe(EdgeServiceStatusEnum.GOOD)
  })

  it('should get require attention service health', () => {
    const serviceHealth = getEdgeServiceHealth(requireAttentionAlarmSummary)
    expect(serviceHealth).toBe(EdgeServiceStatusEnum.REQUIRES_ATTENTION)
  })

  it('should get poor service health', () => {
    const serviceHealth = getEdgeServiceHealth(poorAlarmSummary)
    expect(serviceHealth).toBe(EdgeServiceStatusEnum.POOR)
  })

  it('should get unknown service health', () => {
    const serviceHealth = getEdgeServiceHealth(undefined)
    expect(serviceHealth).toBe(EdgeServiceStatusEnum.UNKNOWN)
  })

  it('reboot & reset should be allowed only for a set of specific statuses', () => {
    Object.values(EdgeStatusEnum).forEach(status => {
      expect(allowRebootShutdownForStatus(status)).toBe(status === EdgeStatusEnum.OPERATIONAL ||
        status === EdgeStatusEnum.APPLYING_CONFIGURATION ||
        status === EdgeStatusEnum.CONFIGURATION_UPDATE_FAILED ||
        status === EdgeStatusEnum.FIRMWARE_UPDATE_FAILED)

      expect(allowResetForStatus(status)).toBe(status === EdgeStatusEnum.OPERATIONAL ||
        status === EdgeStatusEnum.APPLYING_CONFIGURATION ||
        status === EdgeStatusEnum.CONFIGURATION_UPDATE_FAILED ||
        status === EdgeStatusEnum.FIRMWARE_UPDATE_FAILED)
    })
  })

  it('should getIpWithBitMask correctly', () => {
    const result = getIpWithBitMask('192.168.1.2', '255.255.255.0')
    expect(result).toBe('192.168.1.2/ 24')
  })

  it('should getSuggestedIpRange correctly', () => {
    const result = getSuggestedIpRange('192.168.1.2', '255.255.255.0')
    expect(result).toBe('192.168.1.0/ 24')
  })

  it('Test optionSorter correctly', () => {
    const mockOptions = [
      {
        label: 'Port3',
        value: 'port3'
      },
      {
        label: 'Lag1',
        value: 'lag1'
      }
    ]
    expect(optionSorter(mockOptions[0], mockOptions[1])).toBe(1)
    expect(optionSorter(mockOptions[1], mockOptions[0])).toBe(-1)
    expect(optionSorter(mockOptions[0], mockOptions[0])).toBe(0)
  })

  it('Test isInterfaceInVRRPSetting true', async () => {
    expect(isInterfaceInVRRPSetting(
      mockEdgeClusterList.data[0].edgeList[0].serialNumber,
      'port2',
      mockedHaNetworkSettings.virtualIpSettings
    )).toBeTruthy()
  })

  it('Test isInterfaceInVRRPSetting false', async () => {
    expect(isInterfaceInVRRPSetting(
      mockEdgeClusterList.data[0].edgeList[0].serialNumber,
      'port3',
      mockedHaNetworkSettings.virtualIpSettings
    )).toBeFalsy()
  })

  it('Test genExpireTimeString', async () => {
    expect(genExpireTimeString(86400)).toBe('1 Day 00:00:00')
    expect(genExpireTimeString(172801)).toBe('2 Days 00:00:01')
    expect(genExpireTimeString(70000)).toBe(' 19:26:40')
  })
})



describe('isAllPortsLagMember', () => {
  // 3 ports
  const mockUnconfiguredPorts = _.cloneDeep(mockEdgePortConfig.ports.slice(0,3))
  mockUnconfiguredPorts.forEach(item => {
    item.enabled = true
    item.portType = EdgePortTypeEnum.UNCONFIGURED
    item.ipMode = EdgeIpModeEnum.DHCP
    item.corePortEnabled = false
  })

  const mockSinglePort = _.cloneDeep(mockUnconfiguredPorts[0])
  mockSinglePort.portType = EdgePortTypeEnum.LAN
  mockSinglePort.ipMode = EdgeIpModeEnum.STATIC

  const mockLanLags = [{
    id: 0,
    description: 'string',
    lagType: 'LACP',
    lacpMode: 'ACTIVE',
    lacpTimeout: 'SHORT',
    lagMembers: [{
      portId: mockUnconfiguredPorts[0].id,
      portEnabled: true
    }],
    portType: 'LAN',
    ipMode: 'STATIC',
    ip: '1.1.1.1',
    subnet: '255.255.255.0',
    gateway: '',
    corePortEnabled: false,
    natEnabled: false,
    lagEnabled: true
  }] as EdgeLag[]

  const noLags = [] as EdgeLag[]

  describe('true case', () => {
    it('when all port are lag member', async () => {
      const mockLags = _.cloneDeep(mockLanLags[0])
      mockLags.lagMembers = [{
        portId: mockSinglePort.id,
        portEnabled: true
      }]

      expect(isAllPortsLagMember([mockSinglePort], [mockLags])).toBe(true)
    })
  })

  describe('false case', () => {
    it('when lag member is undefined', async () => {
      const mockLags = _.cloneDeep(mockLanLags[0])
      mockLags.lagMembers = []

      expect(isAllPortsLagMember([mockSinglePort], [mockLags])).toBe(false)
    })

    it('when lag member is empty', async () => {
      const mockLags = _.cloneDeep(mockLanLags[0])
      mockLags.lagMembers = []

      expect(isAllPortsLagMember([mockSinglePort], [mockLags])).toBe(false)
    })

    it('when lag is empty', async () => {
      expect(isAllPortsLagMember([mockSinglePort], noLags)).toBe(false)
    })

    it('when only partial port is lag member', async () => {
      const mockLags = _.cloneDeep(mockLanLags[0])
      mockLags.lagMembers = [{
        portId: mockUnconfiguredPorts[0].id,
        portEnabled: true
      }]

      expect(isAllPortsLagMember(mockUnconfiguredPorts, [mockLags])).toBe(false)
    })
  })
})

describe('convertEdgeNetworkIfConfigToApiPayload', () => {
  it('should set gateway to empty string if port type is CLUSTER', () => {
    const edgePort = {
      id: '',
      name: '',
      statusIp: '192.168.10.11',
      mac: '',
      ip: '192.168.10.11',
      subnet: '255.255.255.0',
      gateway: '192.168.1.1',
      natEnabled: false,
      corePortEnabled: false,
      ipMode: EdgeIpModeEnum.STATIC,
      portType: EdgePortTypeEnum.CLUSTER
    } as EdgePortWithStatus
    const result = convertEdgeNetworkIfConfigToApiPayload(edgePort)
    expect(result.gateway).toBe('')
  })

  it('should set ip and subnet to empty string if ip mode is DHCP', () => {
    const edgePort = {
      id: '',
      name: '',
      statusIp: '192.168.1.1',
      mac: '',
      ip: '192.168.1.1',
      subnet: '255.255.255.0',
      gateway: '',
      natEnabled: false,
      corePortEnabled: false,
      ipMode: EdgeIpModeEnum.DHCP,
      portType: EdgePortTypeEnum.WAN
    } as EdgePortWithStatus
    const result = convertEdgeNetworkIfConfigToApiPayload(edgePort)
    expect(result.ip).toBe('')
    expect(result.subnet).toBe('')
  })

  it('should clear gateway and IP/subnet for DHCP mode', () => {
    const formData = {
      ipMode: EdgeIpModeEnum.DHCP,
      gateway: '1.1.1.1',
      ip: '2.2.2.2',
      subnet: '255.255.255.0'
    } as EdgePortWithStatus
    const result = convertEdgeNetworkIfConfigToApiPayload(formData)
    expect(result.gateway).toBe('')
    expect(result.ip).toBe('')
    expect(result.subnet).toBe('')
  })

  it('should clear gateway for CLUSTER port type', () => {
    const formData = {
      portType: EdgePortTypeEnum.CLUSTER,
      gateway: '1.1.1.1'
    } as EdgePortWithStatus
    const result = convertEdgeNetworkIfConfigToApiPayload(formData)
    expect(result.gateway).toBe('')
  })

  it('should set ip mode to DHCP if port type is UNCONFIGURED', () => {
    const edgePort = {
      id: '',
      name: '',
      statusIp: '192.168.10.11',
      mac: '',
      ip: '192.168.10.11',
      subnet: '255.255.255.0',
      gateway: '192.168.1.1',
      natEnabled: false,
      corePortEnabled: false,
      ipMode: EdgeIpModeEnum.STATIC,
      portType: EdgePortTypeEnum.UNCONFIGURED
    } as EdgePortWithStatus
    const result = convertEdgeNetworkIfConfigToApiPayload(edgePort)
    expect(result.ipMode).toBe(EdgeIpModeEnum.DHCP)
    expect(result.ip).toBe('')
    expect(result.subnet).toBe('')
    expect(result.gateway).toBe('')
  })

  it('should disable NAT for LAN port type', () => {
    const formData = {
      portType: EdgePortTypeEnum.LAN,
      natEnabled: true
    } as EdgePortWithStatus
    const result = convertEdgeNetworkIfConfigToApiPayload(formData)
    expect(result.natEnabled).toBe(false)
  })

  it('should clear gateway for LAN port type with corePortEnabled false', () => {
    const formData = {
      portType: EdgePortTypeEnum.LAN,
      corePortEnabled: false,
      gateway: '1.1.1.1'
    } as EdgePortWithStatus
    const result = convertEdgeNetworkIfConfigToApiPayload(formData)
    expect(result.gateway).toBe('')
  })

  it('should clear gateway for LAN port type with accessPortEnabled false when core access FF is on', () => {
    const formData = {
      portType: EdgePortTypeEnum.LAN,
      accessPortEnabled: false,
      gateway: '1.1.1.1'
    } as EdgePortWithStatus
    const result = convertEdgeNetworkIfConfigToApiPayload(formData, true)
    expect(result.gateway).toBe('')
  })

  // eslint-disable-next-line max-len
  it('should change IP mode to STATIC for LAN port type with corePortEnabled false and DHCP mode', () => {
    const formData = {
      portType: EdgePortTypeEnum.LAN,
      corePortEnabled: false,
      ipMode: EdgeIpModeEnum.DHCP
    } as EdgePortWithStatus
    const result = convertEdgeNetworkIfConfigToApiPayload(formData)
    expect(result.ipMode).toBe(EdgeIpModeEnum.STATIC)
  })

  it('should change IP mode to STATIC for LAN port type with both corePortEnabled and accessPortEnabled are false and DHCP mode', () => {
    const formData = {
      portType: EdgePortTypeEnum.LAN,
      corePortEnabled: false,
      accessPortEnabled: false,
      ipMode: EdgeIpModeEnum.DHCP
    } as EdgePortWithStatus
    const result = convertEdgeNetworkIfConfigToApiPayload(formData, true)
    expect(result.ipMode).toBe(EdgeIpModeEnum.STATIC)
  })

  it('should not enable NAT for non-LAN port type', () => {
    const formData = {
      portType: EdgePortTypeEnum.WAN,
      natEnabled: true
    } as EdgePortWithStatus
    const result = convertEdgeNetworkIfConfigToApiPayload(formData)
    expect(result.natEnabled).toBe(true)
  })

  it('should clear NAT pool when NAT is not enabled', () => {
    const formData = {
      portType: EdgePortTypeEnum.WAN,
      natEnabled: false,
      natPools: [{ startIpAddress: '1.1.1.2', endIpAddress: '1.1.1.30' }]
    } as EdgePortWithStatus
    const result = convertEdgeNetworkIfConfigToApiPayload(formData)
    expect(result.natPools).toEqual([])
  })

  it('should clear NAT settings when port type is not WAN', () => {
    const formData = {
      portType: EdgePortTypeEnum.LAN,
      natEnabled: true,
      natPools: [{ startIpAddress: '1.1.1.2', endIpAddress: '1.1.1.30' }]
    } as EdgePortWithStatus
    const result = convertEdgeNetworkIfConfigToApiPayload(formData)
    expect(result.natEnabled).toEqual(false)
    expect(result.natPools).toEqual([])
  })

  it('should not set corePortEnabled for non-LAN port type', () => {
    const formData = {
      portType: EdgePortTypeEnum.WAN,
      corePortEnabled: true
    } as EdgePortWithStatus
    const result = convertEdgeNetworkIfConfigToApiPayload(formData)
    expect(result.corePortEnabled).toBe(false)
  })

  it('should return empty formData', () => {
    const formData = {} as EdgePortWithStatus
    const result = convertEdgeNetworkIfConfigToApiPayload(formData)
    expect(result).toStrictEqual({
      natEnabled: false,
      natPools: []
    })
  })
})

describe('convertEdgeSubInterfaceToApiPayload', () => {
  it('returns original formData when ipMode is not DHCP', () => {
    const formData = {
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '192.168.1.1',
      subnet: '255.255.255.0'
    } as EdgeSubInterface
    const result = convertEdgeSubInterfaceToApiPayload(formData)
    expect(result).toEqual(formData)
  })

  it('sets ip and subnet to empty strings when ipMode is DHCP', () => {
    const formData = {
      ipMode: EdgeIpModeEnum.DHCP,
      ip: '192.168.1.1',
      subnet: '255.255.255.0'
    } as EdgeSubInterface
    const result = convertEdgeSubInterfaceToApiPayload(formData)
    expect(result.ip).toBe('')
    expect(result.subnet).toBe('')
  })

  it('handles undefined formData', () => {
    const formData: EdgeSubInterface | null | undefined = undefined
    const result = convertEdgeSubInterfaceToApiPayload(formData)
    expect(result).toEqual({})
  })
})

describe('getEdgeModelDisplayText', () => {

  it('should return "Virtual RUCKUS Edge" for "vRUCKUS Edge" model', () => {
    const result = getEdgeModelDisplayText('vRUCKUS Edge')
    expect(result).toBe('Virtual RUCKUS Edge')
  })

  it('should return "RUCKUS Edge <model>" for model starting with "E"', () => {
    const model = 'E123'
    const result = getEdgeModelDisplayText(model)
    expect(result).toBe(`RUCKUS Edge ${model.replace('E', '')}`)
  })

  it('should return original model for model not starting with "E"', () => {
    const model = 'ABC123'
    const result = getEdgeModelDisplayText(model)
    expect(result).toBe(model)
  })

  it('should return empty string for undefined model', () => {
    const result = getEdgeModelDisplayText(undefined)
    expect(result).toBe('')
  })

  it('should return empty string for null model', () => {
    const result = getEdgeModelDisplayText(null)
    expect(result).toBe('')
  })

  it('should return empty string for empty string model', () => {
    const result = getEdgeModelDisplayText('')
    expect(result).toBe('')
  })
})

describe('getEdgeAppCurrentVersions', () => {
  it('should return multiple versions from clusterAppVersionInfo', () => {
    const data = {
      clusterAppVersionInfo: [
        { currentVersion: '1.0.0' },
        { currentVersion: '2.0.0' },
        { currentVersion: '' },
        { currentVersion: '1.0.0' }
      ]
    }
    expect(getEdgeAppCurrentVersions(data)).toBe('1.0.0, 2.0.0')
  })
  it('should return single version from clusterAppVersionInfo', () => {
    const data = {
      clusterAppVersionInfo: [{ currentVersion: '1.0.0' }]
    }
    expect(getEdgeAppCurrentVersions(data)).toBe('1.0.0')
  })
  it('should return NA when clusterAppVersionInfo is empty', () => {
    const data = {
      clusterAppVersionInfo: []
    }
    expect(getEdgeAppCurrentVersions(data)).toBe('NA')
  })
  it('should return currentVersion when clusterAppVersionInfo is not present', () => {
    const data = {
      currentVersion: '1.0.0'
    }
    expect(getEdgeAppCurrentVersions(data)).toBe('1.0.0')
  })
  it('should return NA when currentVersion is not present', () => {
    const data = {}
    expect(getEdgeAppCurrentVersions(data)).toBe('NA')
  })
  it('should return NA when data object is null', () => {
    expect(getEdgeAppCurrentVersions(null)).toBe('NA')
  })
  it('should return NA when clusterAppVersionInfo is null', () => {
    const data = {
      clusterAppVersionInfo: null
    }
    expect(getEdgeAppCurrentVersions(data)).toBe('NA')
  })
})


describe('getEdgeNatPools', () => {
  const natPort1 = cloneDeep(mockEdgePortConfig.ports[0])
  natPort1.natEnabled = true
  natPort1.natPools = [{ startIpAddress: '1.1.1.1', endIpAddress: '1.1.1.10' }]
  const natPort2 = cloneDeep(mockEdgePortConfig.ports[1])
  natPort2.portType = EdgePortTypeEnum.WAN
  natPort2.natEnabled = true
  natPort2.natPools = [{ startIpAddress: '2.2.2.1', endIpAddress: '2.2.2.10' }]

  const natLag1 = cloneDeep(mockedEdgeLagList.content[0])
  natLag1.lagMembers = [{ portId: natPort2.id, portEnabled: true }]
  natLag1.natPools = [{ startIpAddress: '3.3.3.1', endIpAddress: '3.3.3.10' }]

  it('should return an empty array when no lag data is provided', () => {
    const portsData: EdgePort[] = [natPort1, natPort2]

    const result = getEdgeNatPools(portsData, undefined)
    expect(result).toEqual([
      { startIpAddress: '1.1.1.1', endIpAddress: '1.1.1.10' },
      { startIpAddress: '2.2.2.1', endIpAddress: '2.2.2.10' }
    ])
  })
  it('should filter out LAG member ports', () => {
    const portsData: EdgePort[] = [natPort1, natPort2]
    const lagData: EdgeLag[] = [natLag1]
    const result = getEdgeNatPools(portsData, lagData)
    expect(result).toEqual([
      { startIpAddress: '1.1.1.1', endIpAddress: '1.1.1.10' },
      { startIpAddress: '3.3.3.1', endIpAddress: '3.3.3.10' }
    ])
  })

  it('should filter out nat pools with missing start or end IP address', () => {
    const invalidNatPoolPort = cloneDeep(natPort2)
    invalidNatPoolPort.natPools = [{ startIpAddress: '2.2.2.1' }]
    const portsData: EdgePort[] = [natPort1, invalidNatPoolPort]

    const result = getEdgeNatPools(portsData, undefined)
    expect(result).toEqual([
      { startIpAddress: '1.1.1.1', endIpAddress: '1.1.1.10' }
    ])
  })
  it('should handle invalid input (null or undefined lag data)', () => {
    expect(() => getEdgeNatPools([], undefined)).not.toThrow()
    expect(getEdgeNatPools([], undefined)).toEqual([])

    expect(() => getEdgeNatPools([], null)).not.toThrow()
    expect(getEdgeNatPools([], null)).toEqual([])

    expect(() => getEdgeNatPools([], [])).not.toThrow()
    expect(getEdgeNatPools([], [])).toEqual([])
  })
})

describe('getMergedLagTableDataFromLagForm', () => {
  const mockLagList = cloneDeep(mockedEdgeLagList.content)

  it('should update lag data with changed data', () => {
    const changedLag = cloneDeep(mockLagList[0])
    changedLag.natEnabled = false
    changedLag.lagMembers = changedLag.lagMembers.slice(0, 1)

    const expected = [changedLag, ...mockLagList.slice(1)]
    expect(getMergedLagTableDataFromLagForm(mockLagList, changedLag)).toEqual(expected)
  })

  it('should merges with new create(non-existent) lag data', () => {
    const changedLag = { id: 3, name: 'newLag' }
    const expected = [...mockLagList, { id: 3, name: 'newLag' }]
    expect(getMergedLagTableDataFromLagForm(mockLagList, changedLag)).toEqual(expected)
  })

  it('should handle undefined existing lag data', () => {
    const changedLag = { id: 1, name: 'newLag' }
    const expected = [{ id: 1, name: 'newLag' }]
    expect(getMergedLagTableDataFromLagForm(undefined, changedLag)).toEqual(expected)
  })
})

describe('isEdgeMatchedRequiredFirmware', () => {
  it('returns false with empty edge list', () => {
    expect(isEdgeMatchedRequiredFirmware('1.0.0', [])).toBe(false)
  })

  it('returns true with single edge in list, required firmware is met', () => {
    const edgeList = [{ firmwareVersion: '1.0.0' }] as EdgeStatus[]
    expect(isEdgeMatchedRequiredFirmware('1.0.0', edgeList)).toBe(true)
  })

  it('returns true with multiple edges in list, required firmware is met', () => {
    const edgeList = [{ firmwareVersion: '1.0.0' }, { firmwareVersion: '1.1.0' }] as EdgeStatus[]
    expect(isEdgeMatchedRequiredFirmware('1.0.0', edgeList)).toBe(true)
  })

  it('returns false with multiple edges in list, required firmware is not met', () => {
    const edgeList = [{ firmwareVersion: '0.9.0' }, { firmwareVersion: '1.1.0' }] as EdgeStatus[]
    expect(isEdgeMatchedRequiredFirmware('1.0.0', edgeList)).toBe(false)
  })

  it('returns false with edge list containing null or undefined firmware versions', () => {
    const edgeList = [{ firmwareVersion: null }, { firmwareVersion: '1.1.0' }] as EdgeStatus[]
    expect(isEdgeMatchedRequiredFirmware('1.0.0', edgeList)).toBe(false)
  })
})

describe('getLagGateways', () => {
  describe('undefined lagData', () => {
    it('should return empty array when lagData is undefined', () => {
      // Act
      const result = getLagGateways(undefined)

      // Assert
      expect(result).toEqual([])
    })

    it('should return empty array when lagData is undefined with includeCorePort false', () => {
      // Act
      const result = getLagGateways(undefined, false)

      // Assert
      expect(result).toEqual([])
    })

    it('should return empty array when lagData is undefined with isCoreAccessEnabled true', () => {
      // Act
      const result = getLagGateways(undefined, true, true)

      // Assert
      expect(result).toEqual([])
    })
  })

  describe('empty lagData', () => {
    it('should return empty array when lagData is empty', () => {
      // Arrange
      const lagData: EdgeLag[] = []

      // Act
      const result = getLagGateways(lagData)

      // Assert
      expect(result).toEqual([])
    })
  })

  describe('LAG filtering conditions', () => {
    it('should filter out LAGs that are not enabled', () => {
      // Arrange
      const lagData = [
        createMockLag({ lagEnabled: false, lagMembers: [createMockLagMember('port-1')] }),
        createMockLag({ lagEnabled: true, lagMembers: [createMockLagMember('port-2')] })
      ]

      // Act
      const result = getLagGateways(lagData)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].lagEnabled).toBe(true)
    })

    it('should filter out LAGs with no members', () => {
      // Arrange
      const lagData = [
        createMockLag({ lagMembers: [] }),
        createMockLag({ lagMembers: [createMockLagMember('port-1')] })
      ]

      // Act
      const result = getLagGateways(lagData)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].lagMembers).toHaveLength(1)
    })

    it('should filter out LAGs where no members are enabled', () => {
      // Arrange
      const lagData = [
        createMockLag({
          lagMembers: [
            createMockLagMember('port-1', false),
            createMockLagMember('port-2', false)
          ]
        }),
        createMockLag({
          lagMembers: [
            createMockLagMember('port-3', false),
            createMockLagMember('port-4', true)
          ]
        })
      ]

      // Act
      const result = getLagGateways(lagData)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].lagMembers).toHaveLength(2)
      expect(result[0].lagMembers.some(member => member.portEnabled)).toBe(true)
    })
  })

  describe('WAN port type', () => {
    it('should include WAN LAGs regardless of other conditions', () => {
      // Arrange
      const lagData = [
        createMockLag({
          portType: EdgePortTypeEnum.WAN,
          lagMembers: [createMockLagMember('port-1')]
        })
      ]

      // Act
      const result = getLagGateways(lagData)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].portType).toBe(EdgePortTypeEnum.WAN)
    })

    it('should include WAN LAGs even when includeCorePort is false', () => {
      // Arrange
      const lagData = [
        createMockLag({
          portType: EdgePortTypeEnum.WAN,
          lagMembers: [createMockLagMember('port-1')]
        })
      ]

      // Act
      const result = getLagGateways(lagData, false)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].portType).toBe(EdgePortTypeEnum.WAN)
    })

    it('should include WAN LAGs even when isCoreAccessEnabled is true', () => {
      // Arrange
      const lagData = [
        createMockLag({
          portType: EdgePortTypeEnum.WAN,
          lagMembers: [createMockLagMember('port-1')]
        })
      ]

      // Act
      const result = getLagGateways(lagData, true, true)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].portType).toBe(EdgePortTypeEnum.WAN)
    })
  })

  describe('LAN port type with includeCorePort', () => {
    it('should include LAN LAGs when includeCorePort is true and corePortEnabled is true', () => {
      // Arrange
      const lagData = [
        createMockLag({
          portType: EdgePortTypeEnum.LAN,
          corePortEnabled: true,
          lagMembers: [createMockLagMember('port-1')]
        })
      ]

      // Act
      const result = getLagGateways(lagData, true)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].portType).toBe(EdgePortTypeEnum.LAN)
      expect(result[0].corePortEnabled).toBe(true)
    })

    it('should exclude LAN LAGs when includeCorePort is false', () => {
      // Arrange
      const lagData = [
        createMockLag({
          portType: EdgePortTypeEnum.LAN,
          corePortEnabled: true,
          lagMembers: [createMockLagMember('port-1')]
        })
      ]

      // Act
      const result = getLagGateways(lagData, false)

      // Assert
      expect(result).toHaveLength(0)
    })

    it('should exclude LAN LAGs when includeCorePort is true but corePortEnabled is false', () => {
      // Arrange
      const lagData = [
        createMockLag({
          portType: EdgePortTypeEnum.LAN,
          corePortEnabled: false,
          lagMembers: [createMockLagMember('port-1')]
        })
      ]

      // Act
      const result = getLagGateways(lagData, true)

      // Assert
      expect(result).toHaveLength(0)
    })
  })

  describe('LAN port type with isCoreAccessEnabled', () => {
    it('should use accessPortEnabled when isCoreAccessEnabled is true', () => {
      // Arrange
      const lagData = [
        createMockLag({
          portType: EdgePortTypeEnum.LAN,
          accessPortEnabled: true,
          corePortEnabled: false,
          lagMembers: [createMockLagMember('port-1')]
        })
      ]

      // Act
      const result = getLagGateways(lagData, true, true)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].accessPortEnabled).toBe(true)
    })

    it('should use corePortEnabled when isCoreAccessEnabled is false', () => {
      // Arrange
      const lagData = [
        createMockLag({
          portType: EdgePortTypeEnum.LAN,
          accessPortEnabled: false,
          corePortEnabled: true,
          lagMembers: [createMockLagMember('port-1')]
        })
      ]

      // Act
      const result = getLagGateways(lagData, true, false)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].corePortEnabled).toBe(true)
    })

    it('should exclude LAN LAGs when isCoreAccessEnabled is true but accessPortEnabled is false', () => {
      // Arrange
      const lagData = [
        createMockLag({
          portType: EdgePortTypeEnum.LAN,
          accessPortEnabled: false,
          corePortEnabled: true,
          lagMembers: [createMockLagMember('port-1')]
        })
      ]

      // Act
      const result = getLagGateways(lagData, true, true)

      // Assert
      expect(result).toHaveLength(0)
    })

    it('should exclude LAN LAGs when isCoreAccessEnabled is false but corePortEnabled is false', () => {
      // Arrange
      const lagData = [
        createMockLag({
          portType: EdgePortTypeEnum.LAN,
          accessPortEnabled: true,
          corePortEnabled: false,
          lagMembers: [createMockLagMember('port-1')]
        })
      ]

      // Act
      const result = getLagGateways(lagData, true, false)

      // Assert
      expect(result).toHaveLength(0)
    })
  })

  describe('complex scenarios', () => {
    it('should handle mixed LAG types correctly', () => {
      // Arrange
      const lagData = [
        // WAN LAG - should be included
        createMockLag({
          portType: EdgePortTypeEnum.WAN,
          lagMembers: [createMockLagMember('port-1')]
        }),
        // LAN LAG with core enabled - should be included
        createMockLag({
          portType: EdgePortTypeEnum.LAN,
          corePortEnabled: true,
          lagMembers: [createMockLagMember('port-2')]
        }),
        // LAN LAG with core disabled - should be excluded
        createMockLag({
          portType: EdgePortTypeEnum.LAN,
          corePortEnabled: false,
          lagMembers: [createMockLagMember('port-3')]
        }),
        // Disabled LAG - should be excluded
        createMockLag({
          lagEnabled: false,
          lagMembers: [createMockLagMember('port-4')]
        }),
        // LAG with no enabled members - should be excluded
        createMockLag({
          lagMembers: [
            createMockLagMember('port-5', false),
            createMockLagMember('port-6', false)
          ]
        })
      ]

      // Act
      const result = getLagGateways(lagData, true)

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].portType).toBe(EdgePortTypeEnum.WAN)
      expect(result[1].portType).toBe(EdgePortTypeEnum.LAN)
      expect(result[1].corePortEnabled).toBe(true)
    })

    it('should handle core/access separation correctly', () => {
      // Arrange
      const lagData = [
        // Core port enabled, access disabled
        createMockLag({
          portType: EdgePortTypeEnum.LAN,
          corePortEnabled: true,
          accessPortEnabled: false,
          lagMembers: [createMockLagMember('port-1')]
        }),
        // Core port disabled, access enabled
        createMockLag({
          portType: EdgePortTypeEnum.LAN,
          corePortEnabled: false,
          accessPortEnabled: true,
          lagMembers: [createMockLagMember('port-2')]
        })
      ]

      // Act - test with isCoreAccessEnabled = true (should use accessPortEnabled)
      const resultWithAccess = getLagGateways(lagData, true, true)

      // Assert
      expect(resultWithAccess).toHaveLength(1)
      expect(resultWithAccess[0].accessPortEnabled).toBe(true)

      // Act - test with isCoreAccessEnabled = false (should use corePortEnabled)
      const resultWithCore = getLagGateways(lagData, true, false)

      // Assert
      expect(resultWithCore).toHaveLength(1)
      expect(resultWithCore[0].corePortEnabled).toBe(true)
    })

    it('should handle includeCorePort = false correctly', () => {
      // Arrange
      const lagData = [
        // WAN LAG - should still be included
        createMockLag({
          portType: EdgePortTypeEnum.WAN,
          lagMembers: [createMockLagMember('port-1')]
        }),
        // LAN LAG with core enabled - should be excluded when includeCorePort = false
        createMockLag({
          portType: EdgePortTypeEnum.LAN,
          corePortEnabled: true,
          lagMembers: [createMockLagMember('port-2')]
        })
      ]

      // Act
      const result = getLagGateways(lagData, false)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].portType).toBe(EdgePortTypeEnum.WAN)
    })
  })

  describe('edge cases', () => {
    it('should handle LAGs with multiple members where only some are enabled', () => {
      // Arrange
      const lagData = [
        createMockLag({
          lagMembers: [
            createMockLagMember('port-1', false),
            createMockLagMember('port-2', true),
            createMockLagMember('port-3', false)
          ]
        })
      ]

      // Act
      const result = getLagGateways(lagData)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].lagMembers).toHaveLength(3)
      expect(result[0].lagMembers.some(member => member.portEnabled)).toBe(true)
    })

    it('should handle LAGs with all members disabled', () => {
      // Arrange
      const lagData = [
        createMockLag({
          lagMembers: [
            createMockLagMember('port-1', false),
            createMockLagMember('port-2', false),
            createMockLagMember('port-3', false)
          ]
        })
      ]

      // Act
      const result = getLagGateways(lagData)

      // Assert
      expect(result).toHaveLength(0)
    })

    it('should handle undefined isCoreAccessEnabled parameter', () => {
      // Arrange
      const lagData = [
        createMockLag({
          portType: EdgePortTypeEnum.LAN,
          corePortEnabled: true,
          accessPortEnabled: false,
          lagMembers: [createMockLagMember('port-1')]
        })
      ]

      // Act
      const result = getLagGateways(lagData, true, undefined)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].corePortEnabled).toBe(true)
    })

    it('should handle LAGs with UNCONFIGURED port type', () => {
      // Arrange
      const lagData = [
        createMockLag({
          portType: EdgePortTypeEnum.UNCONFIGURED,
          lagMembers: [createMockLagMember('port-1')]
        })
      ]

      // Act
      const result = getLagGateways(lagData)

      // Assert
      expect(result).toHaveLength(0)
    })
  })
})

describe('executeWithCallback', () => {
  it('should resolve with result when operation is successful', async () => {
    const result = await executeWithCallback(async (callback) => {
      callback({ response: { id: '123' } })
    })
    expect(result).toEqual({ response: { id: '123' } })
  })

  it('should reject with error when operation fails', async () => {
    await expect(executeWithCallback(async (callback) => {
      callback({ data: { errors: [{ code: '123' }] } })
    })).rejects.toEqual({ data: { errors: [{ code: '123' }] } })
  })

  it('should reject with error when operation fails with CommonErrorsResult', async () => {
    await expect(executeWithCallback(async (callback) => {
      callback({ data: { errors: [{ code: '123' }] } } as CommonErrorsResult<CatchErrorDetails>)
    })).rejects.toEqual({ data: { errors: [{ code: '123' }] } })
  })
})