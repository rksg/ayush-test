import { emptyDualWanLinkSettings }                         from '@acx-ui/edge/components'
import { EdgePortTypeEnum, EdgePort, EdgeMultiWanModeEnum } from '@acx-ui/rc/utils'

import { getDisplayPortString, getDisplayWanRole, getDualWanDataFromClusterWizard } from './utils'

describe('getDisplayPortString', () => {
  it('should return the correct string when given valid inputs', () => {
    expect(getDisplayPortString('Node1', 'Port1')).toBe('Node1 / Port1')
    expect(getDisplayPortString('Node2', 'Port2')).toBe('Node2 / Port2')
  })

  it('should return an empty string when given empty inputs', () => {
    expect(getDisplayPortString('', '')).toBe('')
  })
})

describe('getDisplayWanRole', () => {
  it('should return an empty string for priority 0', () => {
    expect(getDisplayWanRole(0)).toBe('')
  })

  it('should return "Active" for priority 1', () => {
    expect(getDisplayWanRole(1)).toBe('Active')
  })

  it('should return "Backup" for priority other than 0 or 1', () => {
    expect(getDisplayWanRole(2)).toBe('Backup')
    expect(getDisplayWanRole(3)).toBe('Backup')
    expect(getDisplayWanRole(-1)).toBe('Backup')
  })
})
/* eslint-disable max-len */
describe('getDualWanDataFromClusterWizard', () => {
  it('should return undefined for single-node case with less than 2 WAN interfaces', () => {
    const formData = {
      portSettings: {
        node1: {
          port1: [{ interfaceName: 'port1' }] as EdgePort[]
        }
      },
      lagSettings: [{ lags: [] }]
    }
    expect(getDualWanDataFromClusterWizard(formData)).toStrictEqual(emptyDualWanLinkSettings)
  })

  it('should return undefined for multi-node case', () => {
    const formData = {
      portSettings: {
        node1: {
          port1: [{ interfaceName: 'port1' }] as EdgePort[]
        },
        node2: {
          port2: [{ interfaceName: 'port2' }] as EdgePort[]
        }
      },
      lagSettings: [{ lags: [] }]
    }
    expect(getDualWanDataFromClusterWizard(formData)).toStrictEqual(emptyDualWanLinkSettings)
  })

  it('single-node case with 2 or more WAN interfaces and no existing WAN members', () => {
    const formData = {
      portSettings: {
        node1: {
          port1: [{ interfaceName: 'port1', portType: EdgePortTypeEnum.WAN, enabled: true }] as EdgePort[],
          port2: [{ interfaceName: 'port2', portType: EdgePortTypeEnum.WAN, enabled: true }] as EdgePort[]
        }
      },
      lagSettings: [{ lags: [] }]
    }

    const expected = {
      mode: EdgeMultiWanModeEnum.ACTIVE_BACKUP,
      wanMembers: [
        { serialNumber: 'node1', portName: 'port1', priority: 1, healthCheckEnabled: false, linkHealthCheckPolicy: undefined },
        { serialNumber: 'node1', portName: 'port2', priority: 2, healthCheckEnabled: false, linkHealthCheckPolicy: undefined }
      ]
    }
    expect(getDualWanDataFromClusterWizard(formData)).toEqual(expected)
  })

  it('single-node case with 2 WAN interfaces and having existing WAN members', () => {
    const formData = {
      portSettings: {
        node1: {
          port1: [{ interfaceName: 'port1', portType: EdgePortTypeEnum.WAN, enabled: true }] as EdgePort[],
          port2: [{ interfaceName: 'port2', portType: EdgePortTypeEnum.WAN, enabled: true }] as EdgePort[]
        }
      },
      lagSettings: [{ lags: [] }],
      multiWanSettings: {
        wanMembers: [
          { serialNumber: 'node1', portName: 'port1', priority: 1, healthCheckEnabled: true, linkHealthCheckPolicy: { protocol: 'PING' } },
          { serialNumber: 'node1', portName: 'port2', priority: 2, healthCheckEnabled: false, linkHealthCheckPolicy: undefined }
        ]
      }
    }
    const expected = {
      mode: EdgeMultiWanModeEnum.ACTIVE_BACKUP,
      wanMembers: [
        { serialNumber: 'node1', portName: 'port1', priority: 1, healthCheckEnabled: true, linkHealthCheckPolicy: { protocol: 'PING' } },
        { serialNumber: 'node1', portName: 'port2', priority: 2, healthCheckEnabled: false, linkHealthCheckPolicy: undefined }
      ]
    }
    expect(getDualWanDataFromClusterWizard(formData)).toEqual(expected)
  })

  it('single-node case with 2 WAN interfaces and having existing WAN members (missing priority)', () => {
    const formData = {
      portSettings: {
        node1: {
          port1: [{ interfaceName: 'port1', portType: EdgePortTypeEnum.WAN, enabled: true }] as EdgePort[],
          port2: [{ interfaceName: 'port2', portType: EdgePortTypeEnum.WAN, enabled: true }] as EdgePort[]
        }
      },
      lagSettings: [{ lags: [] }],
      multiWanSettings: {
        wanMembers: [
          { serialNumber: 'node1', portName: 'port1', healthCheckEnabled: true, linkHealthCheckPolicy: { protocol: 'PING' } },
          { serialNumber: 'node1', portName: 'port2', healthCheckEnabled: false, linkHealthCheckPolicy: undefined }
        ]
      }
    }
    const expected = {
      mode: EdgeMultiWanModeEnum.ACTIVE_BACKUP,
      wanMembers: [
        { serialNumber: 'node1', portName: 'port1', priority: 1, healthCheckEnabled: true, linkHealthCheckPolicy: { protocol: 'PING' } },
        { serialNumber: 'node1', portName: 'port2', priority: 2, healthCheckEnabled: false, linkHealthCheckPolicy: undefined }
      ]
    }
    expect(getDualWanDataFromClusterWizard(formData)).toEqual(expected)
  })

  it('single-node case with 2 WAN members => 3 WAN members', () => {
    const formData = {
      portSettings: {
        node1: {
          port1: [{ interfaceName: 'port1', portType: EdgePortTypeEnum.WAN, enabled: true }] as EdgePort[],
          port2: [{ interfaceName: 'port2', portType: EdgePortTypeEnum.WAN, enabled: true }] as EdgePort[],
          port3: [{ interfaceName: 'port3', id: 'port3_id', portType: EdgePortTypeEnum.UNCONFIGURED, enabled: true }] as EdgePort[]
        }
      },
      lagSettings: [{
        serialNumber: 'node1',
        lags: [{
          id: 1, portType: EdgePortTypeEnum.WAN, lagEnabled: true, lagMembers: [{ portId: 'port3_id', portEnabled: true }]
        }] as EdgeLag[]
      }],
      multiWanSettings: {
        wanMembers: [
          { serialNumber: 'node1', portName: 'port1', priority: 1, healthCheckEnabled: true, linkHealthCheckPolicy: { protocol: 'PING' } },
          { serialNumber: 'node1', portName: 'port2', priority: 2, healthCheckEnabled: false, linkHealthCheckPolicy: undefined }
        ]
      }
    }
    const expected = {
      mode: EdgeMultiWanModeEnum.ACTIVE_BACKUP,
      wanMembers: [
        { serialNumber: 'node1', portName: 'port1', priority: 1, healthCheckEnabled: true, linkHealthCheckPolicy: { protocol: 'PING' } },
        { serialNumber: 'node1', portName: 'port2', priority: 2, healthCheckEnabled: false, linkHealthCheckPolicy: undefined },
        { serialNumber: 'node1', portName: 'lag1', priority: 3, healthCheckEnabled: false, linkHealthCheckPolicy: undefined }
      ]
    }
    expect(getDualWanDataFromClusterWizard(formData)).toEqual(expected)
  })

  it('single-node case with 2 WAN members => 3 WAN members (priority changed)', () => {
    const formData = {
      portSettings: {
        node1: {
          port1: [{ interfaceName: 'port1', portType: EdgePortTypeEnum.WAN, enabled: true }] as EdgePort[],
          port2: [{ interfaceName: 'port2', portType: EdgePortTypeEnum.WAN, enabled: true }] as EdgePort[],
          port3: [{ interfaceName: 'port3', id: 'port3_id', portType: EdgePortTypeEnum.UNCONFIGURED, enabled: true }] as EdgePort[]
        }
      },
      lagSettings: [{
        serialNumber: 'node1',
        lags: [{
          id: 1, portType: EdgePortTypeEnum.WAN, lagEnabled: true, lagMembers: [{ portId: 'port3_id', portEnabled: true }]
        }] as EdgeLag[]
      }],
      multiWanSettings: {
        wanMembers: [
          { serialNumber: 'node1', portName: 'port2', priority: 1, healthCheckEnabled: false, linkHealthCheckPolicy: undefined },
          { serialNumber: 'node1', portName: 'port1', priority: 2, healthCheckEnabled: true, linkHealthCheckPolicy: { protocol: 'PING' } }
        ]
      }
    }
    const expected = {
      mode: EdgeMultiWanModeEnum.ACTIVE_BACKUP,
      wanMembers: [
        { serialNumber: 'node1', portName: 'port2', priority: 1, healthCheckEnabled: false, linkHealthCheckPolicy: undefined },
        { serialNumber: 'node1', portName: 'port1', priority: 2, healthCheckEnabled: true, linkHealthCheckPolicy: { protocol: 'PING' } },
        { serialNumber: 'node1', portName: 'lag1', priority: 3, healthCheckEnabled: false, linkHealthCheckPolicy: undefined }
      ]
    }
    expect(getDualWanDataFromClusterWizard(formData)).toEqual(expected)
  })

  it('single-node case with 3 WAN members => 2 WAN members', () => {
    const formData = {
      portSettings: {
        node1: {
          port1: [{ interfaceName: 'port1', portType: EdgePortTypeEnum.WAN, enabled: true }] as EdgePort[],
          port2: [{ interfaceName: 'port2', portType: EdgePortTypeEnum.WAN, enabled: true }] as EdgePort[]
        }
      },
      lagSettings: [{ lags: [] }],
      multiWanSettings: {
        wanMembers: [
          { serialNumber: 'node1', portName: 'port1', priority: 1, healthCheckEnabled: true, linkHealthCheckPolicy: { protocol: 'PING' } },
          { serialNumber: 'node1', portName: 'lag1', priority: 2, healthCheckEnabled: false, linkHealthCheckPolicy: undefined },
          { serialNumber: 'node1', portName: 'port2', priority: 3, healthCheckEnabled: false, linkHealthCheckPolicy: undefined }
        ]
      }
    }
    const expected = {
      mode: EdgeMultiWanModeEnum.ACTIVE_BACKUP,
      wanMembers: [
        { serialNumber: 'node1', portName: 'port1', priority: 1, healthCheckEnabled: true, linkHealthCheckPolicy: { protocol: 'PING' } },
        { serialNumber: 'node1', portName: 'port2', priority: 2, healthCheckEnabled: false, linkHealthCheckPolicy: undefined }
      ]
    }
    expect(getDualWanDataFromClusterWizard(formData)).toEqual(expected)
  })
})