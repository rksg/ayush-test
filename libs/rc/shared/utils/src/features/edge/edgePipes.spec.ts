/* eslint-disable max-len */
import { cloneDeep } from 'lodash'

import {
  EdgeIpModeEnum,
  EdgePortTypeEnum,
  EdgeLagLacpModeEnum,
  EdgeLagTimeoutEnum,
  EdgeLagTypeEnum
} from '../../models/EdgeEnum'
import { EdgeLag, EdgePort, SubInterface } from '../../types'

import { doEdgeNetworkInterfacesDryRun, isSubInterfaceLagMember } from './edgePipes'

// Mock the edgeUtils module
jest.mock('./edgeUtils', () => ({
  convertEdgeNetworkIfConfigToApiPayload: jest.fn((config) => config),
  edgePhysicalPortInitialConfigs: {
    portType: 'UNCONFIGURED',
    ipMode: 'DHCP',
    ip: '',
    subnet: '',
    gateway: '',
    enabled: true,
    natEnabled: true,
    corePortEnabled: false,
    accessPortEnabled: false,
    natPools: []
  }
}))

describe('edgePipes', () => {
  describe('isSubInterfaceLagMember', () => {
    it('should return true when subInterface interfaceName is in lagMemberInterfaceNames', () => {
      const subInterface: SubInterface = {
        id: 'test-id',
        vlan: 1,
        portType: EdgePortTypeEnum.LAN,
        ipMode: EdgeIpModeEnum.STATIC,
        interfaceName: 'port1.100'
      }
      const lagMemberInterfaceNames = ['port1', 'port2']

      const result = isSubInterfaceLagMember(subInterface, lagMemberInterfaceNames)

      expect(result).toBe(true)
    })

    it('should return false when subInterface interfaceName is not in lagMemberInterfaceNames', () => {
      const subInterface: SubInterface = {
        id: 'test-id',
        vlan: 1,
        portType: EdgePortTypeEnum.LAN,
        ipMode: EdgeIpModeEnum.STATIC,
        interfaceName: 'port3.100'
      }
      const lagMemberInterfaceNames = ['port1', 'port2']

      const result = isSubInterfaceLagMember(subInterface, lagMemberInterfaceNames)

      expect(result).toBe(false)
    })

    it('should return false when subInterface interfaceName is undefined', () => {
      const subInterface: SubInterface = {
        id: 'test-id',
        vlan: 1,
        portType: EdgePortTypeEnum.LAN,
        ipMode: EdgeIpModeEnum.STATIC
      }
      const lagMemberInterfaceNames = ['port1', 'port2']

      const result = isSubInterfaceLagMember(subInterface, lagMemberInterfaceNames)

      expect(result).toBe(false)
    })

    it('should return false when subInterface interfaceName is empty string', () => {
      const subInterface: SubInterface = {
        id: 'test-id',
        vlan: 1,
        portType: EdgePortTypeEnum.LAN,
        ipMode: EdgeIpModeEnum.STATIC,
        interfaceName: ''
      }
      const lagMemberInterfaceNames = ['port1', 'port2']

      const result = isSubInterfaceLagMember(subInterface, lagMemberInterfaceNames)

      expect(result).toBe(false)
    })

    it('should handle interfaceName without dot separator', () => {
      const subInterface: SubInterface = {
        id: 'test-id',
        vlan: 1,
        portType: EdgePortTypeEnum.LAN,
        ipMode: EdgeIpModeEnum.STATIC,
        interfaceName: 'port1'
      }
      const lagMemberInterfaceNames = ['port1', 'port2']

      const result = isSubInterfaceLagMember(subInterface, lagMemberInterfaceNames)

      expect(result).toBe(true)
    })

    it('should handle empty lagMemberInterfaceNames array', () => {
      const subInterface: SubInterface = {
        id: 'test-id',
        vlan: 1,
        portType: EdgePortTypeEnum.LAN,
        ipMode: EdgeIpModeEnum.STATIC,
        interfaceName: 'port1.100'
      }
      const lagMemberInterfaceNames: string[] = []

      const result = isSubInterfaceLagMember(subInterface, lagMemberInterfaceNames)

      expect(result).toBe(false)
    })
  })

  describe('doEdgeNetworkInterfacesDryRun', () => {
    const mockLags: EdgeLag[] = [
      {
        id: 1,
        description: 'Test LAG',
        lagType: EdgeLagTypeEnum.STATIC,
        lacpMode: EdgeLagLacpModeEnum.ACTIVE,
        lacpTimeout: EdgeLagTimeoutEnum.LONG,
        lagEnabled: true,
        portType: EdgePortTypeEnum.LAN,
        ipMode: EdgeIpModeEnum.STATIC,
        ip: '192.168.1.1',
        subnet: '255.255.255.0',
        corePortEnabled: true,
        accessPortEnabled: false,
        natEnabled: false,
        natPools: [],
        lagMembers: [
          { portId: 'port1', portEnabled: true },
          { portId: 'port2', portEnabled: true }
        ]
      }
    ]

    const mockPorts: EdgePort[] = [
      {
        id: 'port1',
        portType: EdgePortTypeEnum.LAN,
        name: 'Port 1',
        mac: '00:11:22:33:44:55',
        enabled: true,
        ipMode: EdgeIpModeEnum.STATIC,
        ip: '192.168.1.10',
        subnet: '255.255.255.0',
        gateway: '192.168.1.1',
        natEnabled: false,
        natPools: [],
        corePortEnabled: false,
        accessPortEnabled: false,
        interfaceName: 'port1',
        maxSpeedCapa: 1000
      },
      {
        id: 'port2',
        portType: EdgePortTypeEnum.LAN,
        name: 'Port 2',
        mac: '00:11:22:33:44:56',
        enabled: true,
        ipMode: EdgeIpModeEnum.STATIC,
        ip: '192.168.1.11',
        subnet: '255.255.255.0',
        gateway: '192.168.1.1',
        natEnabled: false,
        natPools: [],
        corePortEnabled: false,
        accessPortEnabled: false,
        interfaceName: 'port2',
        maxSpeedCapa: 1000
      },
      {
        id: 'port3',
        portType: EdgePortTypeEnum.WAN,
        name: 'Port 3',
        mac: '00:11:22:33:44:57',
        enabled: true,
        ipMode: EdgeIpModeEnum.DHCP,
        ip: '',
        subnet: '',
        gateway: '',
        natEnabled: true,
        natPools: [],
        corePortEnabled: false,
        accessPortEnabled: false,
        interfaceName: 'port3',
        maxSpeedCapa: 1000
      }
    ]

    const mockSubInterfaces: SubInterface[] = [
      {
        id: 'sub1',
        vlan: 100,
        portType: EdgePortTypeEnum.LAN,
        ipMode: EdgeIpModeEnum.STATIC,
        ip: '192.168.100.1',
        subnet: '255.255.255.0',
        interfaceName: 'port1.100'
      },
      {
        id: 'sub2',
        vlan: 200,
        portType: EdgePortTypeEnum.LAN,
        ipMode: EdgeIpModeEnum.STATIC,
        ip: '192.168.200.1',
        subnet: '255.255.255.0',
        interfaceName: 'port2.200'
      },
      {
        id: 'sub3',
        vlan: 300,
        portType: EdgePortTypeEnum.LAN,
        ipMode: EdgeIpModeEnum.STATIC,
        ip: '192.168.300.1',
        subnet: '255.255.255.0',
        interfaceName: 'port3.300'
      }
    ]

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should process lags, ports, and subInterfaces with all parameters provided', () => {
      const isEdgeCoreAccessSeparationReady = true

      const result = doEdgeNetworkInterfacesDryRun(
        mockLags,
        mockPorts,
        mockSubInterfaces,
        isEdgeCoreAccessSeparationReady
      )

      expect(result.lags).toHaveLength(1)
      expect(result.ports).toHaveLength(3)
      expect(result.subInterfaces).toHaveLength(1) // Only port3.300 should remain

      // Check that lag member ports are reset
      const port1 = result.ports.find(p => p.id === 'port1')
      const port2 = result.ports.find(p => p.id === 'port2')
      expect(port1?.portType).toBe(EdgePortTypeEnum.UNCONFIGURED)
      expect(port2?.portType).toBe(EdgePortTypeEnum.UNCONFIGURED)

      // Check that lag member sub-interfaces are removed
      const remainingSubInterfaces = result.subInterfaces.map(s => s.interfaceName)
      expect(remainingSubInterfaces).not.toContain('port1.100')
      expect(remainingSubInterfaces).not.toContain('port2.200')
      expect(remainingSubInterfaces).toContain('port3.300')
    })

    it('should handle undefined lags parameter', () => {
      const isEdgeCoreAccessSeparationReady = false

      const result = doEdgeNetworkInterfacesDryRun(
        undefined,
        mockPorts,
        mockSubInterfaces,
        isEdgeCoreAccessSeparationReady
      )

      expect(result.lags).toHaveLength(0)
      expect(result.ports).toHaveLength(3)
      expect(result.subInterfaces).toHaveLength(3) // All sub-interfaces should remain
    })

    it('should handle undefined subInterfaces parameter', () => {
      const isEdgeCoreAccessSeparationReady = true

      const result = doEdgeNetworkInterfacesDryRun(
        mockLags,
        mockPorts,
        undefined,
        isEdgeCoreAccessSeparationReady
      )

      expect(result.lags).toHaveLength(1)
      expect(result.ports).toHaveLength(3)
      expect(result.subInterfaces).toHaveLength(0)
    })

    it('should handle empty lags array', () => {
      const isEdgeCoreAccessSeparationReady = false

      const result = doEdgeNetworkInterfacesDryRun(
        [],
        mockPorts,
        mockSubInterfaces,
        isEdgeCoreAccessSeparationReady
      )

      expect(result.lags).toHaveLength(0)
      expect(result.ports).toHaveLength(3)
      expect(result.subInterfaces).toHaveLength(3)
    })

    it('should handle empty ports array', () => {
      const isEdgeCoreAccessSeparationReady = true

      const result = doEdgeNetworkInterfacesDryRun(
        mockLags,
        [],
        mockSubInterfaces,
        isEdgeCoreAccessSeparationReady
      )

      expect(result.lags).toHaveLength(1)
      expect(result.ports).toHaveLength(0)
      expect(result.subInterfaces).toHaveLength(3)
    })

    it('should handle empty subInterfaces array', () => {
      const isEdgeCoreAccessSeparationReady = false

      const result = doEdgeNetworkInterfacesDryRun(
        mockLags,
        mockPorts,
        [],
        isEdgeCoreAccessSeparationReady
      )

      expect(result.lags).toHaveLength(1)
      expect(result.ports).toHaveLength(3)
      expect(result.subInterfaces).toHaveLength(0)
    })

    it('should handle lag with no lagMembers', () => {
      const lagsWithoutMembers: EdgeLag[] = [
        {
          id: 1,
          description: 'Test LAG',
          lagType: EdgeLagTypeEnum.STATIC,
          lacpMode: EdgeLagLacpModeEnum.ACTIVE,
          lacpTimeout: EdgeLagTimeoutEnum.LONG,
          lagEnabled: true,
          portType: EdgePortTypeEnum.LAN,
          ipMode: EdgeIpModeEnum.STATIC,
          ip: '192.168.1.1',
          subnet: '255.255.255.0',
          corePortEnabled: true,
          accessPortEnabled: false,
          natEnabled: false,
          natPools: [],
          lagMembers: []
        }
      ]

      const isEdgeCoreAccessSeparationReady = true

      const result = doEdgeNetworkInterfacesDryRun(
        lagsWithoutMembers,
        mockPorts,
        mockSubInterfaces,
        isEdgeCoreAccessSeparationReady
      )

      expect(result.lags).toHaveLength(1)
      expect(result.ports).toHaveLength(3)
      expect(result.subInterfaces).toHaveLength(3) // All sub-interfaces should remain
    })

    it('should handle lag with undefined lagMembers', () => {
      const lagsWithUndefinedMembers: EdgeLag[] = [
        {
          id: 1,
          description: 'Test LAG',
          lagType: EdgeLagTypeEnum.STATIC,
          lacpMode: EdgeLagLacpModeEnum.ACTIVE,
          lacpTimeout: EdgeLagTimeoutEnum.LONG,
          lagEnabled: true,
          portType: EdgePortTypeEnum.LAN,
          ipMode: EdgeIpModeEnum.STATIC,
          ip: '192.168.1.1',
          subnet: '255.255.255.0',
          corePortEnabled: true,
          accessPortEnabled: false,
          natEnabled: false,
          natPools: [],
          lagMembers: undefined as unknown as EdgeLag['lagMembers']
        }
      ]

      const isEdgeCoreAccessSeparationReady = false

      const result = doEdgeNetworkInterfacesDryRun(
        lagsWithUndefinedMembers,
        mockPorts,
        mockSubInterfaces,
        isEdgeCoreAccessSeparationReady
      )

      expect(result.lags).toHaveLength(1)
      expect(result.ports).toHaveLength(3)
      expect(result.subInterfaces).toHaveLength(3)
    })

    it('should handle lag member with non-existent port ID', () => {
      const lagsWithNonExistentPort: EdgeLag[] = [
        {
          id: 1,
          description: 'Test LAG',
          lagType: EdgeLagTypeEnum.STATIC,
          lacpMode: EdgeLagLacpModeEnum.ACTIVE,
          lacpTimeout: EdgeLagTimeoutEnum.LONG,
          lagEnabled: true,
          portType: EdgePortTypeEnum.LAN,
          ipMode: EdgeIpModeEnum.STATIC,
          ip: '192.168.1.1',
          subnet: '255.255.255.0',
          corePortEnabled: true,
          accessPortEnabled: false,
          natEnabled: false,
          natPools: [],
          lagMembers: [
            { portId: 'non-existent-port', portEnabled: true }
          ]
        }
      ]

      const isEdgeCoreAccessSeparationReady = true

      const result = doEdgeNetworkInterfacesDryRun(
        lagsWithNonExistentPort,
        mockPorts,
        mockSubInterfaces,
        isEdgeCoreAccessSeparationReady
      )

      expect(result.lags).toHaveLength(1)
      expect(result.ports).toHaveLength(3)
      expect(result.subInterfaces).toHaveLength(3) // No sub-interfaces should be removed
    })

    it('should handle sub-interfaces with undefined interfaceName', () => {
      const subInterfacesWithUndefinedName: SubInterface[] = [
        {
          id: 'sub1',
          vlan: 100,
          portType: EdgePortTypeEnum.LAN,
          ipMode: EdgeIpModeEnum.STATIC,
          ip: '192.168.100.1',
          subnet: '255.255.255.0'
        }
      ]

      const isEdgeCoreAccessSeparationReady = false

      const result = doEdgeNetworkInterfacesDryRun(
        mockLags,
        mockPorts,
        subInterfacesWithUndefinedName,
        isEdgeCoreAccessSeparationReady
      )

      expect(result.lags).toHaveLength(1)
      expect(result.ports).toHaveLength(3)
      expect(result.subInterfaces).toHaveLength(1) // Should remain as interfaceName is undefined
    })

    it('should handle sub-interfaces with empty interfaceName', () => {
      const subInterfacesWithEmptyName: SubInterface[] = [
        {
          id: 'sub1',
          vlan: 100,
          portType: EdgePortTypeEnum.LAN,
          ipMode: EdgeIpModeEnum.STATIC,
          ip: '192.168.100.1',
          subnet: '255.255.255.0',
          interfaceName: ''
        }
      ]

      const isEdgeCoreAccessSeparationReady = true

      const result = doEdgeNetworkInterfacesDryRun(
        mockLags,
        mockPorts,
        subInterfacesWithEmptyName,
        isEdgeCoreAccessSeparationReady
      )

      expect(result.lags).toHaveLength(1)
      expect(result.ports).toHaveLength(3)
      expect(result.subInterfaces).toHaveLength(1) // Should remain as interfaceName is empty
    })

    it('should handle multiple lags with overlapping member ports', () => {
      const multipleLags: EdgeLag[] = [
        {
          id: 1,
          description: 'Test LAG 1',
          lagType: EdgeLagTypeEnum.STATIC,
          lacpMode: EdgeLagLacpModeEnum.ACTIVE,
          lacpTimeout: EdgeLagTimeoutEnum.LONG,
          lagEnabled: true,
          portType: EdgePortTypeEnum.LAN,
          ipMode: EdgeIpModeEnum.STATIC,
          ip: '192.168.1.1',
          subnet: '255.255.255.0',
          corePortEnabled: true,
          accessPortEnabled: false,
          natEnabled: false,
          natPools: [],
          lagMembers: [
            { portId: 'port1', portEnabled: true }
          ]
        },
        {
          id: 2,
          description: 'Test LAG 2',
          lagType: EdgeLagTypeEnum.STATIC,
          lacpMode: EdgeLagLacpModeEnum.ACTIVE,
          lacpTimeout: EdgeLagTimeoutEnum.LONG,
          lagEnabled: true,
          portType: EdgePortTypeEnum.LAN,
          ipMode: EdgeIpModeEnum.STATIC,
          ip: '192.168.2.1',
          subnet: '255.255.255.0',
          corePortEnabled: false,
          accessPortEnabled: true,
          natEnabled: false,
          natPools: [],
          lagMembers: [
            { portId: 'port2', portEnabled: true }
          ]
        }
      ]

      const isEdgeCoreAccessSeparationReady = true

      const result = doEdgeNetworkInterfacesDryRun(
        multipleLags,
        mockPorts,
        mockSubInterfaces,
        isEdgeCoreAccessSeparationReady
      )

      expect(result.lags).toHaveLength(2)
      expect(result.ports).toHaveLength(3)
      expect(result.subInterfaces).toHaveLength(1) // Only port3.300 should remain

      // Check that both lag member ports are reset
      const port1 = result.ports.find(p => p.id === 'port1')
      const port2 = result.ports.find(p => p.id === 'port2')
      expect(port1?.portType).toBe(EdgePortTypeEnum.UNCONFIGURED)
      expect(port2?.portType).toBe(EdgePortTypeEnum.UNCONFIGURED)
    })

    it('should call convertEdgeNetworkIfConfigToApiPayload for each lag, port, and subInterface', () => {
      const { convertEdgeNetworkIfConfigToApiPayload } = require('./edgeUtils')

      const isEdgeCoreAccessSeparationReady = true

      doEdgeNetworkInterfacesDryRun(
        mockLags,
        mockPorts,
        mockSubInterfaces,
        isEdgeCoreAccessSeparationReady
      )

      // Should be called once for each lag, port, and subInterface
      expect(convertEdgeNetworkIfConfigToApiPayload).toHaveBeenCalledTimes(5) // 1 lag + 3 ports + 1 subInterfaces
    })

    it('should handle isEdgeCoreAccessSeparationReady = false', () => {
      const isEdgeCoreAccessSeparationReady = false

      const result = doEdgeNetworkInterfacesDryRun(
        mockLags,
        mockPorts,
        mockSubInterfaces,
        isEdgeCoreAccessSeparationReady
      )

      expect(result.lags).toHaveLength(1)
      expect(result.ports).toHaveLength(3)
      expect(result.subInterfaces).toHaveLength(1)
    })

    it('should not modify original input arrays', () => {
      const isEdgeCoreAccessSeparationReady = true
      const originalLags = cloneDeep(mockLags)
      const originalPorts = cloneDeep(mockPorts)
      const originalSubInterfaces = cloneDeep(mockSubInterfaces)

      doEdgeNetworkInterfacesDryRun(
        mockLags,
        mockPorts,
        mockSubInterfaces,
        isEdgeCoreAccessSeparationReady
      )

      expect(mockLags).toEqual(originalLags)
      expect(mockPorts).toEqual(originalPorts)
      expect(mockSubInterfaces).toEqual(originalSubInterfaces)
    })
  })
})