import { MtuTypeEnum, SoftGreViewData } from '@acx-ui/rc/utils'

export const mockSoftGreTable = {
  data: {
    fields: null,
    totalCount: 3,
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
  },
  isFetching: false,
  handleTableChange: () => {},
  handleFilterChange: () => {}
}
