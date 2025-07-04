import {
  LbsServerProfileViewModel
} from '@acx-ui/rc/utils'
import { TableResult } from '@acx-ui/utils'

export const mockedTenantId = '__Tenant_ID__'
export const mockedVenueId = '__Venue_ID__'
export const mockedPolicyId1 = '__Policy_ID_1__'
export const mockedPolicyId2 = '__Policy_ID_2__'

export const dummyLbsServerProfileData1 = {
  id: mockedPolicyId1,
  name: 'LBS 1',
  lbsServerVenueName: 'lbsvenue01',
  server: 'abc.venue.ruckuslbs.com:8883'
}

export const dummyLbsServerProfileData2 = {
  id: mockedPolicyId2,
  name: 'LBS 2',
  lbsServerVenueName: 'lbsvenue02',
  server: 'xyz.venue.ruckuslbs.com:8883'
}

export const dummyTableResult: TableResult<LbsServerProfileViewModel> = {
  totalCount: 2,
  page: 1,
  data: [{
    ...dummyLbsServerProfileData1,
    venueIds: ['0c41e2e116514dc698c53dc8c752a1b8']
  }, {
    ...dummyLbsServerProfileData2,
    venueIds: ['0c41e2e116514dc698c53dc8c752a1b8']
  }]
}

export const dummyVenuesResult = {
  totalCount: 1,
  page: 1,
  data: [
    {
      id: mockedVenueId,
      name: 'My-Venue',
      description: 'My-Venue',
      networks: {
        count: 1,
        names: [
          'Open Network 1'
        ],
        vlans: [
          1
        ]
      },
      aggregatedApStatus: {
        '2_00_Operational': 1
      }
    }
  ]
}

export const dummyVenue = {
  id: 'd6062edbdf57451facb33967c2160ccc',
  name: 'Venue 1'
}

export const dummyApList = {
  fields: [
    'name',
    'deviceStatus',
    'apMac',
    'serialNumber',
    'lbsStatus'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      serialNumber: '121749001249',
      name: 'AP-R610',
      venueId: 'd6062edbdf57451facb33967c2160ccc',
      venueName: 'Venue 1',
      apMac: 'D8:38:FC:36:77:F0',
      lbsStatus: {
        managementConnected: true,
        serverConnected: true
      }
    }
  ]
}

export const dummySwitchClientList = {
  fields: [
    'clientMac',
    'switchId',
    'switchName',
    'switchSerialNumber',
    'switchPort'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      clientMac: '34:20:E3:1C:EA:C0',
      switchId: 'c0:c5:20:b2:10:d5',
      switchName: 'L2-R',
      switchPort: '1/1/4',
      switchSerialNumber: 'FMF3250Q06J'
    }
  ]
}