import { getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'

export const mockedTenantId = '__Tenant_ID__'

export const mockedPolicyId = '__Policy_ID__'

// eslint-disable-next-line max-len
export const createPath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.CREATE })
// eslint-disable-next-line max-len
export const editPath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.EDIT })

export const mockedClientIsolationList = [
  {
    id: '123456789',
    name: 'Fake Client Isolation',
    description: 'Here is the description',
    allowlist: [
      {
        mac: 'AA:BB:CC:DD:EE:11',
        description: 'Client 1',
        ipAddress: '10.206.1.1'
      },
      {
        mac: 'AA:BB:CC:DD:EE:22',
        description: 'Client 2',
        ipAddress: '10.206.200.1'
      },
      {
        mac: 'AA:BB:CC:DD:EE:33',
        description: 'Client 3',
        ipAddress: '10.206.103.33'
      }
    ]
  },
  {
    id: '987654321',
    name: 'Fake Client Isolation 2',
    description: 'Here is the description 2',
    allowlist: [
      {
        mac: '22:BB:CC:DD:EE:11',
        description: 'Client 2-1',
        ipAddress: '10.206.1.12'
      },
      {
        mac: '22:BB:CC:DD:EE:22',
        description: 'Client 2-2',
        ipAddress: '10.206.200.13'
      }
    ]
  },
  {
    id: '555555555',
    name: 'Fake Client Isolation 3',
    description: 'Here is the description 3',
    allowlist: [
      {
        mac: 'AA:BB:CC:DD:EE:11',
        description: 'Client 3-1',
        ipAddress: '10.206.1.1'
      }
    ]
  }
]

export const clientList = [{
  apMac: '28:B3:71:28:78:50',
  apName: 'UI team ONLY',
  apSerialNumber: '422039000230',
  bssid: '28:b3:71:a8:78:51',
  clientMac: '24:41:8c:c3:16:df',
  framesDropped: 0,
  healthCheckStatus: 'Good',
  hostname: 'LP-XXXXX',
  ipAddress: '10.206.1.93',
  networkId: '423c3673e74f44e69c0f3b35cd579ecc',
  networkName: 'NMS-app6-WLAN-QA',
  networkSsid: 'NMS-app6-WLAN-QA',
  noiseFloor_dBm: -96,
  osType: 'Windows',
  receiveSignalStrength_dBm: -32,
  receivedBytes: 104098725,
  receivedPackets: 344641,
  rfChannel: 140,
  snr_dB: 64,
  timeConnectedMs: 1669263032,
  transmittedBytes: 22551474,
  transmittedPackets: 87872,
  username: '24418cc316df',
  venueId: '87c982325ef148a2b7cefe652384d3ca',
  venueName: 'UI-TEST-VENUE',
  vlan: 1,
  wifiCallingClient: false
}]
