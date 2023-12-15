import { EdgeSdLanViewData, NetworkTypeEnum } from '@acx-ui/rc/utils'

export const mockedEdgeSdLan = {
  id: 'mocked-sd-lan-1',
  name: 'mocked_SD-LAN_1',
  tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
  venueId: 'a307d7077410456f8f1a4fc41d861567',
  venueName: 'mocked-Venue-1',
  edgeId: '96B968BD2C76ED11EEA8E4B2E81F537A94',
  edgeName: 'mocked-vSE-b490',
  tunnelProfileId: 'aa3ecf6f283448d5bb8c0ce86790b843',
  tunnelProfileName: 'mockedTunnel',
  networkIds: ['network_1', 'network_3'],
  networkInfos: [{
    networkId: 'network_1',
    networkName: 'MockedNetwork 1'
  }, {
    networkId: 'network_3',
    networkName: 'MockedNetwork 3'
  }],
  corePortMac: 'c2:58:00:ae:63:f2',
  edgeAlarmSummary: {
    edgeId: 'mocked-edge-1',
    severitySummary: {
      critical: 1
    },
    totalCount: 1
  },
  serviceVersion: '1.0.0.100'
} as EdgeSdLanViewData

export const mockNetworkSaveData = {
  fields: ['venueId', 'networkId'],
  totalCount: 3,
  page: 1,
  data: [
    { networkId: 'network_1', venueId: 'venue_00002' },
    { networkId: 'network_2', venueId: 'venue_00002' },
    { networkId: 'network_3', venueId: 'venue_00005' }
  ]
}

export const mockDeepNetworkList = {
  requestId: '639283c7-7a5e-4ab3-8fdb-6289fe0ed255',
  response: [
    { name: 'MockedNetwork 1', id: 'network_1', type: NetworkTypeEnum.DPSK },
    { name: 'MockedNetwork 2', id: 'network_2', type: NetworkTypeEnum.PSK },
    { name: 'MockedNetwork 3', id: 'network_3', type: NetworkTypeEnum.OPEN }
  ]
}