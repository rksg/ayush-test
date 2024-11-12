import { NetworkTypeEnum } from '@acx-ui/rc/utils'

export const mockedApGroupNetworkLinks = {
  fields: [
    'clients',
    'isAllApGroups',
    'description',
    'isOweMaster',
    'check-all',
    'ssid',
    'captiveType',
    'vlan',
    'owePairNetworkId',
    'name',
    'cog',
    'vlanPool',
    'id',
    'dsaeOnboardNetwork',
    'nwSubType'
  ],
  totalCount: 5,
  page: 1,
  data: [
    {
      name: 'NewStepForm',
      id: '3cc8f9dc12334e5da69a8f06aef84dc4',
      vlan: 1,
      nwSubType: 'dpsk',
      ssid: 'NewStepForm',
      clients: 0,
      isAllApGroups: true
    },
    {
      name: 'cap-new',
      id: '70a826008859448592d58482bd38cb88',
      vlan: 1,
      nwSubType: 'guest',
      captiveType: 'Cloudpath',
      ssid: 'capTemp',
      clients: 0,
      isAllApGroups: true
    },
    {
      name: 'cap-test2',
      id: 'b4fdbaa607384672a4b6f25a9583407b',
      vlan: 1,
      nwSubType: 'guest',
      captiveType: 'Cloudpath',
      ssid: 'cap-test2',
      clients: 0,
      isAllApGroups: true
    },
    {
      name: 'capTemp',
      id: '01c40991df83473eb846d8bdfe14d206',
      vlan: 1,
      nwSubType: 'guest',
      captiveType: 'Cloudpath',
      ssid: 'capTemp',
      clients: 0,
      isAllApGroups: true
    },
    {
      name: 'ABC',
      id: '0651d1ff199a4bb0b7f8adfeba454154',
      vlan: 1,
      nwSubType: 'psk',
      ssid: 'ABC',
      clients: 0,
      isAllApGroups: true
    }
  ],
  subsequentQueries: [
    {
      fields: [
        'vlan'
      ],
      url: '/api/tenant/fe8d6c89c852473ea343c9a0fa66829b/wifi/network/get/deep',
      httpMethod: 'POST',
      payload: [
        '3cc8f9dc12334e5da69a8f06aef84dc4',
        '70a826008859448592d58482bd38cb88',
        'b4fdbaa607384672a4b6f25a9583407b',
        '01c40991df83473eb846d8bdfe14d206',
        '0651d1ff199a4bb0b7f8adfeba454154'
      ]
    }
  ]
}

export const networkApGroup = {
  response: [{
    allApGroupsRadio: 'Both',
    apGroups: [{
      apGroupId: '58195e050b8a4770acc320f6233ad8d9',
      apGroupName: 'joe-test-apg',
      id: 'f71c3dc400bb46e5a03662d48d0adb2c',
      isDefault: false,
      radio: 'Both',
      radioTypes: ['5-GHz', '2.4-GHz'],
      validationError: false,
      validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
      validationErrorReachedMaxConnectedNetworksLimit: false,
      validationErrorSsidAlreadyActivated: false,
      vlanPoolId: '545c8f5dd44f45c2b47f19f8db4f53dc',
      vlanPoolName: 'joe-vlanpool-1'
    }, {
      apGroupId: '75f7751cd7d34bf19cc9446f92d82ee5',
      isDefault: true,
      radio: 'Both',
      validationError: false,
      validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
      validationErrorReachedMaxConnectedNetworksLimit: false,
      validationErrorSsidAlreadyActivated: false
    }],
    dual5gEnabled: false,
    isAllApGroups: false,
    networkId: '3c83529e839746ae960fa8fb6d4fd387',
    tripleBandEnabled: true,
    venueId: '991eb992ece042a183b6945a2398ddb9'
  }]
}

export const mockDeepNetworkList = {
  requestId: '639283c7-7a5e-4ab3-8fdb-6289fe0ed255',
  response: [
    { name: 'MockedNetwork 1', id: 'network_1', type: NetworkTypeEnum.DPSK },
    { name: 'MockedNetwork 2', id: 'network_2', type: NetworkTypeEnum.PSK },
    { name: 'MockedNetwork 3', id: 'network_3', type: NetworkTypeEnum.OPEN },
    { name: 'NewStepForm', id: '3cc8f9dc12334e5da69a8f06aef84dc4', type: NetworkTypeEnum.DPSK },
    { name: 'cap-new', id: '70a826008859448592d58482bd38cb88', type: NetworkTypeEnum.OPEN },
    { name: 'cap-test2', id: 'b4fdbaa607384672a4b6f25a9583407b', type: NetworkTypeEnum.OPEN },
    { name: 'capTemp', id: '01c40991df83473eb846d8bdfe14d206', type: NetworkTypeEnum.PSK },
    { name: 'ABC', id: '0651d1ff199a4bb0b7f8adfeba454154', type: NetworkTypeEnum.PSK }
  ]
}

export const mockTableResult = {
  totalCount: 1,
  data: [{
    id: 'cc080e33-26a7-4d34-870f-b7f312fcfccb',
    name: 'My Client Isolation 1',
    vlanMembers: ['1'],
    venueApGroups: [{
      id: '1',
      apGroups: [{
        id: '00d4a19ee93f49369ad90815c917c671',
        allApGroups: true,
        default: true
      }]
    }, {
      id: '2',
      apGroups: [{
        id: '07905d867d9b416183fe4d48d5cf391e',
        allApGroups: true,
        default: true
      }]
    }, {
      id: '3',
      apGroups: [{
        id: 'b9eb6106a4d44ac498f1aa89a8fb87d5',
        allApGroups: false,
        default: true
      }]
    }],
    venueIds: ['1','2','3']
  }]
}
