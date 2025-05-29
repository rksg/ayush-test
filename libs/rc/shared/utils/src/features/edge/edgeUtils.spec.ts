/* eslint-disable max-len */
import _ from 'lodash'

import { EdgeIpModeEnum, EdgePortTypeEnum, EdgeServiceStatusEnum, EdgeStatusEnum } from '../../models/EdgeEnum'
import { EdgeLag, EdgePortWithStatus, EdgeSubInterface }                           from '../../types'

import { EdgeAlarmFixtures, EdgeGeneralFixtures } from './__tests__/fixtures'
import { mockEdgePortConfig }                     from './__tests__/fixtures/portsConfig'
import {
  allowRebootShutdownForStatus,
  allowResetForStatus,
  convertEdgeNetworkIfConfigToApiPayload,
  convertEdgeSubInterfaceToApiPayload,
  genExpireTimeString,
  getEdgeModelDisplayText,
  getEdgeServiceHealth,
  getIpWithBitMask,
  getSuggestedIpRange,
  isAllPortsLagMember,
  isInterfaceInVRRPSetting,
  optionSorter
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
      mockLags.lagMembers = undefined

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