import { EdgeSdLanViewData } from '../../../../types/services/edgeSdLanService'

export const mockedEdgeSdLanDataList = [{
  id: 'mocked-sd-lan-1',
  name: 'Mocked_SDLAN_1',
  tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
  venueId: 'a307d7077410456f8f1a4fc41d861567',
  venueName: 'Mocked-Venue-1',
  edgeId: '96B968BD2C76ED11EEA8E4B2E81F537A94',
  edgeName: 'vSE-b490',
  tunnelProfileId: 'aa3ecf6f283448d5bb8c0ce86790b843',
  tunnelProfileName: 'Mocked_tunnel',
  networkIds: ['8e22159cfe264ac18d591ea492fbc05a'],
  networkInfos: [{
    networkId: '8e22159cfe264ac18d591ea492fbc05a',
    networkName: 'Mocked_network'
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

}] as EdgeSdLanViewData[]

export const mockedCorePortLostEdgeSdLanDataList = [{
  id: 'mocked-cf-2',
  edgeId: '96BD19BB3B5CE111EE80500E35957BEDC3',
  corePortMac: ''
}] as EdgeSdLanViewData[]