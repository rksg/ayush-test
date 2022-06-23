export const VLAN_PREFIX = {
  VLAN: 'VLAN-',
  POOL: 'VLAN Pool: '
}

export const NetworkTypeEnum = {
  PSK: 'psk',
  OPEN: 'open',
  AAA: 'aaa',
  CAPTIVEPORTAL: 'guest',
  DPSK: 'dpsk'
}

export enum GuestNetworkTypeEnum {
  ClickThrough = 'ClickThrough',
  SelfSignIn = 'SelfSignIn',
  HostApproval = 'HostApproval',
  GuestPass = 'GuestPass',
  WISPr = 'WISPr',
  Cloudpath = 'Cloudpath'
}

export enum WlanSecurityEnum {
  Open = 'Open',
  WPAPersonal = 'WPAPersonal',
  WPA2Personal = 'WPA2Personal',
  WPAEnterprise = 'WPAEnterprise',
  WPA2Enterprise = 'WPA2Enterprise',
  OpenCaptivePortal = 'OpenCaptivePortal',
  WEP = 'WEP',
  WPA23Mixed = 'WPA23Mixed',
  WPA3 = 'WPA3'
}

export enum PassphraseFormatEnum {
  MOST_SECURED = 'MOST_SECURED',
  KEYBOARD_FRIENDLY = 'KEYBOARD_FRIENDLY',
  NUMBERS_ONLY = 'NUMBERS_ONLY',
}

export enum PassphraseExpirationEnum {
  UNLIMITED = 'UNLIMITED',
  ONE_DAY = 'ONE_DAY',
  TWO_DAYS = 'TWO_DAYS',
  ONE_WEEK = 'ONE_WEEK',
  TWO_WEEKS = 'TWO_WEEKS',
  ONE_MONTH = 'ONE_MONTH',
  SIX_MONTHS = 'SIX_MONTHS',
  ONE_YEAR = 'ONE_YEAR',
  TWO_YEARS = 'TWO_YEARS',
}
