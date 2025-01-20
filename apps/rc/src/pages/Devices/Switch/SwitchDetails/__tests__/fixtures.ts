import {
  DHCP_OPTION_TYPE,
  SwitchViewModel,
  SwitchStatusEnum,
  SWITCH_TYPE,
  SwitchDhcp,
  Switch
} from '@acx-ui/rc/utils'
import { UseQueryResult } from '@acx-ui/types'

export const switchDetailData: SwitchViewModel = {
  type: 'device',
  isStack: true,
  rearModule: 'none',
  switchMac: 'c0:c5:20:98:b9:67',
  switchName: 'ICX7150-C12 Router',
  model: 'ICX7150-C12P',
  id: 'c0:c5:20:98:b9:67',
  syncDataEndTime: '2023-01-16T06:07:09Z',
  firmwareVersion: 'SPR09010e',
  clientCount: 1,
  serialNumber: 'FEK3216Q05B',
  ipAddress: '10.206.33.13',
  cliApplied: false,
  subnetMask: '255.255.254.0',
  venueName: 'My-Venue',
  name: 'ICX7150-C12 Router',
  suspendingDeployTime: '',
  switchType: SWITCH_TYPE.ROUTER,
  configReady: true,
  deviceStatus: SwitchStatusEnum.OPERATIONAL,
  venueId: 'c675aa2d39b74c22b93b96d5dc297d5c',
  syncedSwitchConfig: true,
  defaultGateway: '10.206.33.254',
  stackMembers: [
    { model: 'ICX7150-C12P', id: 'FEK3216Q02P' },
    { model: 'ICX7150-C12P', id: 'FEK3216Q05B' }
  ],
  uptime: '7 days, 7:36:21.00',
  formStacking: false,
  unitId: 1
}

export const venueData = {
  id: 'eb4ef94ba7014f64b69be926faccbc09',
  createdDate: '2022-12-12T04:47:50.558+00:00',
  updatedDate: '2022-12-27T04:08:35.968+00:00',
  name: 'test',
  address: {
    country: 'United States',
    countryCode: 'US',
    city: 'Sunnyvale, California',
    addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
    latitude: 37.4112751,
    longitude: -122.0191908,
    timezone: 'America/Los_Angeles'
  }
}

export const vlanList = {
  data: [
    {
      arpInspection: true,
      id: '832157f54e534a6f8f46c228760804b3',
      igmpSnooping: 'passive',
      ipv4DhcpSnooping: true,
      multicastVersion: 3,
      spanningTreeProtocol: 'stp',
      vlanId: 666,
      vlanName: 'vlan name'
    },
    {
      arpInspection: false,
      id: '06cb3f62b82943a7baa853f44b5a1e98',
      igmpSnooping: 'none',
      ipv4DhcpSnooping: false,
      spanningTreeProtocol: 'none',
      vlanId: 555
    },
    {
      arpInspection: false,
      id: 'ff1b24c7fa8547298fad1ce7068ec6ee',
      igmpSnooping: 'none',
      ipv4DhcpSnooping: false,
      spanningTreeProtocol: 'none',
      vlanId: 444
    },
    {
      arpInspection: false,
      id: '5839a723f2314e3d935d78d3ee2dd3ec',
      igmpSnooping: 'none',
      ipv4DhcpSnooping: false,
      spanningTreeProtocol: 'none',
      vlanId: 333
    },
    {
      arpInspection: false,
      id: 'b2c305e36865489482802a22ca8ee853',
      igmpSnooping: 'none',
      ipv4DhcpSnooping: false,
      spanningTreeProtocol: '',
      taggedPorts: '1/1/3',
      vlanId: 222
    },
    {
      arpInspection: false,
      id: 'ef1c79c5959948d594e019719ddd8325',
      igmpSnooping: 'none',
      ipv4DhcpSnooping: false,
      spanningTreeProtocol: 'stp',
      // eslint-disable-next-line max-len
      untaggedPorts: '1/1/1,1/1/2,1/1/3,1/1/4,1/1/5,1/1/6,1/1/7,1/1/8,1/1/9,1/1/10,1/1/11,1/1/12,1/2/1,1/2/2,2/1/1,2/1/2,2/1/3,2/1/4,2/1/5,2/1/6,2/1/7,2/1/8,2/1/9,2/1/10,2/1/11,2/1/12,2/2/1,2/2/2,2/3/2',
      vlanId: 111,
      vlanName: 'DEFAULT-VLAN'
    }
  ],
  page: 1,
  totalCount: 6,
  totalPages: 1
}

export const poolData: SwitchDhcp = {
  id: '123321',
  poolName: 'poolA',
  leaseDays: 1,
  leaseHrs: 0,
  leaseMins: 2,
  excludedEnd: '',
  excludedStart: '',
  defaultRouterIp: '10.1.3.2',
  subnetAddress: '10.1.2.0',
  subnetMask: '255.255.255.0',
  dhcpOptions: [{
    seq: 4, // Time Server
    type: DHCP_OPTION_TYPE.IP,
    value: '1.2.3.4'
  }, {
    seq: 122, // CCC
    type: DHCP_OPTION_TYPE.HEX,
    value: 'abc'
  }]
}

export const jwtToken = {
  access_token: 'access_token',
  expires_in: '604800',
  id_token: 'id_token',
  type: 'JWT'
}

export const switchDetailsContextData = {
  switchData: {
    id: 'id',
    venueId: 'venue-id',
    name: 'Switch - FEK3230S0C5',
    stackMembers: []
  } as Switch,
  switchQuery: {
    refetch: jest.fn()
  } as unknown as UseQueryResult<Switch>,
  switchDetailHeader: {
    cliApplied: false,
    configReady: true,
    name: 'Switch - FEK3230S0C5',
    isStack: false,
    switchMac: '58:fb:96:0e:bc:f8',
    switchName: 'ICX7150-C12 Router',
    serialNumber: 'FEK3230S0C5',
    deviceStatus: SwitchStatusEnum.OPERATIONAL,
    id: 'id',
    venueId: 'venue-id',
    stackMembers: [],
    syncedSwitchConfig: true,
    switchType: SWITCH_TYPE.ROUTER,
    activeSerial: 'FEK3230S0C5',
    unitId: 1
  },
  switchDetailViewModelQuery: {
    refetch: jest.fn()
  } as unknown as UseQueryResult<SwitchViewModel>,
  currentSwitchOperational: true,
  switchName: ''
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

export const mockedPortProfilesTableResult = {
  data: [
    {
      id: '7d869ac0d966458d8f6d41491445f570',
      name: 'pProfileGlobal2',
      type: 'STATIC',
      taggedVlans: [
        '4'
      ],
      untaggedVlans: 20,
      poeEnable: true,
      poeClass: 'ZERO',
      poePriority: 0,
      portSpeed: 'NONE',
      portProtected: false,
      rstpAdminEdgePort: false,
      stpBpduGuard: false,
      stpRootGuard: false,
      dhcpSnoopingTrust: false,
      ipsg: false,
      dot1x: false,
      macAuth: false,
      ports: [
        '1/1/48'
      ]
    }
  ],
  fields: [
    'id'
  ],
  page: 1,
  totalCount: 2,
  totalPages: 1
}