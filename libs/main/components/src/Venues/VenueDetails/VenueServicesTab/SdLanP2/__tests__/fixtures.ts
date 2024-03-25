import { Network, NetworkTypeEnum } from '@acx-ui/rc/utils'

export const mockNetworkViewmodelList = [
  { name: 'MockedNetwork 1', id: 'network_1', nwSubType: NetworkTypeEnum.DPSK },
  { name: 'MockedNetwork 2', id: 'network_2', nwSubType: NetworkTypeEnum.PSK },
  { name: 'MockedNetwork 3', id: 'network_3', nwSubType: NetworkTypeEnum.OPEN },
  { name: 'MockedNetwork 4', id: 'network_4', nwSubType: NetworkTypeEnum.CAPTIVEPORTAL },
  {
    name: 'MockedNetwork 5',
    id: 'network_5',
    nwSubType: NetworkTypeEnum.OPEN,
    isOweMaster: true,
    owePairNetworkId: 'network_6'
  }, {
    name: 'MockedNetwork 6',
    id: 'network_6',
    nwSubType: NetworkTypeEnum.OPEN,
    isOweMaster: false,
    owePairNetworkId: 'network_5'
  }, {
    name: 'MockedNetwork 7',
    id: 'network_7',
    nwSubType: NetworkTypeEnum.DPSK,
    dsaeOnboardNetwork: {
      id: 'network_8',
      name: 'MockedNetwork 7-dpsk3-wpa2',
      description: 'It is a DPSK3 onboard network and not configurable.',
      nwSubType: 'dpsk'
    }
  }
] as Network[]