import { defineMessage, MessageDescriptor } from 'react-intl'

import {
  DHCPConfigTypeEnum
} from './constants'
import { BridgeServiceEnum } from './models'

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
  WEP = 'Ruckus Networks does not recommend using WEP to secure your wireless network because it is insecure and can be exploited easily. RUCKUS One offers WEP to enable customers with very old devices (that are difficult or costly to replace) to continue using those devices to connect to the wireless network. If you must use WEP, DO NOT use the devices using WEP to transport sensitive information over the wireless network.',
  WPA2_DESCRIPTION_WARNING = '6GHz radios are only supported with WPA3.'
  /* eslint-enable */
}

export enum WisprSecurityEnum {
  NONE = 'Select...',
  PSK = 'Pre-Share Key (PSK)',
  OWE = 'OWE encryption'
}

export enum WisprSecurityOptionsDescription {
  /* eslint-disable max-len */
  NONE = '',
  PSK = 'Require users to enter a passphrase to connect',
  OWE = 'In OWE mode, the Diffie-Hellman key exchange algorithm is used to encrypt data on the Wi-Fi network'
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
export const SwitchMessages = {
  FIRMWARE_TYPE_TOOLTIP: defineMessage({
    defaultMessage: 'Firmware type will only be applied to factory default switches. Switches with pre-existing configuration will not be affected by this setting to prevent connectivity loss.'
  }),
  DHCP_CLIENT_TOOLTIP: defineMessage({
    defaultMessage: 'DHCP Client interface will only be applied to factory default switches. Switches with pre-existing configuration will not get this change to prevent connectivity loss.'
  }),
  ADD_AS_MEMBER_TOOLTIP: defineMessage({
    defaultMessage: 'Based on the switch serial number you entered, compatible stacks of the same model are listed here.'
  }),
  MEMBER_NOT_SUPPORT_STACKING_TOOLTIP: defineMessage({
    defaultMessage: 'ICX7150-C08P/C08PT does not support stacking'
  })
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
  ENABLE_OWE_TOOLTIP: defineMessage({
    defaultMessage: 'In OWE mode, the Diffie-Hellman key exchange algorithm is used to encrypt data on the Wi-Fi network.'
  }),
  ENABLE_OWE_TRANSITION_TOOLTIP: defineMessage({
    defaultMessage: 'For STAs that do not support OWE authentication, the OWE transition mode is available so that such STAs can access the network in open authentication mode.'
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
  }),
  AP_VENUE_DHCP_DISABLED_TOOLTIP: defineMessage({
    defaultMessage: 'Not allow to change Venue on DHCP AP.'
  }),
  AP_VENUE_MESH_DISABLED_TOOLTIP: defineMessage({
    defaultMessage: 'Mesh AP cannot be moved to a different venue'
  }),
  AP_NAME_TOOLTIP: defineMessage({
    defaultMessage: 'Name must be between 2 and 32 alpha-numeric characters. Backtick "`" and the "$(" combination are not allowed.'
  })
}

export const WifiTroubleshootingMessages = {
  Target_Host_IP_TOOLTIP: defineMessage({
    defaultMessage: 'The target host or IP address must be a valid IP address or domain name'
  })
}

export const EdgeTroubleshootingMessages = {
  Target_Host_IP_TOOLTIP: defineMessage({
    defaultMessage: 'The target host or IP address must be a valid IP address or domain name'
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
  }),
  SNR_THRESHOLD_TOOLTIP: defineMessage({
    defaultMessage: 'SNR threshold above which detected Rogue APs will be reported in RUCKUS One. Available range is 0-100.'
  }),
  CLI_APPLIED: defineMessage({
    defaultMessage: 'These settings cannot be changed, since a CLI profile is applied on the venue.'
  })
}

export const ApErrorHandlingMessages = {
  SERIAL_NUMBER_ALREADY_REGISTERED: defineMessage({
    defaultMessage: 'Serial number is already registered'
  }),
  SERVICE_IS_NOT_SUPPORTED: defineMessage({
    defaultMessage: 'The service is currently not supported in the country which you entered.<br></br>Please make sure that you entered the correct address.'
  }),
  UPGRADE_YOUR_LICENSE: defineMessage({
    defaultMessage: 'Upgrade your license to add new APs to the system'
  }),
  REQUEST_LOCKING: defineMessage({
    defaultMessage: 'A configuration request is currently being executed and additional requests cannot be performed at this time.<br></br>Try again once the request has completed.'
  }),
  CELLULAR_AP_CANNOT_BE_MOVED: defineMessage({
    defaultMessage: 'The cellular AP cannot be moved to the venue which doesn\'t enable DHCP service'
  }),
  ERROR_OCCURRED: defineMessage({
    defaultMessage: 'Error occurred while {action} AP'
  })
}

export const EditPortMessages = {
  UNSELECT_VLANS: defineMessage({
    defaultMessage: 'The port must be a member of at least one VLAN'
  }),
  ADD_VLAN_DISABLE: defineMessage({
    defaultMessage: 'Create and apply a configuration profile to this switch\'s venue to add/edit VLANs'
  }),
  ADD_ACL_DISABLE: defineMessage({
    defaultMessage: 'Create and apply a configuration profile to this switch\'s venue to add/edit ACL'
  }),
  ADD_LLDP_DISABLE: defineMessage({
    defaultMessage: 'Create and apply a configuration profile to this switch\'s venue to add/edit LLDP QoS'
  }),
  VOICE_VLAN_DISABLE: defineMessage({
    defaultMessage: 'No profile VLAN or VLAN option'
  }),
  USE_VENUE_SETTINGS_DISABLE: defineMessage({
    defaultMessage: 'Venue settings default VLAN ID is the same as one of switch VLANs'
  }),
  POE_CAPABILITY_DISABLE: defineMessage({
    defaultMessage: 'Can not configure PoE configurations(PoE Enable, PoE Class, and PoE Priority) since this port doesn\'t have PoE capability.'
  }),
  TAGGED_VLAN_TOOLTIP: defineMessage({
    defaultMessage: 'Cannot set tagged VLANs when IPSG is activated on the port'
  }),
  PORT_SPEED_TOOLTIP: defineMessage({
    defaultMessage: 'Not support on this port'
  })
}

export const MultipleEditPortMessages = {
  UNSELECT_VLANS: defineMessage({
    defaultMessage: 'Each port must be a member of at least one VLAN'
  }),
  POE_CAPABILITY_DISABLE: defineMessage({
    defaultMessage: 'Can not configure PoE configurations(PoE Enable, PoE Class, and PoE Priority) since one or more ports don\'t have PoE capability.'
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


export const DHCPConfigTypeMessages = {
  [DHCPConfigTypeEnum.MULTIPLE]: defineMessage({ defaultMessage: 'Multiple APs' }),
  [DHCPConfigTypeEnum.SIMPLE]: defineMessage({ defaultMessage: 'Each APs' }),
  [DHCPConfigTypeEnum.HIERARCHICAL]: defineMessage({ defaultMessage: 'Hierarchical APs' })
}

// eslint-disable-next-line max-len
export const mdnsProxyRuleTypeLabelMapping: Record<BridgeServiceEnum, MessageDescriptor> = {
  [BridgeServiceEnum.AIRDISK]: defineMessage({ defaultMessage: 'AirDisk' }),
  [BridgeServiceEnum.AIRPLAY]: defineMessage({ defaultMessage: 'AirPlay' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.AIRPORT_MANAGEMENT]: defineMessage({ defaultMessage: 'Airport Management' }),
  [BridgeServiceEnum.AIRPRINT]: defineMessage({ defaultMessage: 'AirPrint' }),
  [BridgeServiceEnum.AIRTUNES]: defineMessage({ defaultMessage: 'AirTunes' }),
  [BridgeServiceEnum.APPLETV]: defineMessage({ defaultMessage: 'Apple TV' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.APPLE_FILE_SHARING]: defineMessage({ defaultMessage: 'Apple File Sharing' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.APPLE_MOBILE_DEVICES]: defineMessage({ defaultMessage: 'Apple Mobile Devices' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.GOOGLE_CHROMECAST]: defineMessage({ defaultMessage: 'Google Chromecast' }),
  [BridgeServiceEnum.ICLOUD_SYNC]: defineMessage({ defaultMessage: 'iCloud Sync' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.ITUNES_REMOTE]: defineMessage({ defaultMessage: 'iTunes Remote' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.ITUNES_SHARING]: defineMessage({ defaultMessage: 'iTunes Sharing' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.OPEN_DIRECTORY_MASTER]: defineMessage({ defaultMessage: 'Open Directory Master' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.OPTICAL_DISK_SHARING]: defineMessage({ defaultMessage: 'Optical Disk Sharing' }),
  [BridgeServiceEnum.OTHER]: defineMessage({ defaultMessage: 'Other' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.SCREEN_SHARING]: defineMessage({ defaultMessage: 'Screen Sharing' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.SECURE_FILE_SHARING]: defineMessage({ defaultMessage: 'Secure File Sharing' }),
  [BridgeServiceEnum.SECURE_SHELL]: defineMessage({ defaultMessage: 'Secure Shell' }),
  [BridgeServiceEnum.WWW_HTTP]: defineMessage({ defaultMessage: 'WWW HTTP' }),
  [BridgeServiceEnum.WWW_HTTPS]: defineMessage({ defaultMessage: 'WWW HTTPs' }),
  [BridgeServiceEnum.XGRID]: defineMessage({ defaultMessage: 'Xgrid' })
}

export const EditPropertyConfigMessages = {
  /* eslint-disable max-len */
  DISABLE_PROPERTY_MESSAGE: defineMessage({ defaultMessage: 'This will delete all related configurations and currently connected clients will lose their connectivity to networking services.' }),
  ENABLE_PROPERTY_TOOLTIP: defineMessage({ defaultMessage: 'Switching property management OFF will delete the entire related configuration and will cause clients to lose their networking service.' }),
  BIND_PERSONA_GROUP_TOOLTIP: defineMessage({ defaultMessage: 'Please note that once property management has been enabled, changing the persona group is not allowed.' })
  /* eslint-enable */
}
