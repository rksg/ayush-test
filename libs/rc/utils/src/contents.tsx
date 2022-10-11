import { defineMessage } from 'react-intl'

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
  WEP = 'Ruckus Wireless does not recommend using WEP to secure your wireless network because it is insecure and can be exploited easily. Ruckus Cloud offers WEP to enable customers with very old devices (that are difficult or costly to replace) to continue using those devices to connect to the wireless network. If you must use WEP, DO NOT use the devices using WEP to transport sensitive information over the wireless network.',
  WPA2_DESCRIPTION_WARNING = 'Security protocols other than WPA3 are not be supported in 6 GHz radio.'
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


/* eslint-disable max-len */
export const WifiNetworkMessages = {
  ENABLE_PROXY_TOOLTIP: defineMessage({
    defaultMessage: 'Use the controller as proxy in 802.1X networks. A proxy AAA server is used when APs send authentication/accounting messages to the controller and the controller forwards these messages to an external AAA server.'
  }),
  WPA2_DESCRIPTION: defineMessage({
    defaultMessage: 'WPA2 is strong Wi-Fi security that is widely available on all mobile devices manufactured after 2006. WPA2 should be selected unless you have a specific reason to choose otherwise.'
  }),
  WPA3_DESCRIPTION: defineMessage({
    defaultMessage: 'WPA3 is the highest level of Wi-Fi security available but is supported only by devices manufactured after 2019.'
  }),
  ENABLE_MAC_AUTH_TOOLTIP: defineMessage({
    defaultMessage: 'MAC Authentication provides an additional level of security for corporate networks. Client MAC Addresses are passed to the configured RADIUS servers for authentication and accounting. Note that changing this option requires to re-create the network (no edit option)'
  }),
  NETWORK_NAME_TOOLTIP: defineMessage({
    defaultMessage: 'By default, will be used as the network SSID as well. Length is limited to 2-32 characters (depending on the language you use)'
  }),
  NETWORK_MFP_TOOLTIP: defineMessage({
    defaultMessage: `Management Frame Protection (MFP) is defined in 802.11w to protect 802.11 Robust Management frames, including Disassociation, Deauthentication, and Robust Action frames.
      <ul>
        <li>Optional allows legacy devices that do not support the 802.11w standard to associate with the SSID while also
        allowing devices that support 802.11w to use the 802.11w features.</li>
        <li>Required will prevent clients that do not support 802.11w from associating.</li>
      </ul>`
  }),
  LAN_PORTS_PORT_TOOLTIP: defineMessage({
    defaultMessage: 'Configures VLAN tag usage for the port'
  }),
  LAN_PORTS_VLAN_UNTAG_TOOLTIP: defineMessage({
    defaultMessage: 'Enter the native VLAN ID (no VLAN tag in its Ethernet frames)'
  }),
  LAN_PORTS_VLAN_MEMBERS_TOOLTIP: defineMessage({
    defaultMessage: 'Can be a single VLAN ID, a VLAN ID range or a combination of both, separated with commas e.g. 1,3,5-7'
  })
}

export const VenueMessages = {
  MODEL_OVERLAPPING_TOOLTIP: defineMessage({
    defaultMessage: 'You selected CLI profiles with overlapping switch models. Please correct your selection'
  }),
  CLI_PROFILE_NOTIFICATION: defineMessage({
    defaultMessage: `<ul>
      <li>Once CLI profiles are applied, the venue can no longer accept regular profiles</li>
      <li>The selected CLI profiles cannot contain overlapping switch models</li>
    </ul>`
  })
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
