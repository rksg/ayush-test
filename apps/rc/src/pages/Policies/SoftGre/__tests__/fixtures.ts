import { MtuTypeEnum, SoftGreViewData  } from '@acx-ui/rc/utils'

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


export const mockSoftGreVenueActivations = [
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

export const mockSoftGreApActivations = [
  {
    venueId: mockedVenueId4,
    portId: 1,
    apSerialNumber: mockedApSerialNnumber3
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
          venueId: mockedVenueId1,
          wifiNetworkIds: [
            '9b33509cc0a1464cad9447778a72006f',
            '797a1f499c254260b7a1aedafba524a3',
            'b946294426b8413d819751cb3d320a20'
          ]
        }
      ],
      venueActivations: mockSoftGreVenueActivations,
      apActivations: mockSoftGreApActivations
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
          venueId: mockedVenueId1
        }
      ]
    },
    {
      id: 'softGreProfileName4-id',
      name: 'softGreProfileName4',
      mtuType: MtuTypeEnum.AUTO,
      disassociateClientEnabled: true,
      primaryGatewayAddress: '128.0.0.3',
      keepAliveInterval: 10,
      keepAliveRetryTimes: 5
    }
  ] as SoftGreViewData[]
}

export const mockSoftGreDetailFromListQueryById = {
  data: {
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

export const mockSoftGreDetail = {
  id: '0d89c0f5596c4689900fb7f5f53a0859',
  name: 'softGreProfileName1',
  description: 'test-description',
  mtuType: MtuTypeEnum.MANUAL,
  mtuSize: 1450,
  disassociateClientEnabled: false,
  primaryGatewayAddress: '128.0.0.1',
  secondaryGatewayAddress: '128.0.0.0',
  keepAliveInterval: 100,
  keepAliveRetryTimes: 8,
  activations: [
    {
      venueId: mockedVenueId1,
      wifiNetworkIds: [
        '9b33509cc0a1464cad9447778a72006f',
        '797a1f499c254260b7a1aedafba524a3',
        'b946294426b8413d819751cb3d320a20'
      ]
    },
    {
      venueId: mockedVenueId2,
      wifiNetworkIds: [
        '9b33509cc0a1464cad9447778a72006f',
        'dca03b33dc354c90b89b1ef68a7f93e1'
      ]
    }
  ],
  venueActivations: mockSoftGreVenueActivations,
  apActivations: mockSoftGreApActivations
}

export const mockedNetworkQueryData = {
  fields: [
    'name',
    'id'
  ],
  totalCount: 2,
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
    }, {
      id: mockedVenueId2,
      name: mockedVenueName2,
      addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA'
    }, {
      id: mockedVenueId3,
      name: mockedVenueName3,
      addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA'
    }, {
      id: mockedVenueId4,
      name: mockedVenueName4,
      addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA'
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
