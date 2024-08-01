
import { Priority, TrafficClass } from '@acx-ui/rc/utils'

export const mockedRogueApPoliciesList = {
  fields: [
    'id',
    'name',
    'numOfRules',
    'venueIds'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'cc080e33-26a7-4d34-870f-b7f312fcfccb',
      name: 'My Rogue AP Detection 1',
      numOfRules: 5,
      venueIds: []
    }
  ]
}

export const mockedVlanPoolProfilesQueryData = {
  fields: [
    'wifiNetworkIds',
    'name',
    'id'
  ],
  totalCount: 0,
  page: 1,
  data: []
}

export const mockedClientIsolationQueryData = {
  fields: null,
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'ebb2a23e3e9c4f1c9d4672828cc0e4bc',
      name: 'clientIsolation1',
      description: '',
      clientEntries: [
        'aa:21:92:3e:33:e0',
        'e6:e2:fd:af:54:49'
      ],
      activations: [
        {
          venueId: '770c3794b4fd4bf6bf9e64e8f14db293',
          wifiNetworkId: 'bd789b85931b40fe94d15028dffc6214'
        },
        {
          venueId: '7bf824f4b7f949f2b64e18fb6d05b0f4',
          wifiNetworkId: '936ad54680ba4e5bae59ae1eb817ca24'
        }
      ]
    }
  ]
}

export const mockedEdgeQosBandwidthQueryData = {
  fields: null,
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'ebb2a23e3e9c4f1c9d4672828cc0e4bc',
      name: 'edegQos1',
      description: '',
      trafficClassSettings: [
        {
          trafficClass: TrafficClass.VOICE,
          priority: Priority.HIGH
        },
        {
          venueId: '7bf824f4b7f949f2b64e18fb6d05b0f4',
          wifiNetworkId: '936ad54680ba4e5bae59ae1eb817ca24'
        }
      ]
    }
  ]
}