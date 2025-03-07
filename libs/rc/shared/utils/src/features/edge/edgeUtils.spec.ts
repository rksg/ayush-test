import _ from 'lodash'

import { EdgeLag }                                                                 from '../..'
import { EdgeIpModeEnum, EdgePortTypeEnum, EdgeServiceStatusEnum, EdgeStatusEnum } from '../../models/EdgeEnum'
import { EdgeSubInterface, EdgePortWithStatus }                                    from '../../types'

import { EdgeAlarmFixtures, EdgeGeneralFixtures } from './__tests__/fixtures'
import { mockEdgePortConfig }                     from './__tests__/fixtures/portsConfig'
import {
  allowRebootShutdownForStatus,
  allowResetForStatus,
  edgeSerialNumberValidator,
  genExpireTimeString,
  getEdgeServiceHealth,
  getIpWithBitMask,
  getSuggestedIpRange,
  isAllPortsLagMember,
  isInterfaceInVRRPSetting,
  lanPortsubnetValidator,
  optionSorter,
  validateClusterInterface,
  validateEdgeGateway,
  validateSubnetIsConsistent,
  validateUniqueIp,
  convertEdgePortsConfigToApiPayload,
  convertEdgeSubinterfaceToApiPayload
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

  it('Test validate serial number success', async () => {
    let result = await edgeSerialNumberValidator('96123456789ABC34567890111123456110')
    expect(result).toBeUndefined()
    result = await edgeSerialNumberValidator('123456789012')
    expect(result).toBeUndefined()
  })

  it('Test validate serial number failed', async () => {
    let error
    try {
      await edgeSerialNumberValidator('96123456789012')
    } catch (ex) {
      error = ex
    }
    expect(error).toBe('This field is invalid')
    try {
      await edgeSerialNumberValidator('1012A4567890')
    } catch (ex) {
      error = ex
    }
    expect(error).toBe('This field is invalid')
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

  it('Test lanPortsubnetValidator success', async () => {
    const currentSubnetInfo = {
      ip: '1.1.1.1',
      subnetMask: '255.255.255.0'
    }
    const allSubnetWithoutCurrent = [
      {
        ip: '2.2.2.2',
        subnetMask: '255.255.255.0'
      },
      {
        ip: '3.3.3.3',
        subnetMask: '255.255.255.0'
      }
    ]
    const mockErrorFn = jest.fn()
    try {
      await lanPortsubnetValidator(currentSubnetInfo, allSubnetWithoutCurrent)
    } catch (ex) {
      mockErrorFn()
    }
    expect(mockErrorFn).not.toBeCalled()
  })

  it('Test lanPortsubnetValidator failed', async () => {
    const currentSubnetInfo = {
      ip: '1.1.1.1',
      subnetMask: '255.255.255.0'
    }
    const allSubnetWithoutCurrent = [
      {
        ip: '1.1.1.1',
        subnetMask: '255.255.255.0'
      },
      {
        ip: '3.3.3.3',
        subnetMask: '255.255.255.0'
      }
    ]
    const mockErrorFn = jest.fn()
    try {
      await lanPortsubnetValidator(currentSubnetInfo, allSubnetWithoutCurrent)
    } catch (ex) {
      mockErrorFn(ex)
    }
    expect(mockErrorFn).toBeCalledWith('The ports have overlapping subnets')
  })

  it('Test validateSubnetIsConsistent success', async () => {
    const allIps = [
      {
        ip: '1.1.1.1',
        subnet: '255.255.255.0'
      },
      {
        ip: '1.1.1.5',
        subnet: '255.255.255.0'
      }
    ]
    const mockErrorFn = jest.fn()
    try {
      await validateSubnetIsConsistent(allIps, '1')
    } catch (ex) {
      mockErrorFn()
    }
    expect(mockErrorFn).not.toBeCalled()
  })

  it('Test validateSubnetIsConsistent failed', async () => {
    const allIps = [
      {
        ip: '1.1.1.1',
        subnet: '255.255.255.0'
      },
      {
        ip: '2.2.2.2',
        subnet: '255.255.255.0'
      }
    ]
    const mockErrorFn = jest.fn()
    try {
      await validateSubnetIsConsistent(allIps, '1')
    } catch (ex) {
      mockErrorFn(ex)
    }
    // eslint-disable-next-line max-len
    expect(mockErrorFn).toBeCalledWith('The selected port is not in the same subnet as other nodes.')
  })

  it('Test validateUniqueIp success', async () => {
    const allIps = ['1.1.1.1', '2.2.2.2']
    const mockErrorFn = jest.fn()
    try {
      await validateUniqueIp(allIps, 'true')
    } catch (ex) {
      mockErrorFn()
    }
    expect(mockErrorFn).not.toBeCalled()
  })

  it('Test validateUniqueIp failed', async () => {
    const allIps = ['1.1.1.1', '1.1.1.1']
    const mockErrorFn = jest.fn()
    try {
      await validateUniqueIp(allIps, 'true')
    } catch (ex) {
      mockErrorFn(ex)
    }
    expect(mockErrorFn).toBeCalledWith('IP address cannot be the same as other nodes.')
  })

  it('Test validateClusterInterface success', async () => {
    const allIps = ['port2', 'port1']
    const mockErrorFn = jest.fn()
    try {
      await validateClusterInterface(allIps)
    } catch (ex) {
      mockErrorFn()
    }
    expect(mockErrorFn).not.toBeCalled()
  })

  it('Test validateClusterInterface failed', async () => {
    const allIps = ['port1', 'lag0']
    const mockErrorFn = jest.fn()
    try {
      await validateClusterInterface(allIps)
    } catch (ex) {
      mockErrorFn(ex)
    }
    // eslint-disable-next-line max-len
    expect(mockErrorFn).toBeCalledWith('Make sure you select the same interface type (physical port or LAG) as that of another node in this cluster.')
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

describe('validateEdgeGateway', () => {
  // 3 ports
  const mockUnconfgiuredPorts = _.cloneDeep(mockEdgePortConfig.ports.slice(0,3))
  mockUnconfgiuredPorts.forEach(item => {
    item.enabled = true
    item.portType = EdgePortTypeEnum.UNCONFIGURED
    item.ipMode = EdgeIpModeEnum.DHCP
    item.corePortEnabled = false
  })

  const mockLanLags = [{
    id: 0,
    description: 'string',
    lagType: 'LACP',
    lacpMode: 'ACTIVE',
    lacpTimeout: 'SHORT',
    lagMembers: [{
      portId: mockUnconfgiuredPorts[0].id,
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


  describe('invalid case', () => {
    it('when all ports unconfigured with empty lag', async () => {
      const allPorts = mockUnconfgiuredPorts
      let result
      try {
        result = await validateEdgeGateway(allPorts, noLags)
      } catch(err) {
        result = err
      }

      // eslint-disable-next-line max-len
      expect(result).toBe('At least one port must be enabled and configured to WAN or core port to form a cluster.')
    })

    it('when LAN port with LAN lag', async () => {
      const mockPorts = _.cloneDeep(mockUnconfgiuredPorts)
      mockPorts.forEach((item, idx) => {
        if (idx === 0) return // lag member
        item.enabled = true
        item.portType = EdgePortTypeEnum.LAN
        item.ipMode = EdgeIpModeEnum.STATIC
        item.corePortEnabled = false
      })

      let result
      try {
        result = await validateEdgeGateway(mockPorts, mockLanLags)
      } catch(err) {
        result = err
      }

      // eslint-disable-next-line max-len
      expect(result).toBe('At least one port must be enabled and configured to WAN or core port to form a cluster.')
    })

    it('when all ports are LAN lag member', async () => {
      const mockData = _.cloneDeep(mockLanLags[0])
      mockData.portType = EdgePortTypeEnum.LAN
      mockData.ipMode = EdgeIpModeEnum.STATIC
      mockData.corePortEnabled = false
      mockData.lagMembers = mockUnconfgiuredPorts.map(p => ({
        portId: p.id,
        portEnabled: true
      }))

      const allPorts = mockUnconfgiuredPorts
      let result
      try {
        result = await validateEdgeGateway(allPorts, [mockData])
      } catch(err) {
        result = err
      }

      // eslint-disable-next-line max-len
      expect(result).toBe('At least one port must be enabled and configured to WAN or core port to form a cluster.')
    })

    it('when all ports are WAN lag member but all disabled', async () => {
      const mockData = _.cloneDeep(mockLanLags[0])
      mockData.portType = EdgePortTypeEnum.WAN
      mockData.ipMode = EdgeIpModeEnum.DHCP
      mockData.corePortEnabled = false
      mockData.lagMembers = mockUnconfgiuredPorts.map(p => ({
        portId: p.id,
        portEnabled: false
      }))

      const allPorts = mockUnconfgiuredPorts
      let result
      try {
        result = await validateEdgeGateway(allPorts, [mockData])
      } catch(err) {
        result = err
      }

      // eslint-disable-next-line max-len
      expect(result).toBe('At least one port must be enabled and configured to WAN or core port to form a cluster.')
    })

    it('when Cluster port with empty lag', async () => {
      const mockData = _.cloneDeep(mockUnconfgiuredPorts)
      mockData[0].portType = EdgePortTypeEnum.CLUSTER
      let result
      try {
        result = await validateEdgeGateway(mockData, noLags)
      } catch(err) {
        result = err
      }

      // eslint-disable-next-line max-len
      expect(result).toBe('At least one port must be enabled and configured to WAN or core port to form a cluster.')
    })

    it('when LAN port with Cluster LAG', async () => {
      const mockData = _.cloneDeep(mockUnconfgiuredPorts)
      mockData[0].portType = EdgePortTypeEnum.LAN
      mockData[0].ipMode = EdgeIpModeEnum.STATIC

      const mockLags = _.cloneDeep(mockLanLags[0])
      mockLags.portType = EdgePortTypeEnum.CLUSTER
      mockLags.ipMode = EdgeIpModeEnum.DHCP
      mockLags.corePortEnabled = false
      mockLags.lagMembers = mockData.slice(1, 3).map((p, idx) => ({
        portId: p.id,
        // only enabled the first member
        portEnabled: idx === 0
      }))

      let result
      try {
        result = await validateEdgeGateway(mockData, [mockLags])
      } catch(err) {
        result = err
      }

      // eslint-disable-next-line max-len
      expect(result).toBe('At least one port must be enabled and configured to WAN or core port to form a cluster.')
    })

    it('when WAN port with LAN core port LAG', async () => {
      const mockData = _.cloneDeep(mockUnconfgiuredPorts)
      mockData[0].portType = EdgePortTypeEnum.WAN
      mockData[0].ipMode = EdgeIpModeEnum.DHCP

      const mockLags = _.cloneDeep(mockLanLags[0])
      mockLags.portType = EdgePortTypeEnum.LAN
      mockLags.ipMode = EdgeIpModeEnum.DHCP
      mockLags.corePortEnabled = true
      mockLags.lagMembers = mockData.slice(1, 3).map((p, idx) => ({
        portId: p.id,
        // only enabled the first member
        portEnabled: idx === 0
      }))

      let result
      try {
        result = await validateEdgeGateway(mockData, [mockLags])
      } catch(err) {
        result = err
      }

      expect(result).toBe('Please configure exactly one gateway.')
    })
  })

  describe('valid case', () => {

    it('a WAN port with empty lag', async () => {
      const mockData = _.cloneDeep(mockUnconfgiuredPorts)
      mockData[0].portType = EdgePortTypeEnum.WAN

      let result
      try {
        result = await validateEdgeGateway(mockData, noLags)
      } catch(err) {
        result = err
      }

      expect(result).toBe(undefined)
    })

    it('when LAN core port with empty lag', async () => {
      const mockData = _.cloneDeep(mockUnconfgiuredPorts)
      mockData[0].portType = EdgePortTypeEnum.LAN
      mockData[0].corePortEnabled = true

      let result
      try {
        result = await validateEdgeGateway(mockData, noLags)
      } catch(err) {
        result = err
      }

      expect(result).toBe(undefined)
    })

    it('when LAN port with WAN LAG', async () => {
      const mockData = _.cloneDeep(mockUnconfgiuredPorts)
      mockData[0].portType = EdgePortTypeEnum.LAN
      mockData[0].ipMode = EdgeIpModeEnum.STATIC

      const mockLags = _.cloneDeep(mockLanLags[0])
      mockLags.portType = EdgePortTypeEnum.WAN
      mockLags.ipMode = EdgeIpModeEnum.STATIC
      mockLags.corePortEnabled = false
      mockLags.lagMembers = mockData.slice(1, 3).map(p => ({
        portId: p.id,
        portEnabled: true
      }))

      let result
      try {
        result = await validateEdgeGateway(mockData, [mockLags])
      } catch(err) {
        result = err
      }

      expect(result).toBe(undefined)
    })

    it('when LAN port with LAN core port LAG', async () => {
      const mockData = _.cloneDeep(mockUnconfgiuredPorts)
      mockData[0].portType = EdgePortTypeEnum.LAN
      mockData[0].ipMode = EdgeIpModeEnum.STATIC

      const mockLags = _.cloneDeep(mockLanLags[0])
      mockLags.portType = EdgePortTypeEnum.LAN
      mockLags.ipMode = EdgeIpModeEnum.DHCP
      mockLags.corePortEnabled = true
      mockLags.lagMembers = mockData.slice(1, 3).map((p, idx) => ({
        portId: p.id,
        // only enabled the first member
        portEnabled: idx === 0
      }))

      let result
      try {
        result = await validateEdgeGateway(mockData, [mockLags])
      } catch(err) {
        result = err
      }

      expect(result).toBe(undefined)
    })
  })
})

describe('isAllPortsLagMember', () => {
  // 3 ports
  const mockUnconfgiuredPorts = _.cloneDeep(mockEdgePortConfig.ports.slice(0,3))
  mockUnconfgiuredPorts.forEach(item => {
    item.enabled = true
    item.portType = EdgePortTypeEnum.UNCONFIGURED
    item.ipMode = EdgeIpModeEnum.DHCP
    item.corePortEnabled = false
  })

  const mockSinglePort = _.cloneDeep(mockUnconfgiuredPorts[0])
  mockSinglePort.portType = EdgePortTypeEnum.LAN
  mockSinglePort.ipMode = EdgeIpModeEnum.STATIC

  const mockLanLags = [{
    id: 0,
    description: 'string',
    lagType: 'LACP',
    lacpMode: 'ACTIVE',
    lacpTimeout: 'SHORT',
    lagMembers: [{
      portId: mockUnconfgiuredPorts[0].id,
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
        portId: mockUnconfgiuredPorts[0].id,
        portEnabled: true
      }]

      expect(isAllPortsLagMember(mockUnconfgiuredPorts, [mockLags])).toBe(false)
    })
  })
})

describe('convertEdgePortsConfigToApiPayload', () => {
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
    const result = convertEdgePortsConfigToApiPayload(edgePort)
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
    const result = convertEdgePortsConfigToApiPayload(edgePort)
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
    const result = convertEdgePortsConfigToApiPayload(formData)
    expect(result.gateway).toBe('')
    expect(result.ip).toBe('')
    expect(result.subnet).toBe('')
  })

  it('should clear gateway for CLUSTER port type', () => {
    const formData = {
      portType: EdgePortTypeEnum.CLUSTER,
      gateway: '1.1.1.1'
    } as EdgePortWithStatus
    const result = convertEdgePortsConfigToApiPayload(formData)
    expect(result.gateway).toBe('')
  })

  it('should disable NAT for LAN port type', () => {
    const formData = {
      portType: EdgePortTypeEnum.LAN,
      natEnabled: true
    } as EdgePortWithStatus
    const result = convertEdgePortsConfigToApiPayload(formData)
    expect(result.natEnabled).toBe(false)
  })

  it('should clear gateway for LAN port type with corePortEnabled false', () => {
    const formData = {
      portType: EdgePortTypeEnum.LAN,
      corePortEnabled: false,
      gateway: '1.1.1.1'
    } as EdgePortWithStatus
    const result = convertEdgePortsConfigToApiPayload(formData)
    expect(result.gateway).toBe('')
  })

  // eslint-disable-next-line max-len
  it('should change IP mode to STATIC for LAN port type with corePortEnabled false and DHCP mode', () => {
    const formData = {
      portType: EdgePortTypeEnum.LAN,
      corePortEnabled: false,
      ipMode: EdgeIpModeEnum.DHCP
    } as EdgePortWithStatus
    const result = convertEdgePortsConfigToApiPayload(formData)
    expect(result.ipMode).toBe(EdgeIpModeEnum.STATIC)
  })

  it('should not enable NAT for non-LAN port type', () => {
    const formData = {
      portType: EdgePortTypeEnum.WAN,
      natEnabled: true
    } as EdgePortWithStatus
    const result = convertEdgePortsConfigToApiPayload(formData)
    expect(result.natEnabled).toBe(true)
  })

  it('should not set corePortEnabled for non-LAN port type', () => {
    const formData = {
      portType: EdgePortTypeEnum.WAN,
      corePortEnabled: true
    } as EdgePortWithStatus
    const result = convertEdgePortsConfigToApiPayload(formData)
    expect(result.corePortEnabled).toBe(true)
  })

  it('should return empty formData', () => {
    const formData = {} as EdgePortWithStatus
    const result = convertEdgePortsConfigToApiPayload(formData)
    expect(result).toEqual({})
  })
})

describe('convertEdgeSubinterfaceToApiPayload', () => {
  it('returns original formData when ipMode is not DHCP', () => {
    const formData = {
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '192.168.1.1',
      subnet: '255.255.255.0'
    } as EdgeSubInterface
    const result = convertEdgeSubinterfaceToApiPayload(formData)
    expect(result).toEqual(formData)
  })

  it('sets ip and subnet to empty strings when ipMode is DHCP', () => {
    const formData = {
      ipMode: EdgeIpModeEnum.DHCP,
      ip: '192.168.1.1',
      subnet: '255.255.255.0'
    } as EdgeSubInterface
    const result = convertEdgeSubinterfaceToApiPayload(formData)
    expect(result.ip).toBe('')
    expect(result.subnet).toBe('')
  })

  it('handles undefined formData', () => {
    const formData: EdgeSubInterface | null | undefined = undefined
    const result = convertEdgeSubinterfaceToApiPayload(formData)
    expect(result).toEqual({})
  })
})