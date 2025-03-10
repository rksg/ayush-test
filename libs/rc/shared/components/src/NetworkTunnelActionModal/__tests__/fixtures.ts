import {
  EspProposal,
  IkeProposal,
  IpSecAuthEnum,
  IpSecDhGroupEnum,
  IpSecEncryptionAlgorithmEnum,
  IpSecIntegrityAlgorithmEnum,
  IpSecProposalTypeEnum,
  IpSecPseudoRandomFunctionEnum,
  IpsecViewData,
  IpsecWiredActivation,
  IpsecWiredApActivation,
  MtuTypeEnum,
  NetworkTypeEnum,
  SoftGreViewData
} from '@acx-ui/rc/utils'

export const mockDeepNetworkList = {
  requestId: '639283c7-7a5e-4ab3-8fdb-6289fe0ed255',
  response: [
    { name: 'MockedNetwork 1', id: 'network_1', type: NetworkTypeEnum.DPSK },
    { name: 'MockedNetwork 2', id: 'network_2', type: NetworkTypeEnum.PSK },
    { name: 'MockedNetwork 3', id: 'network_3', type: NetworkTypeEnum.OPEN },
    {
      name: 'MockedNetwork 4',
      id: 'network_4',
      type: NetworkTypeEnum.CAPTIVEPORTAL
    }
  ]
}

export const mockVlanPoolList = [
  {
    id: 'ec24eb9fb6f54e42a27a2cab821161d9',
    name: 'mockPool1',
    vlanMembers: ['66-100'],
    wifiNetworkIds: ['network_4'],
    wifiNetworkVenueApGroups: [
      {
        venueId: '0df9555db7174b2cb12747b643c6fca6',
        wifiNetworkId: 'network_4',
        apGroupIds: ['0fe95abe95e04fafaa6254e8fa4eae48'],
        isAllApGroups: true
      }
    ]
  }
]

export const mockSoftGreTable = {
  totalCount: 4,
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
          venueId: 'venueId-1',
          wifiNetworkIds: ['network_1', 'network_2', 'network_3']
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
      keepAliveRetryTimes: 5,
      activations: [
        {
          venueId: 'venueId-1',
          wifiNetworkIds: ['network_4', 'network_5']
        }
      ]
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
          venueId: 'venueId-1',
          wifiNetworkIds: ['network_6']
        }
      ]
    },
    {
      id: 'softGreProfileName4-id',
      name: 'softGreProfileName4',
      mtuType: MtuTypeEnum.MANUAL,
      mtuSize: 1450,
      disassociateClientEnabled: false,
      primaryGatewayAddress: '128.0.0.4',
      secondaryGatewayAddress: '128.0.0.5',
      keepAliveInterval: 100,
      keepAliveRetryTimes: 8,
      activations: [
        {
          venueId: 'venueId-2',
          wifiNetworkIds: ['network_7','network_8']
        }
      ]
    },
    {
      id: 'softGreProfileName5-id',
      name: 'softGreProfileName5',
      mtuType: MtuTypeEnum.MANUAL,
      mtuSize: 1450,
      disassociateClientEnabled: false,
      primaryGatewayAddress: '1.0.0.1',
      secondaryGatewayAddress: '1.0.0.2',
      keepAliveInterval: 100,
      keepAliveRetryTimes: 8,
      activations: [],
      venueActivations: [
        {
          venueId: 'venueId-3',
          apModel: 'R550',
          portId: 1,
          apSerialNumbers: []
        }
      ],
      apActivations: []
    },
    {
      id: 'softGreProfileName6-id',
      name: 'softGreProfileName6',
      mtuType: MtuTypeEnum.MANUAL,
      mtuSize: 1450,
      disassociateClientEnabled: false,
      primaryGatewayAddress: '1.0.0.3',
      keepAliveInterval: 100,
      keepAliveRetryTimes: 8,
      activations: [],
      venueActivations: [],
      apActivations: [{
        venueId: 'venueId-3',
        portId: 1,
        apSerialNumbers: 'ap1'
      }]
    },
    {
      id: 'softGreProfileName7-id',
      name: 'softGreProfileName7',
      mtuType: MtuTypeEnum.MANUAL,
      mtuSize: 1450,
      disassociateClientEnabled: false,
      primaryGatewayAddress: '1.0.0.4',
      keepAliveInterval: 100,
      keepAliveRetryTimes: 8,
      activations: [
        {
          venueId: 'venueId-3',
          wifiNetworkIds: ['network_14']
        }
      ],
      venueActivations: [],
      apActivations: []
    }
  ] as SoftGreViewData[]
}

export const mockedSoftGreScopeVenueMap = {
  'venueId-1': [
    {
      networkIds: ['network_1', 'network_2', 'network_3'],
      profileId: '0d89c0f5596c4689900fb7f5f53a0859',
      profileName: 'softGreProfileName1',
      venueId: 'venueId-1'
    },
    {
      networkIds: ['network_4', 'network_5'],
      profileId: '75aa5131892d44a6a85a623dd3e524ed',
      profileName: 'softGreProfileName2',
      venueId: 'venueId-1'
    },
    {
      networkIds: ['network_6'],
      profileId: 'softGreProfileName3-id',
      profileName: 'softGreProfileName3',
      venueId: 'venueId-1'
    }
  ],
  'venueId-2': [
    {
      networkIds: ['network_7','network_8'],
      profileId: 'softGreProfileName4-id',
      profileName: 'softGreProfileName4',
      venueId: 'venueId-2'
    }
  ],
  'venueId-3': [
    {
      networkIds: ['network_14'],
      profileId: 'softGreProfileName7-id',
      profileName: 'softGreProfileName7',
      venueId: 'venueId-3'
    }
  ]
}

export const mockSoftGreScopeNetworkMap = {
  'venueId-1': [
    {
      networkIds: ['network_1', 'network_2', 'network_3'],
      profileId: '0d89c0f5596c4689900fb7f5f53a0859',
      profileName: 'softGreProfileName1',
      venueId: 'venueId-1'
    }
  ]
}

export const mockIpSecTable = {
  data: {
    fields: null,
    totalCount: 3,
    page: 1,
    data: [
      {
        id: '0d89c0f5596c4689900fb7f5f53a0859',
        name: 'ipsecProfileName1',
        serverAddress: '128.0.0.1',
        authenticationType: IpSecAuthEnum.PSK,
        preSharedKey: 'admin!234',
        ikeProposalType: IpSecProposalTypeEnum.DEFAULT,
        ikeProposals: [] as IkeProposal[],
        espProposalType: IpSecProposalTypeEnum.DEFAULT,
        espProposals: [] as EspProposal[],
        activations: [{
          venueId: '0e2f68ab79154ffea64aa52c5cc48826',
          wifiNetworkIds: [
            '9b33509cc0a1464cad9447778a72006f',
            '797a1f499c254260b7a1aedafba524a3',
            'b946294426b8413d819751cb3d320a20'
          ]
        }],
        venueActivations: [] as IpsecWiredActivation[],
        apActivations: [] as IpsecWiredApActivation[]
      },
      {
        id: '75aa5131892d44a6a85a623dd3e524ed',
        name: 'ipsecProfileName2',
        serverAddress: '128.0.0.3',
        authenticationType: IpSecAuthEnum.PSK,
        preSharedKey: 'admin!234',
        ikeProposalType: IpSecProposalTypeEnum.DEFAULT,
        ikeProposals: [] as IkeProposal[],
        espProposalType: IpSecProposalTypeEnum.SPECIFIC,
        espProposals: [{
          encAlg: IpSecEncryptionAlgorithmEnum.AES128,
          authAlg: IpSecIntegrityAlgorithmEnum.AEX_XBC,
          dhGroup: IpSecDhGroupEnum.MODP2048
        }],
        activations: [{
          venueId: '0e2f68ab79154ffea64aa52c5cc48826',
          wifiNetworkIds: [
            '9b33509cc0a1464cad9447778a72006fe'
          ]
        }],
        venueActivations: [] as IpsecWiredActivation[],
        apActivations: [] as IpsecWiredApActivation[]
      },
      {
        id: 'ipsecProfileName3-id',
        name: 'ipsecProfileName3',
        serverAddress: '128.0.0.5',
        authenticationType: IpSecAuthEnum.PSK,
        preSharedKey: 'admin!234',
        ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
        ikeProposals: [{
          encAlg: IpSecEncryptionAlgorithmEnum.AES128,
          authAlg: IpSecIntegrityAlgorithmEnum.AEX_XBC,
          prfAlg: IpSecPseudoRandomFunctionEnum.PRF_SHA256,
          dhGroup: IpSecDhGroupEnum.MODP2048
        },
        {
          encAlg: IpSecEncryptionAlgorithmEnum.AES128,
          authAlg: IpSecIntegrityAlgorithmEnum.MD5,
          prfAlg: IpSecPseudoRandomFunctionEnum.PRF_SHA256,
          dhGroup: IpSecDhGroupEnum.MODP768
        }],
        espProposalType: IpSecProposalTypeEnum.DEFAULT,
        espProposals: [] as EspProposal[],
        activations: [{
          venueId: '0e2f68ab79154ffea64aa52c5cc48826',
          wifiNetworkIds: [
            '9b33509cc0a1464cad9447778a72006fe'
          ]
        }],
        venueActivations: [] as IpsecWiredActivation[],
        apActivations: [] as IpsecWiredApActivation[]
      }
    ] as IpsecViewData[]
  },
  isFetching: false,
  handleTableChange: () => {},
  handleFilterChange: () => {}
}
