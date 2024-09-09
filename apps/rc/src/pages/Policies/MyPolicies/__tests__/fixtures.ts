
import { EdgeQosTrafficClass, EdgeQosTrafficClassPriority, MtuTypeEnum, SoftGreViewData } from '@acx-ui/rc/utils'

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
          trafficClass: EdgeQosTrafficClass.VOICE,
          priority: EdgeQosTrafficClassPriority.HIGH
        },
        {
          venueId: '7bf824f4b7f949f2b64e18fb6d05b0f4',
          wifiNetworkId: '936ad54680ba4e5bae59ae1eb817ca24'
        }
      ]
    }
  ]
}

export const mockSoftGreTable = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '0d89c0f5596c4689900fb7f5f53a0859',
      name: 'softGreProfileName1',
      mtuType: MtuTypeEnum.MANUAL,
      mtuSize: 1450,
      disassociateClientEnabled: false,
      primaryGatewayAddress: '128.0.0.1',
      secondaryGatewayAddress: '128.0.0.0',
      keepAliveInterval: 100,
      keepAliveRetryTimes: 8,
      activations: [
        {
          venueId: '0e2f68ab79154ffea64aa52c5cc48826',
          wifiNetworkIds: [
            '9b33509cc0a1464cad9447778a72006f',
            '797a1f499c254260b7a1aedafba524a3',
            'b946294426b8413d819751cb3d320a20'
          ]
        }
      ]
    },
    {
      id: '75aa5131892d44a6a85a623dd3e524ed',
      name: 'softGreProfileName2',
      mtuType: MtuTypeEnum.AUTO,
      disassociateClientEnabled: true,
      primaryGatewayAddress: '128.0.0.3',
      keepAliveInterval: 10,
      keepAliveRetryTimes: 5
    },
    {
      id: 'softGreProfileName3-id',
      name: 'softGreProfileName3',
      mtuType: MtuTypeEnum.MANUAL,
      mtuSize: 1450,
      disassociateClientEnabled: false,
      primaryGatewayAddress: '128.0.0.4',
      secondaryGatewayAddress: '128.0.0.5',
      keepAliveInterval: 100,
      keepAliveRetryTimes: 8,
      activations: [
        {
          venueId: '0e2f68ab79154ffea64aa52c5cc48826'
        }
      ]
    }
  ] as SoftGreViewData[]
}
