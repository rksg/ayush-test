import '@testing-library/jest-dom'

import { dataApiURL }                       from '@acx-ui/analytics/services'
import { fakeIncidentApInfraWanthroughput } from '@acx-ui/analytics/utils'
import { store }                            from '@acx-ui/store'
import { mockGraphqlQuery }                 from '@acx-ui/test-utils'

import { impactedApi } from './services'

export const expectedResult = [
  {
    name: 'E06_R750_PLMSide',
    mac: '1C:3A:60:3B:DE:00',
    ports: [
      {
        interface: 'eth1',
        capability: '100/1000/2500Mbps',
        link: 'Up 1000Mbps full',
        eventTime: 1667346300000,
        apGroup: 'East Side'
      }
    ]
  },
  {
    name: 'W06-R650-Chihuahua',
    mac: '20:58:69:3B:CB:70',
    ports: [
      {
        interface: 'eth1',
        capability: '10/100/1000/2500Mbps',
        link: 'Up 1000Mbps full',
        eventTime: 1667346300000,
        apGroup: 'West Side'
      }
    ]
  },
  {
    name: 'E09-R650FACP-aisle',
    mac: '4C:B1:CD:3C:0F:30',
    ports: [
      {
        interface: 'eth1',
        capability: '10/100/1000/2500Mbps',
        link: 'Up 1000Mbps full',
        eventTime: 1664306100000,
        apGroup: 'East Side'
      }
    ]
  },
  {
    name: 'E05-Cube-344-R850',
    mac: '54:EC:2F:09:45:D0',
    ports: [
      {
        interface: 'eth1',
        capability: '100/1000/2500/5000Mbps',
        link: 'Up 2500Mbps full',
        eventTime: 1667346300000,
        apGroup: 'East Side'
      }
    ]
  },
  {
    name: 'E01-R750-FrontLobby',
    mac: '54:EC:2F:10:06:20',
    ports: [
      {
        interface: 'eth1',
        capability: '100/1000/2500Mbps',
        link: 'Up 1000Mbps full',
        eventTime: 1667346300000,
        apGroup: 'East Side'
      }
    ]
  },
  {
    name: 'Out04-CAM04_NorthEastEntrance-T750',
    mac: '54:EC:2F:3F:74:70',
    ports: [
      {
        interface: 'eth0',
        capability: '10/100/1000Mbps',
        link: 'Up 100Mbps full',
        eventTime: 1667346300000,
        apGroup: 'Outdoor'
      },
      {
        interface: 'eth1',
        capability: '10/100/1000/2500Mbps',
        link: 'Up 1000Mbps full',
        eventTime: 1667346300000,
        apGroup: 'Outdoor'
      }
    ]
  },
  {
    name: 'Out03-MainEntranceRight-T350',
    mac: '58:FB:96:16:13:F0',
    ports: [
      {
        interface: 'eth0',
        capability: '10/100/1000Mbps',
        link: 'Up 100Mbps full',
        eventTime: 1667346300000,
        apGroup: 'Outdoor'
      }
    ]
  },
  {
    name: 'Out08_T350C',
    mac: '58:FB:96:26:55:E0',
    ports: [
      {
        interface: 'eth0',
        capability: '10/100/1000Mbps',
        link: 'Up 100Mbps full',
        eventTime: 1667346300000,
        apGroup: 'Outdoor'
      }
    ]
  },
  {
    name: 'E11-R550-Bassett',
    mac: '70:CA:97:01:9D:F0',
    ports: [
      {
        interface: 'eth1',
        capability: '10/100/1000Mbps',
        link: 'Up 100Mbps full',
        eventTime: 1663708500000,
        apGroup: 'East Side'
      }
    ]
  },
  {
    name: 'E08-MensBath-R760',
    mac: '94:B3:4F:1A:B6:E0',
    ports: [
      {
        interface: 'eth1',
        capability: '100/1000/2500/5000/10000Mbps',
        link: 'Up 1000Mbps full',
        eventTime: 1667346300000,
        apGroup: 'East Side'
      }
    ]
  },
  {
    name: 'E10-QA-Lab-R760',
    mac: '94:B3:4F:1A:BC:00',
    ports: [
      {
        interface: 'eth1',
        capability: '100/1000/2500/5000/10000Mbps',
        link: 'Up 1000Mbps full',
        eventTime: 1667346300000,
        apGroup: 'East Side'
      }
    ]
  },
  {
    name: 'W12C-R750-South-Exit',
    mac: '94:BF:C4:14:F6:40',
    ports: [
      {
        interface: 'eth1',
        capability: '100/1000/2500Mbps',
        link: 'Up 1000Mbps full',
        eventTime: 1667346300000,
        apGroup: 'West Side'
      }
    ]
  },
  {
    name: 'E04_Warehouse_R560',
    mac: 'B4:79:C8:3E:DC:B0',
    ports: [
      {
        interface: 'eth1',
        capability: '100/1000/2500/5000Mbps',
        link: 'Up 1000Mbps full',
        eventTime: 1664133300000,
        apGroup: 'East Side'
      }
    ]
  },
  {
    name: 'Out06-DataCenter-T750',
    mac: 'C8:03:F5:02:4E:70',
    ports: [
      {
        interface: 'eth1',
        capability: '10/100/1000/2500Mbps',
        link: 'Up 1000Mbps full',
        eventTime: 1667346300000,
        apGroup: 'Outdoor'
      }
    ]
  },
  {
    name: 'Out07-WarehouseBack-T750',
    mac: 'C8:03:F5:02:53:30',
    ports: [
      {
        interface: 'eth1',
        capability: '10/100/1000/2500Mbps',
        link: 'Up 100Mbps full',
        eventTime: 1667346300000,
        apGroup: 'Outdoor'
      }
    ]
  },
  {
    name: 'E07-R850-East-Coffee2',
    mac: 'C8:03:F5:2C:85:B0',
    ports: [
      {
        interface: 'eth1',
        capability: '100/1000/2500/5000Mbps',
        link: 'Up 2500Mbps full',
        eventTime: 1667346300000,
        apGroup: 'East Side'
      }
    ]
  },
  {
    name: 'E04_Warehouse_R560-Replaced',
    mac: 'C8:84:8C:10:4B:00',
    ports: [
      {
        interface: 'eth1',
        capability: '100/1000/2500/5000Mbps',
        link: 'Up 2500Mbps full',
        eventTime: 1667346300000,
        apGroup: 'East Side'
      }
    ]
  },
  {
    name: 'E02_Bugbash_R560_Main',
    mac: 'C8:84:8C:10:4F:E0',
    ports: [
      {
        interface: 'eth1',
        capability: '100/1000/2500/5000Mbps',
        link: 'Up 2500Mbps full',
        eventTime: 1667346300000,
        apGroup: 'East Side'
      }
    ]
  },
  {
    name: 'Bugbash_R560_Backup',
    mac: 'C8:84:8C:10:D3:30',
    ports: [
      {
        interface: 'eth1',
        capability: '100/1000/2500/5000Mbps',
        link: 'Up 2500Mbps full',
        eventTime: 1666020600000,
        apGroup: 'DENSITY'
      }
    ]
  }
]

describe('useImpactedEntitiesQuery', () => {
  beforeEach(() => {
    store.dispatch(impactedApi.util.resetApiState())
  })

  it('should call api correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', {
      data: { incident: { impactedEntities: expectedResult } }
    })
    const { status, data, error } = await store.dispatch(
      impactedApi.endpoints.impactedEntities.initiate({
        id: fakeIncidentApInfraWanthroughput.id,
        search: '',
        n: 100
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
    expect(error).toBe(undefined)
  })
})
