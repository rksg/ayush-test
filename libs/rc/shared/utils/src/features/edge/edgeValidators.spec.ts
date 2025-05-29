/* eslint-disable max-len */
import { cloneDeep } from 'lodash'

import { EdgeIpModeEnum, EdgePortTypeEnum } from '../../models/EdgeEnum'
import { EdgeLag, EdgePort, EdgeStatus }    from '../../types'

import { mockMultiWanPortConfigs } from './__tests__/fixtures/dualWan'
import { mockedEdgeLagList }       from './__tests__/fixtures/lag'
import { mockEdgePortConfig }      from './__tests__/fixtures/portsConfig'
import { MAX_EDGE_DUAL_WAN_PORT }  from './constants'
import {
  edgeSerialNumberValidator,
  lanPortSubnetValidator,
  natPoolSizeValidator,
  poolRangeOverlapValidator,
  validateClusterInterface,
  validateConfiguredSubnetIsConsistent,
  validateEdgeClusterLevelGateway,
  validateEdgeGateway,
  validateSubnetIsConsistent,
  validateUniqueIp,
  interfaceSubnetValidator,
  edgeWanSyncIpModeValidator
} from './edgeValidators'

describe('edgeSerialNumberValidator', () => {

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
})

describe('lanPortSubnetValidator', () => {
  it('Test lanPortSubnetValidator success', async () => {
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
      await lanPortSubnetValidator(currentSubnetInfo, allSubnetWithoutCurrent)
    } catch (ex) {
      mockErrorFn()
    }
    expect(mockErrorFn).not.toBeCalled()
  })

  it('Test lanPortSubnetValidator with empty IP/subnet', async () => {
    const currentSubnetInfo = {
      ip: '1.1.1.1',
      subnetMask: '255.255.255.0'
    }
    const allSubnetWithoutCurrent = [
      {
        ip: '',
        subnetMask: '255.255.255.0'
      },
      {
        ip: '3.3.3.3',
        subnetMask: ''
      },
      {
        ip: '',
        subnetMask: ''
      }
    ]
    const mockErrorFn = jest.fn()
    try {
      await lanPortSubnetValidator(currentSubnetInfo, allSubnetWithoutCurrent)
    } catch (ex) {
      mockErrorFn()
    }
    expect(mockErrorFn).not.toBeCalled()
  })

  it('Test lanPortSubnetValidator failed', async () => {
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
      await lanPortSubnetValidator(currentSubnetInfo, allSubnetWithoutCurrent)
    } catch (ex) {
      mockErrorFn(ex)
    }
    expect(mockErrorFn).toBeCalledWith('The ports have overlapping subnets')
  })
})

describe('validateSubnetIsConsistent', () => {

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
    expect(mockErrorFn).toBeCalledWith('Use IP addresses in the same subnet for cluster interface on all the edges in this cluster.')
  })
})

describe('validateConfiguredSubnetIsConsistent', () => {
  it('Test empty ip and subnet validateConfiguredSubnetIsConsistent successful', async () => {
    const allIps = [
      {
        ip: '',
        subnet: ''
      },
      {
        ip: '2.2.2.2',
        subnet: '255.255.255.0'
      }
    ]
    const mockErrorFn = jest.fn()
    try {
      await validateConfiguredSubnetIsConsistent(allIps, '1')
    } catch (ex) {
      mockErrorFn(ex)
    }
    expect(mockErrorFn).not.toBeCalled()
  })
})

describe('validateUniqueIp', () => {

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

  it('Test validateUniqueIp success for excluded empty ip', async () => {
    const allIps = ['1.1.1.1', '', '']
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
})

describe('validateClusterInterface', () => {
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
})

describe('validateEdgeGateway', () => {
  // 3 ports
  const mockUnconfiguredPorts = cloneDeep(mockEdgePortConfig.ports.slice(0,3))
  mockUnconfiguredPorts.forEach(item => {
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

  describe('Dual WAN not enabled', () => {

    describe('invalid case', () => {
      it('when all ports unconfigured with empty lag', async () => {
        const allPorts = mockUnconfiguredPorts
        let result
        try {
          result = await validateEdgeGateway(allPorts, noLags, false)
        } catch(err) {
          result = err
        }

        // eslint-disable-next-line max-len
        expect(result).toBe('At least one port must be enabled and configured to WAN or core port to form a cluster.')
      })

      it('when LAN port with LAN lag', async () => {
        const mockPorts = cloneDeep(mockUnconfiguredPorts)
        mockPorts.forEach((item, idx) => {
          if (idx === 0) return // lag member
          item.enabled = true
          item.portType = EdgePortTypeEnum.LAN
          item.ipMode = EdgeIpModeEnum.STATIC
          item.corePortEnabled = false
        })

        let result
        try {
          result = await validateEdgeGateway(mockPorts, mockLanLags, false)
        } catch(err) {
          result = err
        }

        // eslint-disable-next-line max-len
        expect(result).toBe('At least one port must be enabled and configured to WAN or core port to form a cluster.')
      })

      it('when all ports are LAN lag member', async () => {
        const mockData = cloneDeep(mockLanLags[0])
        mockData.portType = EdgePortTypeEnum.LAN
        mockData.ipMode = EdgeIpModeEnum.STATIC
        mockData.corePortEnabled = false
        mockData.lagMembers = mockUnconfiguredPorts.map(p => ({
          portId: p.id,
          portEnabled: true
        }))

        const allPorts = mockUnconfiguredPorts
        let result
        try {
          result = await validateEdgeGateway(allPorts, [mockData], false)
        } catch(err) {
          result = err
        }

        // eslint-disable-next-line max-len
        expect(result).toBe('At least one port must be enabled and configured to WAN or core port to form a cluster.')
      })

      it('when all ports are WAN lag member but all disabled', async () => {
        const mockData = cloneDeep(mockLanLags[0])
        mockData.portType = EdgePortTypeEnum.WAN
        mockData.ipMode = EdgeIpModeEnum.DHCP
        mockData.corePortEnabled = false
        mockData.lagMembers = mockUnconfiguredPorts.map(p => ({
          portId: p.id,
          portEnabled: false
        }))

        const allPorts = mockUnconfiguredPorts
        let result
        try {
          result = await validateEdgeGateway(allPorts, [mockData], false)
        } catch(err) {
          result = err
        }

        // eslint-disable-next-line max-len
        expect(result).toBe('At least one port must be enabled and configured to WAN or core port to form a cluster.')
      })

      it('when Cluster port with empty lag', async () => {
        const mockData = cloneDeep(mockUnconfiguredPorts)
        mockData[0].portType = EdgePortTypeEnum.CLUSTER
        let result
        try {
          result = await validateEdgeGateway(mockData, noLags, false)
        } catch(err) {
          result = err
        }

        // eslint-disable-next-line max-len
        expect(result).toBe('At least one port must be enabled and configured to WAN or core port to form a cluster.')
      })

      it('when LAN port with Cluster LAG', async () => {
        const mockData = cloneDeep(mockUnconfiguredPorts)
        mockData[0].portType = EdgePortTypeEnum.LAN
        mockData[0].ipMode = EdgeIpModeEnum.STATIC

        const mockLags = cloneDeep(mockLanLags[0])
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
          result = await validateEdgeGateway(mockData, [mockLags], false)
        } catch(err) {
          result = err
        }

        // eslint-disable-next-line max-len
        expect(result).toBe('At least one port must be enabled and configured to WAN or core port to form a cluster.')
      })

      it('when WAN port with LAN core port LAG', async () => {
        const mockData = cloneDeep(mockUnconfiguredPorts)
        mockData[0].portType = EdgePortTypeEnum.WAN
        mockData[0].ipMode = EdgeIpModeEnum.DHCP

        const mockLags = cloneDeep(mockLanLags[0])
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
          result = await validateEdgeGateway(mockData, [mockLags], false)
        } catch(err) {
          result = err
        }

        expect(result).toBe('Please configure exactly one gateway.')
      })
    })

    describe('valid case', () => {

      it('a WAN port with empty lag', async () => {
        const mockData = cloneDeep(mockUnconfiguredPorts)
        mockData[0].portType = EdgePortTypeEnum.WAN

        let result
        try {
          result = await validateEdgeGateway(mockData, noLags, false)
        } catch(err) {
          result = err
        }

        expect(result).toBe(undefined)
      })

      it('when LAN core port with empty lag', async () => {
        const mockData = cloneDeep(mockUnconfiguredPorts)
        mockData[0].portType = EdgePortTypeEnum.LAN
        mockData[0].corePortEnabled = true

        let result
        try {
          result = await validateEdgeGateway(mockData, noLags, false)
        } catch(err) {
          result = err
        }

        expect(result).toBe(undefined)
      })

      it('when LAN port with WAN LAG', async () => {
        const mockData = cloneDeep(mockUnconfiguredPorts)
        mockData[0].portType = EdgePortTypeEnum.LAN
        mockData[0].ipMode = EdgeIpModeEnum.STATIC

        const mockLags = cloneDeep(mockLanLags[0])
        mockLags.portType = EdgePortTypeEnum.WAN
        mockLags.ipMode = EdgeIpModeEnum.STATIC
        mockLags.corePortEnabled = false
        mockLags.lagMembers = mockData.slice(1, 3).map(p => ({
          portId: p.id,
          portEnabled: true
        }))

        let result
        try {
          result = await validateEdgeGateway(mockData, [mockLags], false)
        } catch(err) {
          result = err
        }

        expect(result).toBe(undefined)
      })

      it('when LAN port with LAN core port LAG', async () => {
        const mockData = cloneDeep(mockUnconfiguredPorts)
        mockData[0].portType = EdgePortTypeEnum.LAN
        mockData[0].ipMode = EdgeIpModeEnum.STATIC

        const mockLags = cloneDeep(mockLanLags[0])
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
          result = await validateEdgeGateway(mockData, [mockLags], false)
        } catch(err) {
          result = err
        }

        expect(result).toBe(undefined)
      })
    })
  })

  describe('Dual WAN enabled', () => {
    describe('invalid case', () => {
      it('when all ports unconfigured with empty lag', async () => {
        const allPorts = mockUnconfiguredPorts
        let result
        try {
          result = await validateEdgeGateway(allPorts, noLags, true)
        } catch(err) {
          result = err
        }

        // eslint-disable-next-line max-len
        expect(result).toBe('At least one port must be enabled and configured to WAN or core port to form a cluster.')
      })

      it('when LAN port with LAN lag', async () => {
        const mockPorts = cloneDeep(mockUnconfiguredPorts)
        mockPorts.forEach((item, idx) => {
          if (idx === 0) return // lag member
          item.enabled = true
          item.portType = EdgePortTypeEnum.LAN
          item.ipMode = EdgeIpModeEnum.STATIC
          item.corePortEnabled = false
        })

        let result
        try {
          result = await validateEdgeGateway(mockPorts, mockLanLags, true)
        } catch(err) {
          result = err
        }

        // eslint-disable-next-line max-len
        expect(result).toBe('At least one port must be enabled and configured to WAN or core port to form a cluster.')
      })

      it('when all ports are LAN lag member', async () => {
        const mockData = cloneDeep(mockLanLags[0])
        mockData.portType = EdgePortTypeEnum.LAN
        mockData.ipMode = EdgeIpModeEnum.STATIC
        mockData.corePortEnabled = false
        mockData.lagMembers = mockUnconfiguredPorts.map(p => ({
          portId: p.id,
          portEnabled: true
        }))

        const allPorts = mockUnconfiguredPorts
        let result
        try {
          result = await validateEdgeGateway(allPorts, [mockData], true)
        } catch(err) {
          result = err
        }

        // eslint-disable-next-line max-len
        expect(result).toBe('At least one port must be enabled and configured to WAN or core port to form a cluster.')
      })

      it('when all ports are WAN lag member but all disabled', async () => {
        const mockData = cloneDeep(mockLanLags[0])
        mockData.portType = EdgePortTypeEnum.WAN
        mockData.ipMode = EdgeIpModeEnum.DHCP
        mockData.corePortEnabled = false
        mockData.lagMembers = mockUnconfiguredPorts.map(p => ({
          portId: p.id,
          portEnabled: false
        }))

        const allPorts = mockUnconfiguredPorts
        let result
        try {
          result = await validateEdgeGateway(allPorts, [mockData], true)
        } catch(err) {
          result = err
        }

        // eslint-disable-next-line max-len
        expect(result).toBe('At least one port must be enabled and configured to WAN or core port to form a cluster.')
      })

      it('when Cluster port with empty lag', async () => {
        const mockData = cloneDeep(mockUnconfiguredPorts)
        mockData[0].portType = EdgePortTypeEnum.CLUSTER
        let result
        try {
          result = await validateEdgeGateway(mockData, noLags, true)
        } catch(err) {
          result = err
        }

        // eslint-disable-next-line max-len
        expect(result).toBe('At least one port must be enabled and configured to WAN or core port to form a cluster.')
      })

      it('when LAN port with Cluster LAG', async () => {
        const mockData = cloneDeep(mockUnconfiguredPorts)
        mockData[0].portType = EdgePortTypeEnum.LAN
        mockData[0].ipMode = EdgeIpModeEnum.STATIC

        const mockLags = cloneDeep(mockLanLags[0])
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
          result = await validateEdgeGateway(mockData, [mockLags], true)
        } catch(err) {
          result = err
        }

        // eslint-disable-next-line max-len
        expect(result).toBe('At least one port must be enabled and configured to WAN or core port to form a cluster.')
      })

      it('when WAN port with LAN core port LAG', async () => {
        const mockData = cloneDeep(mockUnconfiguredPorts)
        mockData[0].portType = EdgePortTypeEnum.WAN
        mockData[0].ipMode = EdgeIpModeEnum.DHCP

        const mockLags = cloneDeep(mockLanLags[0])
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
          result = await validateEdgeGateway(mockData, [mockLags], true)
        } catch(err) {
          result = err
        }

        expect(result).toBe('Please configure exactly one gateway.')
      })

      it('when WAN LAG + LAN core port LAG', async () => {
        const mockData = cloneDeep(mockUnconfiguredPorts)

        const mockLags = cloneDeep(mockLanLags)
        mockLags[0].portType = EdgePortTypeEnum.LAN
        mockLags[0].ipMode = EdgeIpModeEnum.DHCP
        mockLags[0].corePortEnabled = true
        mockLags[0].lagMembers = mockData.slice(1, 3).map((p, idx) => ({
          portId: p.id,
          // only enabled the first member
          portEnabled: idx === 0
        }))

        const mockLag2 = cloneDeep(mockLanLags[0])
        mockLag2.portType = EdgePortTypeEnum.WAN
        mockLag2.ipMode = EdgeIpModeEnum.DHCP
        mockLag2.lagMembers = mockData.slice(0, 1).map((p) => ({
          portId: p.id,
          portEnabled: true
        }))

        let result
        try {
          result = await validateEdgeGateway(mockData, mockLags.concat(mockLag2), true)
        } catch(err) {
          result = err
        }

        expect(result).toBe('Please configure exactly one gateway.')
      })
    })

    describe('valid case', () => {

      it('a WAN port with empty lag', async () => {
        const mockData = cloneDeep(mockUnconfiguredPorts)
        mockData[0].portType = EdgePortTypeEnum.WAN

        let result
        try {
          result = await validateEdgeGateway(mockData, noLags, true)
        } catch(err) {
          result = err
        }

        expect(result).toBe(undefined)
      })

      it('when LAN core port with empty lag', async () => {
        const mockData = cloneDeep(mockUnconfiguredPorts)
        mockData[0].portType = EdgePortTypeEnum.LAN
        mockData[0].corePortEnabled = true

        let result
        try {
          result = await validateEdgeGateway(mockData, noLags, true)
        } catch(err) {
          result = err
        }

        expect(result).toBe(undefined)
      })

      it('when LAN port with WAN LAG', async () => {
        const mockData = cloneDeep(mockUnconfiguredPorts)
        mockData[0].portType = EdgePortTypeEnum.LAN
        mockData[0].ipMode = EdgeIpModeEnum.STATIC

        const mockLags = cloneDeep(mockLanLags[0])
        mockLags.portType = EdgePortTypeEnum.WAN
        mockLags.ipMode = EdgeIpModeEnum.STATIC
        mockLags.corePortEnabled = false
        mockLags.lagMembers = mockData.slice(1, 3).map(p => ({
          portId: p.id,
          portEnabled: true
        }))

        let result
        try {
          result = await validateEdgeGateway(mockData, [mockLags], true)
        } catch(err) {
          result = err
        }

        expect(result).toBe(undefined)
      })

      it('when LAN port with LAN core port LAG', async () => {
        const mockData = cloneDeep(mockUnconfiguredPorts)
        mockData[0].portType = EdgePortTypeEnum.LAN
        mockData[0].ipMode = EdgeIpModeEnum.STATIC

        const mockLags = cloneDeep(mockLanLags[0])
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
          result = await validateEdgeGateway(mockData, [mockLags], true)
        } catch(err) {
          result = err
        }

        expect(result).toBe(undefined)
      })

      it('2 WAN ports with empty lag', async () => {
        const mockData = cloneDeep(mockUnconfiguredPorts)
        mockData[0].portType = EdgePortTypeEnum.WAN
        mockData[1].portType = EdgePortTypeEnum.WAN

        let result
        try {
          result = await validateEdgeGateway(mockData, noLags, true)
        } catch(err) {
          result = err
        }

        expect(result).toBe(undefined)
      })

      it('WAN port + WAN LAG', async () => {
        const mockData = cloneDeep(mockUnconfiguredPorts)
        mockData[0].portType = EdgePortTypeEnum.WAN

        const mockLags = cloneDeep(mockLanLags[0])
        mockLags.portType = EdgePortTypeEnum.WAN
        mockLags.ipMode = EdgeIpModeEnum.STATIC
        mockLags.corePortEnabled = false
        mockLags.lagMembers = mockData.slice(1, 3).map(p => ({
          portId: p.id,
          portEnabled: true
        }))

        let result
        try {
          result = await validateEdgeGateway(mockData, [mockLags], true)
        } catch(err) {
          result = err
        }

        expect(result).toBe(undefined)
      })
    })
  })
})

describe('validateEdgeClusterLevelGateway', () => {
  it('should reject if less than one gateway is configured', async () => {
    const portsData: EdgePort[] = []
    const lagData: EdgeLag[] = []
    const edgeNodes: EdgeStatus[] = [{}, {}]
    const isDualWanEnabled = false

    await expect(validateEdgeClusterLevelGateway(portsData, lagData, edgeNodes, isDualWanEnabled)).rejects.toBe(
      'Each Edge at least one port must be enabled and configured to WAN or core port to form a cluster.'
    )
  })

  it('should resolve if exactly one gateway is configured', async () => {
    const node1Ports = [{ interfaceName: 'port1', enabled: true, portType: EdgePortTypeEnum.WAN }]
    const node2Ports = [{ interfaceName: 'port2', enabled: true, portType: EdgePortTypeEnum.WAN }]

    const portsData: EdgePort[] = [...node1Ports, ...node2Ports]
    const lagData: EdgeLag[] = []
    const edgeNodes: EdgeStatus[] = [{}, {}]
    const isDualWanEnabled = false

    await expect(validateEdgeClusterLevelGateway(portsData, lagData, edgeNodes, isDualWanEnabled)).resolves.toBeUndefined()
  })

  it('should reject if more than one gateway is configured with core port', async () => {
    const node1Ports = [{ interfaceName: 'port1', enabled: true, portType: EdgePortTypeEnum.WAN },
      { interfaceName: 'port2', enabled: true, portType: EdgePortTypeEnum.WAN }]
    const node2Ports = [{ interfaceName: 'port1', enabled: true, portType: EdgePortTypeEnum.WAN },
      { interfaceName: 'port2', enabled: true, portType: EdgePortTypeEnum.WAN }]

    const portsData = [...node1Ports, ...node2Ports] as EdgePort[]
    const lagData: EdgeLag[] = []
    const edgeNodes: EdgeStatus[] = [{}, {}]
    const isDualWanEnabled = false

    await expect(validateEdgeClusterLevelGateway(portsData, lagData, edgeNodes, isDualWanEnabled)).rejects.toBe(
      'Please configure exactly one gateway on each Edge.'
    )
  })

  it('should reject if configured with core port and WAN at same time', async () => {
    const node1Ports = [{ interfaceName: 'port1', enabled: true, portType: EdgePortTypeEnum.WAN },
      { interfaceName: 'port2', enabled: true, portType: EdgePortTypeEnum.LAN, corePortEnabled: true }]
    const node2Ports = [{ interfaceName: 'port1', enabled: true, portType: EdgePortTypeEnum.WAN },
      { interfaceName: 'port2', enabled: true, portType: EdgePortTypeEnum.WAN }]

    const portsData = [...node1Ports, ...node2Ports] as EdgePort[]
    const lagData: EdgeLag[] = []
    const edgeNodes: EdgeStatus[] = [{}, {}]
    const isDualWanEnabled = true

    await expect(validateEdgeClusterLevelGateway(portsData, lagData, edgeNodes, isDualWanEnabled)).rejects.toBe(
      'Please configure exactly one gateway on each Edge.'
    )
  })

  it('should reject if more than MAX_EDGE_DUAL_WAN_PORT gateways are configured without core port and dual WAN enabled', async () => {
    const portsData: EdgePort[] = Array(MAX_EDGE_DUAL_WAN_PORT + 1).fill({
      enabled: true,
      portType: EdgePortTypeEnum.WAN
    })
    const lagData: EdgeLag[] = []
    const edgeNodes: EdgeStatus[] = [{}, {}]
    const isDualWanEnabled = true

    await expect(validateEdgeClusterLevelGateway(portsData, lagData, edgeNodes, isDualWanEnabled)).rejects.toBe(
      `Please configure no more than ${MAX_EDGE_DUAL_WAN_PORT} gateways on each Edge.`
    )
  })

  it('should resolve if edge case: empty portsData, lagData, and edgeNodes', async () => {
    const portsData: EdgePort[] = []
    const lagData: EdgeLag[] = []
    const edgeNodes: EdgeStatus[] = []
    const isDualWanEnabled = false

    await expect(validateEdgeClusterLevelGateway(portsData, lagData, edgeNodes, isDualWanEnabled)).resolves.toBeUndefined()
  })
})

describe('poolRangeOverlapValidator', () => {
  describe('negative test cases', () => {
    it('should return false if ranges are overlapped', async () => {
      const result = poolRangeOverlapValidator([{ startIpAddress: '1.1.1.2', endIpAddress: '1.1.1.30' }, { startIpAddress: '1.1.1.20', endIpAddress: '1.3.1.50' }])
      await expect(result).rejects.toEqual('The selected NAT pool overlaps with other NAT pools')
    })

    it('should return false if ranges are overlapped - case2', async () => {
      const result = poolRangeOverlapValidator([{ startIpAddress: '1.1.1.2', endIpAddress: '1.1.1.30' }, { startIpAddress: '1.1.1.30', endIpAddress: '1.1.1.50' }])
      await expect(result).rejects.toEqual('The selected NAT pool overlaps with other NAT pools')
    })
  })

  describe('positive test cases', () => {
    it('should return false if no ranges are provided', async () => {
      const result = poolRangeOverlapValidator(undefined)
      await expect(result).resolves.toEqual(undefined)
    })

    it('should return false if ranges are empty', async () => {
      const result = poolRangeOverlapValidator([])
      await expect(result).resolves.toEqual(undefined)
    })

    it('should return false if only 1 ranges are provided', async () => {
      const result = poolRangeOverlapValidator([{ startIpAddress: '1.1.1.2', endIpAddress: '1.1.1.30' }])
      await expect(result).resolves.toEqual(undefined)
    })

    it('ranges are not overlapped', async () => {
      const result = poolRangeOverlapValidator([{ startIpAddress: '1.1.1.2', endIpAddress: '1.1.1.30' }, { startIpAddress: '1.3.1.2', endIpAddress: '1.3.1.30' }])
      await expect(result).resolves.toEqual(undefined)
    })

    it('ranges are not overlapped - case2', async () => {
      const result = poolRangeOverlapValidator([{ startIpAddress: '1.1.1.2', endIpAddress: '1.1.1.30' }, { startIpAddress: '1.1.2.2', endIpAddress: '1.1.2.5' }])
      await expect(result).resolves.toEqual(undefined)
    })

    it('ranges are not overlapped - case3', async () => {
      const result = poolRangeOverlapValidator([{ startIpAddress: '1.1.1.2', endIpAddress: '1.1.1.30' }, { startIpAddress: '1.1.1.31', endIpAddress: '1.1.1.40' }])
      await expect(result).resolves.toEqual(undefined)
    })
  })
})

describe('natPoolSizeValidator', () => {
  describe('negative test cases', () => {
    it('should return false if size > 128', async () => {
      const result = natPoolSizeValidator([{ startIpAddress: '1.1.1.2', endIpAddress: '1.1.1.130' }])
      await expect(result).rejects.toEqual('NAT IP address range exceeds maximum size 128')
    })

    it('should return false if multiple ranges total size > 128', async () => {
      const result = natPoolSizeValidator([{ startIpAddress: '1.1.1.2', endIpAddress: '1.1.1.130' }, { startIpAddress: '1.1.1.20', endIpAddress: '1.3.1.50' }])
      await expect(result).rejects.toEqual('NAT IP address range exceeds maximum size 128')
    })
  })

  describe('positive test cases', () => {
    it('should return false if no ranges are provided', async () => {
      const result = natPoolSizeValidator(undefined)
      await expect(result).resolves.toEqual(undefined)
    })

    it('should return false if ranges are empty', async () => {
      const result = natPoolSizeValidator([])
      await expect(result).resolves.toEqual(undefined)
    })

    it('should return false if only 1 ranges are provided', async () => {
      const result = natPoolSizeValidator([{ startIpAddress: '1.1.1.2', endIpAddress: '1.1.1.30' }])
      await expect(result).resolves.toEqual(undefined)
    })

    it('ranges are not overlapped', async () => {
      const result = natPoolSizeValidator([{ startIpAddress: '1.1.1.2', endIpAddress: '1.1.1.30' }, { startIpAddress: '1.3.1.2', endIpAddress: '1.3.1.30' }])
      await expect(result).resolves.toEqual(undefined)
    })

    it('ranges are not overlapped = 128', async () => {
      const result = natPoolSizeValidator([{ startIpAddress: '1.1.1.1', endIpAddress: '1.1.1.30' }, { startIpAddress: '1.1.2.1', endIpAddress: '1.1.2.98' }])
      await expect(result).resolves.toEqual(undefined)
    })
  })
})

describe('interfaceSubnetValidator', () => {
  it('should resolve when current IP mode is not STATIC', async () => {
    const current = { ipMode: EdgeIpModeEnum.DHCP, ip: '1.1.1.1', subnetMask: '255.255.255.0' }
    const allWithoutCurrent = []
    await expect(interfaceSubnetValidator(current, allWithoutCurrent)).resolves.toEqual(undefined)
  })

  it('should resolve when current IP mode is STATIC and allWithoutCurrent is empty', async () => {
    const current = { ipMode: EdgeIpModeEnum.STATIC, ip: '1.1.1.1', subnetMask: '255.255.255.0' }
    const allWithoutCurrent = []
    await expect(interfaceSubnetValidator(current, allWithoutCurrent)).resolves.toEqual(undefined)
  })

  it('should resolve when current IP mode is STATIC and allWithoutCurrent has non-STATIC IP mode', async () => {
    const current = { ipMode: EdgeIpModeEnum.STATIC, ip: '1.1.1.1', subnetMask: '255.255.255.0' }
    const allWithoutCurrent = [{ ipMode: EdgeIpModeEnum.DHCP, ip: '2.2.2.2', subnetMask: '255.255.255.0' }]
    await expect(interfaceSubnetValidator(current, allWithoutCurrent)).resolves.toEqual(undefined)
  })

  it('should resolve when no overlapped', async () => {
    const current = { ipMode: EdgeIpModeEnum.STATIC, ip: '1.1.1.1', subnetMask: '255.255.255.0' }
    const allWithoutCurrent = [{ ipMode: EdgeIpModeEnum.STATIC, ip: '2.2.2.2', subnetMask: '255.255.255.0' }]
    await expect(interfaceSubnetValidator(current, allWithoutCurrent)).resolves.toEqual(undefined)
  })

  it('should reject when having overlapped', async () => {
    const current = { ipMode: EdgeIpModeEnum.STATIC, ip: '1.1.1.1', subnetMask: '255.255.255.0' }
    const allWithoutCurrent = [{ ipMode: EdgeIpModeEnum.STATIC, ip: '1.1.1.2', subnetMask: '255.255.255.0' }]
    await expect(interfaceSubnetValidator(current, allWithoutCurrent)).rejects.toEqual('The ports have overlapping subnets')
  })
})

describe('edgeWanSyncIpModeValidator', () => {
  it('resolves when all WAN interfaces have the same IP mode', async () => {
    const lags: EdgeLag[] = []
    await expect(edgeWanSyncIpModeValidator(mockMultiWanPortConfigs.ports, lags)).resolves.toEqual(undefined)
  })
  it('should ignore LAG members', async () => {
    const ports = cloneDeep(mockMultiWanPortConfigs).ports
    // mock a different IP mode port
    ports[0].ipMode = EdgeIpModeEnum.DHCP

    const lags: EdgeLag[] = cloneDeep(mockedEdgeLagList).content
    lags[0].lagMembers = [{
      portId: ports[0].id,
      portEnabled: true
    }]
    lags[0].ipMode = EdgeIpModeEnum.STATIC
    await expect(edgeWanSyncIpModeValidator(ports, lags)).resolves.toEqual(undefined)
  })
  it('rejects when not all WAN interfaces have the same IP mode', async () => {
    const ports = cloneDeep(mockMultiWanPortConfigs).ports
    ports[0].ipMode = EdgeIpModeEnum.DHCP

    const lags: EdgeLag[] = []
    await expect(edgeWanSyncIpModeValidator(ports, lags)).rejects.toEqual('IP modes must be consistent across all WAN interfaces.')
  })
  it('resolves when there are no WAN interfaces', async () => {
    const ports: EdgePort[] = []
    const lags: EdgeLag[] = []
    await expect(edgeWanSyncIpModeValidator(ports, lags)).resolves.toEqual(undefined)
  })
})