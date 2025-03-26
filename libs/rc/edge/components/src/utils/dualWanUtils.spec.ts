import { cloneDeep } from 'lodash'

import {
  ClusterNetworkMultiWanSettings, ClusterNetworkSettings,
  EdgeIpModeEnum, EdgeMultiWanModeEnum, EdgePortTypeEnum,
  EdgePortConfigFixtures
} from '@acx-ui/rc/utils'

import { getDualWanDefaultDataFromApiData } from './dualWanUtils'
const { mockEdgePortConfig } = EdgePortConfigFixtures

describe('getDualWanDefaultDataFromApiData', () => {
  it('should return undefined if apiData is undefined', () => {
    expect(getDualWanDefaultDataFromApiData(undefined)).toBeUndefined()
  })

  it('should return undefined if apiData.portSettings is empty', () => {
    const apiData: ClusterNetworkSettings = {
      multiWanSettings: undefined,
      portSettings: [],
      lagSettings: []
    }
    expect(getDualWanDefaultDataFromApiData(apiData)).toBeUndefined()
  })

  it('should return undefined if cluster is multi-nodes', () => {
    const apiData: ClusterNetworkSettings = {
      multiWanSettings: undefined,
      portSettings: [
        { serialNumber: 'serial1', ports: [] },
        { serialNumber: 'serial2', ports: [] }
      ],
      lagSettings: [{ serialNumber: 'serial1', lags: [] }]
    }
    expect(getDualWanDefaultDataFromApiData(apiData)).toBeUndefined()
  })

  // eslint-disable-next-line max-len
  it('should return apiData.multiWanSettings if apiData.multiWanSettings.mode is already ACTIVE_BACKUP', () => {
    const apiData: ClusterNetworkSettings = {
      multiWanSettings: { mode: EdgeMultiWanModeEnum.ACTIVE_BACKUP, wanMembers: [] },
      portSettings: [{ serialNumber: 'serial1', ports: [] }],
      lagSettings: [{ serialNumber: 'serial1', lags: [] }]
    }
    expect(getDualWanDefaultDataFromApiData(apiData)).toStrictEqual(apiData.multiWanSettings)
  })

  // eslint-disable-next-line max-len
  it('should return default multiWanSettings with mode ACTIVE_BACKUP and wanMembers if apiData has >1 WAN ports and apiData.multiWanSettings.mode is not ACTIVE_BACKUP', () => {
    const twoWanPorts = cloneDeep(mockEdgePortConfig.ports)
    twoWanPorts[1].portType = EdgePortTypeEnum.WAN
    twoWanPorts[1].ipMode = EdgeIpModeEnum.DHCP
    twoWanPorts[1].ip = ''
    twoWanPorts[1].subnet = ''
    twoWanPorts[1].gateway = ''

    const apiData: ClusterNetworkSettings = {
      multiWanSettings: undefined,
      portSettings: [{ serialNumber: 'serial1', ports: twoWanPorts }],
      lagSettings: [{ serialNumber: 'serial1', lags: [] }]
    }

    const expected: ClusterNetworkMultiWanSettings = {
      mode: EdgeMultiWanModeEnum.ACTIVE_BACKUP,
      wanMembers: [
        {
          serialNumber: 'serial1',
          portName: 'port1',
          priority: 1,
          healthCheckEnabled: false,
          linkHealthCheckPolicy: undefined
        },
        {
          serialNumber: 'serial1',
          portName: 'port2',
          priority: 2,
          healthCheckEnabled: false,
          linkHealthCheckPolicy: undefined
        }
      ]
    }
    expect(getDualWanDefaultDataFromApiData(apiData)).toEqual(expected)
  })
})