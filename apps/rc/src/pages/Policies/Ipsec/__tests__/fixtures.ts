import { EspProposal, IkeProposal, IpsecActivation, IpSecAdvancedOptionEnum, IpSecAuthEnum, IpSecDhGroupEnum, IpSecEncryptionAlgorithmEnum, IpSecFailoverModeEnum, IpSecIntegrityAlgorithmEnum, IpSecProposalTypeEnum, IpSecPseudoRandomFunctionEnum, IpSecRekeyTimeUnitEnum, IpsecViewData  } from '@acx-ui/rc/utils'

export const mockedVenueId1 = '__Venue_ID1__'
export const mockedVenueId2 = '__Venue_ID2__'
export const mockedVenueId3 = '__Venue_ID3__'
export const mockedVenueId4 = '__Venue_ID4__'
export const mockedVenueName1 = 'mockedVenueName1'
export const mockedVenueName2 = 'mockedVenueName2'
export const mockedVenueName3 = 'mockedVenueName3'
export const mockedVenueName4 = 'mockedVenueName4'
export const mockedApSerialNnumber1 = '__AP_SERIAL_NUMBER_1__'
export const mockedApSerialNnumber2 = '__AP_SERIAL_NUMBER_2__'
export const mockedApSerialNnumber3 = '__AP_SERIAL_NUMBER_3__'
export const mockedApName1 = '__AP_NAME_1__'
export const mockedApName2 = '__AP_NAME_2__'
export const mockedApName3 = '__AP_NAME_3__'
export const mockedApId1 = '__AP_ID_1__'
export const mockedApId2 = '__AP_ID_2__'
export const mockedApId3 = '__AP_ID_3__'


export const mockIpSecVenueActivations = [
  {
    venueId: mockedVenueId1,
    apModel: 'R770',
    portId: 1,
    apSerialNumbers: [
      mockedApSerialNnumber1,
      mockedApSerialNnumber2
    ]
  }, {
    venueId: mockedVenueId3,
    apModel: 'R770',
    portId: 2,
    apSerialNumbers: [
      mockedApSerialNnumber2
    ]
  }
]

export const mockIpSecApActivations = [
  {
    venueId: mockedVenueId4,
    portId: 1,
    apSerialNumber: mockedApSerialNnumber3
  }
]

export const mockIpSecTable = {
  totalCount: 4,
  page: 1,
  data: [
    {
      id: '67d5c0eed90f4ed0b664a3f7b13604d8',
      name: 'ipsecProfileName1',
      serverAddress: '1.2.3.4',
      authenticationType: IpSecAuthEnum.PSK,
      ikeProposalType: IpSecProposalTypeEnum.DEFAULT,
      ikeProposals: [] as IkeProposal[],
      espProposalType: IpSecProposalTypeEnum.DEFAULT,
      espProposals: [] as EspProposal[],
      // activations: [] as IpsecActivation[]
      activations: [
        {
          venueId: mockedVenueId1,
          wifiNetworkIds: [
            '9b33509cc0a1464cad9447778a72006f',
            '797a1f499c254260b7a1aedafba524a3',
            'b946294426b8413d819751cb3d320a20'
          ]
        }
      ],
      venueActivations: mockIpSecVenueActivations,
      apActivations: mockIpSecApActivations
    },
    {
      id: '1fd70d0dc56443e7b9e3f6e0ec75c153',
      name: 'ipsecProfileName2',
      serverAddress: '1.2.3.4',
      authenticationType: IpSecAuthEnum.PSK,
      ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
      ikeProposals: [
        {
          encAlg: IpSecEncryptionAlgorithmEnum.THREE_DES,
          authAlg: IpSecIntegrityAlgorithmEnum.MD5,
          prfAlg: IpSecPseudoRandomFunctionEnum.PRF_MD5,
          dhGroup: IpSecDhGroupEnum.MODP768
        }
      ],
      espProposalType: IpSecProposalTypeEnum.DEFAULT,
      espProposals: [] as EspProposal[],
      activations: [] as IpsecActivation[]
    },
    {
      id: '07146f7c5b2c41f2a6227ed902a1cdac',
      name: 'ipsecProfileName3',
      serverAddress: '1.2.3.4',
      authenticationType: IpSecAuthEnum.PSK,
      ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
      ikeProposals: [
        {
          encAlg: IpSecEncryptionAlgorithmEnum.THREE_DES,
          authAlg: IpSecIntegrityAlgorithmEnum.MD5,
          prfAlg: IpSecPseudoRandomFunctionEnum.PRF_MD5,
          dhGroup: IpSecDhGroupEnum.MODP768
        },
        {
          encAlg: IpSecEncryptionAlgorithmEnum.AES128,
          authAlg: IpSecIntegrityAlgorithmEnum.AEX_XBC,
          prfAlg: IpSecPseudoRandomFunctionEnum.PRF_SHA256,
          dhGroup: IpSecDhGroupEnum.MODP2048
        }
      ],
      espProposalType: IpSecProposalTypeEnum.DEFAULT,
      espProposals: [] as EspProposal[],
      activations: [] as IpsecActivation[]
    },
    {
      id: '380043b71ed7411d8e95a41af65d0f50',
      name: 'ipsecProfileName4',
      serverAddress: '7.7.7.7',
      authenticationType: IpSecAuthEnum.PSK,
      ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
      ikeProposals: [
        {
          encAlg: IpSecEncryptionAlgorithmEnum.THREE_DES,
          authAlg: IpSecIntegrityAlgorithmEnum.MD5,
          prfAlg: IpSecPseudoRandomFunctionEnum.PRF_MD5,
          dhGroup: IpSecDhGroupEnum.MODP768
        },
        {
          encAlg: IpSecEncryptionAlgorithmEnum.AES128,
          authAlg: IpSecIntegrityAlgorithmEnum.AEX_XBC,
          prfAlg: IpSecPseudoRandomFunctionEnum.PRF_SHA256,
          dhGroup: IpSecDhGroupEnum.MODP2048
        }
      ],
      espProposalType: IpSecProposalTypeEnum.DEFAULT,
      espProposals: [] as EspProposal[],
      activations: [] as IpsecActivation[]
    }
  ] as IpsecViewData[]
}

export const mockIpSecDetailFromListQueryById = {
  data: {
    totalCount: 2,
    page: 1,
    data: [
      {
        id: '380043b71ed7411d8e95a41af65d0f50',
        name: 'ipsecProfileName4',
        serverAddress: '7.7.7.7',
        authenticationType: IpSecAuthEnum.PSK,
        ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
        ikeProposals: [
          {
            encAlg: IpSecEncryptionAlgorithmEnum.THREE_DES,
            authAlg: IpSecIntegrityAlgorithmEnum.MD5,
            prfAlg: IpSecPseudoRandomFunctionEnum.PRF_MD5,
            dhGroup: IpSecDhGroupEnum.MODP768
          },
          {
            encAlg: IpSecEncryptionAlgorithmEnum.AES128,
            authAlg: IpSecIntegrityAlgorithmEnum.AEX_XBC,
            prfAlg: IpSecPseudoRandomFunctionEnum.PRF_SHA256,
            dhGroup: IpSecDhGroupEnum.MODP2048
          }
        ],
        espProposalType: IpSecProposalTypeEnum.DEFAULT,
        espProposals: [] as EspProposal[],
        activations: [
          {
            venueId: mockedVenueId1,
            wifiNetworkIds: [
              '9b33509cc0a1464cad9447778a72006f',
              '797a1f499c254260b7a1aedafba524a3',
              'b946294426b8413d819751cb3d320a20'
            ]
          }
        ]
      }
    ]
  }
}

export const mockIpSecDetail = {
  id: '380043b71ed7411d8e95a41af65d0f50',
  name: 'ipsecProfileName4',
  serverAddress: '7.7.7.7',
  authType: IpSecAuthEnum.PSK,
  preSharedKey: 'admin!234',
  ikeSecurityAssociation: {
    ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
    ikeProposals: [
      {
        encAlg: IpSecEncryptionAlgorithmEnum.THREE_DES,
        authAlg: IpSecIntegrityAlgorithmEnum.MD5,
        prfAlg: IpSecPseudoRandomFunctionEnum.PRF_MD5,
        dhGroup: IpSecDhGroupEnum.MODP768
      },
      {
        encAlg: IpSecEncryptionAlgorithmEnum.AES128,
        authAlg: IpSecIntegrityAlgorithmEnum.AEX_XBC,
        prfAlg: IpSecPseudoRandomFunctionEnum.PRF_SHA256,
        dhGroup: IpSecDhGroupEnum.MODP2048
      }
    ]
  },
  espSecurityAssociation: {
    espProposalType: IpSecProposalTypeEnum.DEFAULT
  },
  advancedOption: {
    dhcpOpt43Subcode: 7,
    retryLimit: 5,
    replayWindow: 32,
    ipcompEnable: IpSecAdvancedOptionEnum.ENABLED,
    enforceNatt: IpSecAdvancedOptionEnum.ENABLED,
    dpdDelay: 0,
    keepAliveInterval: 20,
    failoverRetryPeriod: 0,
    failoverRetryInterval: 1,
    failoverMode: IpSecFailoverModeEnum.NON_REVERTIVE,
    failoverPrimaryCheckInterval: 1
  },
  ikeRekeyTime: 4,
  ikeRekeyTimeUnit: IpSecRekeyTimeUnitEnum.HOUR,
  espRekeyTime: 1,
  espRekeyTimeUnit: IpSecRekeyTimeUnitEnum.HOUR,
  activations: [
    {
      venueId: mockedVenueId1,
      wifiNetworkIds: [
        '9b33509cc0a1464cad9447778a72006f',
        '797a1f499c254260b7a1aedafba524a3',
        'b946294426b8413d819751cb3d320a20'
      ]
    }
  ]
}

export const mockedNetworkQueryData = {
  fields: [
    'name',
    'id'
  ],
  totalCount: 3,
  page: 1,
  data: [
    {
      name: 'WISPR_ON_ACC_2',
      id: 'dca03b33dc354c90b89b1ef68a7f93e1'
    },
    {
      name: 'WISPR_ADD_ON_2',
      id: '797a1f499c254260b7a1aedafba524a3'
    },
    {
      name: '==dev-app8-wipsr',
      id: '9b33509cc0a1464cad9447778a72006f'
    },
    {
      name: 'joe-aaa-1',
      id: 'b946294426b8413d819751cb3d320a20'
    }
  ]
}

export const mockedVenueQueryData = {
  fields: [
    'name',
    'id',
    'addressLine'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: mockedVenueId1,
      name: mockedVenueName1,
      addressLine: '198 Main St,New York,United States'
    }
  ]
}

export const mockedApQueryData = {
  fields: [
    'name',
    'id',
    'serialNumber'
  ],
  totalCount: 3,
  page: 1,
  data: [
    {
      id: mockedApId1,
      name: mockedApName1,
      serialNumber: mockedApSerialNnumber1
    },
    {
      id: mockedApId2,
      name: mockedApName2,
      serialNumber: mockedApSerialNnumber2
    },
    {
      id: mockedApId3,
      name: mockedApName3,
      serialNumber: mockedApSerialNnumber3
    }
  ]
}
