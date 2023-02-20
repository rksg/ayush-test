import { SwitchViewModel, SwitchStatusEnum, SWITCH_TYPE, DHCP_OPTION_TYPE, SwitchDhcp } from '@acx-ui/rc/utils'

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
  formStacking: false
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
    seq: 4,
    type: DHCP_OPTION_TYPE.IP,
    value: '1.2.3.4'
  }]
}

export const jwtToken = {
  access_token: 'access_token',
  expires_in: '604800',
  id_token: 'id_token',
  type: 'JWT'
}
