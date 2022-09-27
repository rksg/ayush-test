export const VLAN_PREFIX = {
  VLAN: 'VLAN-',
  POOL: 'VLAN Pool: '
}

export enum NetworkTypeEnum {
  PSK = 'psk',
  OPEN = 'open',
  AAA = 'aaa',
  CAPTIVEPORTAL = 'guest',
  DPSK = 'dpsk'
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
  TWO_YEARS = 'TWO_YEARS'
}

export enum ApDeviceStatusEnum {
  NEVER_CONTACTED_CLOUD = '1_01_NeverContactedCloud',
  INITIALIZING = '1_07_Initializing',
  OFFLINE = '1_09_Offline',
  OPERATIONAL = '2_00_Operational',
  APPLYING_FIRMWARE = '2_01_ApplyingFirmware',
  APPLYING_CONFIGURATION = '2_02_ApplyingConfiguration',
  FIRMWARE_UPDATE_FAILED = '3_02_FirmwareUpdateFailed',
  CONFIGURATION_UPDATE_FAILED = '3_03_ConfigurationUpdateFailed',
  DISCONNECTED_FROM_CLOUD = '3_04_DisconnectedFromCloud',
  REBOOTING = '4_01_Rebooting',
  HEARTBEAT_LOST = '4_04_HeartbeatLost'
}

export enum APMeshRole {
  RAP = 'RAP',
  MAP = 'MAP',
  EMAP = 'EMAP',
  DISABLED = 'DISABLED'
}

export enum DeviceConnectionStatus {
  INITIAL = 'initial',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ALERTING = 'alerting'
}

export enum ApRadioBands {
  band24 = '2.4G',
  band50 = '5G',
  band60 = '6G'
}
export const Constants = {
  triRadioUserSettingsKey: 'COMMON$supportTriRadio'
}

export enum AaaServerTypeEnum {
  AUTHENTICATION = 'authRadius',
  ACCOUNTING = 'accountingRadius',
}

export enum AaaServerOrderEnum {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
}

export enum CloudpathDeploymentTypeEnum {
  OnPremise = 'OnPremise',
  Cloud = 'Cloud',
}

export enum ServiceType {
  PORTAL = 'PORTAL',
  DHCP = 'DHCP',
  WIFI_CALLING = 'Wi-Fi Calling',
  MDNS_PROXY = 'MDNS_PROXY',
  DPSK = 'DPSK'
}
export enum ServiceTechnology {
  WIFI = 'WI-FI',
  SWITCH = 'SWITCH'
}
export enum ServiceStatus {
  UP = 'UP',
  DOWN = 'DOWN'
}
export enum ServiceAdminState {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED'
}

export enum RadiusErrorsType {
  AUTH_AND_ACC = 'AUTH_AND_ACC',
  AUTH = 'AUTH',
  ACCOUNTING = 'ACCOUNTING'
}
