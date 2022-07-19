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

export enum PskWlanSecurityEnum {
  WPA2Personal = 'WPA2 (Recommended)',
  WPA3 = 'WPA3',
  WPA23Mixed = 'WPA3/WPA2 mixed mode',
  WPAPersonal = 'WPA',
  WEP = 'WEP'
}

export enum SecurityOptionsDescription {
  /* eslint-disable max-len */
  WPA2Personal = 'WPA2 is strong Wi-Fi security that is widely available on all mobile devices manufactured after 2006. WPA2 should be selected unless you have a specific reason to choose otherwise.',
  WPA3 = 'WPA3 is the highest level of Wi-Fi security available but is supported only by devices manufactured after 2019.',
  WPA23Mixed = 'WPA3/WPA2 mixed mode supports the high-end WPA3 which is the highest level of Wi-Fi security available and WPA2 which is still common and provides good security. Typically, mobile devices manufactured after 2006 support WPA2 and devices manufactures after 2019 support WPA3.',
  WPAPersonal = 'WPA security can be chosen if you have older devices that don\'t support WPA2. These devices were likely manufactured prior to 2006. We recommend you upgrade or replace these older devices.',
  WEP = 'Ruckus Wireless does not recommend using WEP to secure your wireless network because it is insecure and can be exploited easily. Ruckus Cloud offers WEP to enable customers with very old devices (that are difficult or costly to replace) to continue using those devices to connect to the wireless network. If you must use WEP, DO NOT use the devices using WEP to transport sensitive information over the wireless network.'
  /* eslint-enable */
}

export enum SecurityOptionsPassphraseLabel {
  WPA2Personal = 'Passphrase',
  WPA3 = 'SAE Passphrase',
  WPA23Mixed = 'WPA2 Passphrase',
  WPAPersonal = 'Passphrase',
  WEP = 'Hex Key'
}

export enum ManagementFrameProtectionEnum {
  Disabled = 'Disabled',
  Optional = 'Optional',
  Required = 'Required',
}

export enum MacAuthMacFormatEnum {
  Lower = 'Lower',
  UpperDash = 'UpperDash',
  UpperColon = 'UpperColon',
  Upper = 'Upper',
  LowerDash = 'LowerDash',
  LowerColon = 'LowerColon',
}

export enum macAuthMacFormatOptions {
  UpperDash = 'AA-BB-CC-DD-EE-FF',
  UpperColon = 'AA:BB:CC:DD:EE:FF',
  Upper = 'AABBCCDDEEFF',
  LowerDash = 'aa-bb-cc-dd-ee-ff',
  LowerColon = 'aa:bb:cc:dd:ee:ff',
  Lower = 'aabbccddeeff',
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
  DISCONNECTED = 'Disconnected',
  ALERTING = 'Alerting',
  CONNECTED = 'Connected',
  INITIAL = 'Initial'
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

export const AaaServerTitle = {
  [AaaServerOrderEnum.PRIMARY]: 'Primary Server',
  [AaaServerOrderEnum.SECONDARY]: 'Secondary Server'
}

export enum CloudpathDeploymentTypeEnum {
  OnPremise = 'OnPremise',
  Cloud = 'Cloud',
}

/* eslint-disable max-len */
export const WifiNetworkMessages = {
  ENABLE_PROXY_TOOLTIP: 'Use the controller as proxy in 802.1X networks. A proxy AAA server is used when APs send authentication/accounting messages to the controller and the controller forwards these messages to an external AAA server.',

  WPA2_DESCRIPTION: 'WPA2 is strong Wi-Fi security that is widely available on all mobile devices manufactured after 2006. WPA2 should be selected unless you have a specific reason to choose otherwise.',

  WPA2_DESCRIPTION_WARNING: 'Security protocols other than WPA3 are not be supported in 6 GHz radio.',

  WPA3_DESCRIPTION: 'WPA3 is the highest level of Wi-Fi security available but is supported only by devices manufactured after 2019.',

  ENABLE_MAC_AUTH_TOOLTIP: 'MAC Authentication provides an additional level of security for corporate networks. Client MAC Addresses are passed to the configured RADIUS servers for authentication and accounting. Note that changing this option requires to re-create the network (no edit option)'
}
/* eslint-enable */

export enum IsolatePacketsTypeEnum {
  UNICAST = 'UNICAST',
  MULTICAST = 'MULTICAST',
  UNICAST_MULTICAST = 'UNICAST_MULTICAST',
}

export enum RfBandUsageEnum {
  _2_4GHZ = '2.4GHZ',
  _5_0GHZ = '5.0GHZ',
  BOTH = 'BOTH',
}

export enum BssMinimumPhyRateEnum {
  _1 = '1',
  _2 = '2',
  _5_5 = '5.5',
  _12 = '12',
  _24 = '24',
  _default = 'default',
}

export enum BssMinimumPhyRateEnum6G {
  _6 = '6',
  _9 = '9',
  _12 = '12',
  _18 = '18',
  _24 = '24',
}

export enum PhyTypeConstraintEnum {
  OFDM = 'OFDM',
  NONE = 'NONE',
}

export enum ManagementFrameMinimumPhyRateEnum {
  _1 = '1',
  _2 = '2',
  _5_5 = '5.5',
  _6 = '6',
  _9 = '9',
  _11 = '11',
  _12 = '12',
  _18 = '18',
  _24 = '24',
}

export enum ManagementFrameMinimumPhyRateEnum6G {
  _6 = '6',
  _9 = '9',
  _12 = '12',
  _18 = '18',
  _24 = '24',
}

export enum RadioTypeEnum {
  _2_4_GHz = '2.4-GHz',
  _5_GHz = '5-GHz',
  _6_GHz = '6-GHz',
}

export enum RadioEnum {
  Both = 'Both',
  _2_4_GHz = '2.4-GHz',
  _5_GHz = '5-GHz',
}

export enum SchedulerTypeEnum {
  ALWAYS_ON = 'ALWAYS_ON',
  ALWAYS_OFF = 'ALWAYS_OFF',
  CUSTOM = 'CUSTOM',
}
