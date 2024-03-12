import { NetworkTypeEnum } from '@acx-ui/rc/utils'

export const mockDeepNetworkList = {
  requestId: '639283c7-7a5e-4ab3-8fdb-6289fe0ed255',
  response: [
    { name: 'Mocked_network', id: 'network_1', type: NetworkTypeEnum.DPSK },
    { name: 'Mocked_network_2', id: 'network_2', type: NetworkTypeEnum.PSK },
    { name: 'Mocked_network_3', id: 'network_3', type: NetworkTypeEnum.OPEN },
    { name: 'Mocked_network_4', id: 'network_4', type: NetworkTypeEnum.CAPTIVEPORTAL }
  ]
}