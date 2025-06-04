import { cloneDeep } from 'lodash'

import { EdgePortTypeEnum } from '../../../../models'

import { mockEdgePortConfig } from './portsConfig'

export const mockDualWanData = {
  mode: 'ACTIVE_BACKUP',
  wanMembers: [
    {
      serialNumber: 'edgeId-1',
      portName: 'port1',
      priority: 1,
      healthCheckEnabled: true,
      linkHealthCheckPolicy: {
        protocol: 'PING',
        targetIpAddresses: [
          '8.8.8.8',
          '10.10.10.10'
        ],
        linkDownCriteria: 'ANY_TARGET_DOWN',
        intervalSeconds: 2,
        maxCountToDown: 7,
        maxCountToUp: 9
      }
    },
    {
      serialNumber: 'edgeId-1',
      portName: 'port2',
      priority: 2,
      healthCheckEnabled: false,
      linkHealthCheckPolicy: {
        protocol: 'PING',
        targetIpAddresses: [
          '2.2.2.2',
          '12.12.12.12'
        ],
        linkDownCriteria: 'ANY_TARGET_DOWN',
        intervalSeconds: 3,
        maxCountToDown: 5,
        maxCountToUp: 6
      }
    }
  ]
}


export const mockMultiWanPortConfigs = cloneDeep(mockEdgePortConfig)
mockMultiWanPortConfigs.ports[2].portType = EdgePortTypeEnum.WAN