import { SwitchViewModel, SwitchStatusEnum } from '@acx-ui/rc/utils'

export const switchDetailData: SwitchViewModel = {
  type: 'device',
  isStack: true,
  rearModule: 'none',
  switchMac: 'c0:c5:20:98:b9:67',
  switchName: 'ICX7150-C12 Router',
  model: 'ICX7150-C12P',
  id: 'c0:c5:20:98:b9:67',
  syncDataEndTime: 1670314840296,
  firmwareVersion: 'SPR09010e',
  clientCount: 1,
  serialNumber: 'FEK3216Q05B',
  ipAddress: '10.206.33.13',
  cliApplied: false,
  subnetMask: '255.255.254.0',
  venueName: 'My-Venue',
  name: 'ICX7150-C12 Router',
  suspendingDeployTime: '',
  switchType: 'router',
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
