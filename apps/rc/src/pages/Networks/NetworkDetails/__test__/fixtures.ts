import { RadioEnum, RadioTypeEnum, SchedulerTypeEnum } from '@acx-ui/rc/utils'

export const networkVenueResponse = {
  venueId: '4c778ed630394b76b17bce7fe230cf9f',
  tripleBandEnabled: false,
  networkId: '1ab720533d624ee4b5745b67d84fa422',
  allApGroupsRadio: 'Both' as RadioEnum,
  allApGroupsRadioTypes: [
    RadioTypeEnum._2_4_GHz,
    RadioTypeEnum._5_GHz
  ],
  scheduler: {
    type: SchedulerTypeEnum.CUSTOM,
    // eslint-disable-next-line max-len
    sun: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
    // eslint-disable-next-line max-len
    mon: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
    // eslint-disable-next-line max-len
    tue: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
    // eslint-disable-next-line max-len
    wed: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
    // eslint-disable-next-line max-len
    thu: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
    // eslint-disable-next-line max-len
    fri: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
    // eslint-disable-next-line max-len
    sat: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
  },
  isAllApGroups: true,
  id: '9367fd6cb2f94a2dbba7ba839b13c0a5'
}

export const venueResponse = {
  id: '4c778ed630394b76b17bce7fe230cf9f',
  name: 'My-Venue',
  description: 'My-Venuefdf',
  city: 'New York',
  country: 'United States',
  latitude: '40.7690084',
  longitude: '-73.9431541',
  networks: {
    count: 8,
    names: [
      'NMS-app6-WLAN',
      'su-psk',
      'dfg',
      'NMS-app6-JK-acx-hybrid',
      'su-dpsk',
      'aaa-45',
      'su-open',
      'guest pass wlan'
    ],
    vlans: [
      1
    ]
  },
  aggregatedApStatus: {
    '3_04_DisconnectedFromCloud': 1,
    '2_00_Operational': 1,
    '1_01_NeverContactedCloud': 2
  },
  status: '3_RequiresAttention',
  mesh: {
    enabled: false
  },
  activated: {
    isActivated: true
  }
}

export const networkResponse = {
  type: 'aaa',
  wlan: {},
  authRadiusId: '40abf9b65b2a48efb9b6dd49be5e18eb',
  accountingRadiusId: 'c303433faa3a410b9c201aee17982b9c',
  authRadius: {
    primary: {
      ip: '1.1.1.1',
      port: '1812',
      sharedSecret: '111'
    },
    secondary: {
      ip: '2.2.2.2',
      port: '1812',
      sharedSecret: '222'
    },
    id: '40abf9b65b2a48efb9b6dd49be5e18eb'
  },
  accountingRadius: {
    primary: {
      ip: '3.3.3.3',
      port: '1813',
      sharedSecret: '333'
    },
    secondary: {
      ip: '4.4.4.4',
      port: '1813',
      sharedSecret: '444'
    },
    id: 'c303433faa3a410b9c201aee17982b9c'
  },
  tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
  venues: [
    {
      venueId: '4c778ed630394b76b17bce7fe230cf9f',
      tripleBandEnabled: false,
      networkId: '1ab720533d624ee4b5745b67d84fa422',
      allApGroupsRadio: 'Both' as RadioEnum,
      allApGroupsRadioTypes: [
        RadioTypeEnum._2_4_GHz,
        RadioTypeEnum._5_GHz
      ],
      scheduler: {
        type: SchedulerTypeEnum.CUSTOM,
        // eslint-disable-next-line max-len
        sun: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        mon: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        tue: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        wed: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        thu: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        fri: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        sat: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'
      },
      isAllApGroups: true,
      id: '9367fd6cb2f94a2dbba7ba839b13c0a5'
    }
  ],
  name: 'aaa-45',
  description: 'fdsf',
  enableAuthProxy: true,
  enableAccountingProxy: true,
  id: '1ab720533d624ee4b5745b67d84fa422'
}

export const timezoneResult = {
  dstOffset: 3600,
  rawOffset: -28800,
  status: 'OK',
  timeZoneId: 'America/Los_Angeles',
  timeZoneName: 'Pacific Daylight Time'
}