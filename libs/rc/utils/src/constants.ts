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

export const Constants = {
  triRadioUserSettingsKey: 'COMMON$supportTriRadio'
}