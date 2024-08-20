import { MtuTypeEnum, SoftGreViewData } from '@acx-ui/rc/utils'

export const mockSoftGreData = {
  id: 'test-policyId',
  name: 'UNKNOWN-SOFTGRE-NAME',
  description: 'mockSoftGreDescription',
  mtuType: MtuTypeEnum.AUTO,
  disassociateClientEnabled: false,
  primaryGatewayAddress: '128.0.0.1',
  secondaryGatewayAddress: '128.0.0.0',
  keepAliveInterval: 10,
  keepAliveRetryTimes: 5
}

export const mockSoftGreDetail = {
  fields: null,
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '0d89c0f5596c4689900fb7f5f53a0859',
      name: 'the ID of tunnel profile, 222',
      description: 'mockSoftGreDetail in __tests__fixture',
      mtuType: MtuTypeEnum.AUTO,
      disassociateClientEnabled: true,
      primaryGatewayAddress: '128.0.0.1',
      secondaryGatewayAddress: '128.0.0.0',
      keepAliveInterval: 100,
      keepAliveRetryTimes: 8,
      activationInformations: [
        {
          venueId: '0e2f68ab79154ffea64aa52c5cc48826',
          networkIds: [
            '9b33509cc0a1464cad9447778a72006f',
            '797a1f499c254260b7a1aedafba524a3',
            'b946294426b8413d819751cb3d320a20'
          ]
        },
        {
          venueId: 'eef3d9913bcc4deea43300804281c2c6',
          networkIds: [
            '9b33509cc0a1464cad9447778a72006f',
            'dca03b33dc354c90b89b1ef68a7f93e1'
          ]
        }
      ]
    }
  ] as SoftGreViewData[]
}

export const mockSoftGreNamesByQuery =
{
  status: 'fulfilled',
  endpointName: 'getTunnelProfileViewDataList',
  requestId: 'il-v5uqZMa7NKkTcgjPZt',
  originalArgs: {
    params: {
      tenantId: 'b338eaa6796443829192a61093e143f9',
      policyId: '0d89c0f5596c4689900fb7f5f53a0859'
    },
    payload: {
      searchString: '5555',
      fields: [
        'name',
        'id'
      ],
      searchTargetFields: [
        'name'
      ],
      filters: {},
      pageSize: 10000
    }
  },
  startedTimeStamp: 1723702740547,
  data: {
    fields: [
      'centralizedForwardingIds',
      'name',
      'networkSegmentationIds',
      'id'
    ],
    totalCount: 2,
    page: 1,
    data: [
      {
        id: '7edd6664c2e84e009e38e5949ee5151f',
        name: '5555',
        personalIdentityNetworkIds: [],
        sdLanIds: []
      },
      {
        id: '14adffb071604b409a76da7d296333c6',
        name: '55555',
        personalIdentityNetworkIds: [],
        sdLanIds: []
      }
    ]
  },
  fulfilledTimeStamp: 1723702740895,
  isUninitialized: false,
  isLoading: false,
  isSuccess: true,
  isError: false
}

export const mockSoftGreTable = {
  data: {
    fields: null,
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
        activationInformations: [
          {
            venueId: '0e2f68ab79154ffea64aa52c5cc48826',
            networkIds: [
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
        activationInformations: [
          {
            venueId: '0e2f68ab79154ffea64aa52c5cc48826',
          }
        ]
      }
    ] as SoftGreViewData[]
  },
  isFetching: false,
  handleTableChange: () => {},
  handleFilterChange: () => {}
}
