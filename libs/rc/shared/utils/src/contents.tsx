import { defineMessage, FormattedMessage, MessageDescriptor } from 'react-intl'

import {
  DHCPConfigTypeEnum
} from './constants'
import { BridgeServiceEnum } from './models/BridgeServiceEnum'

export enum PskWlanSecurityEnum {
  WPA2Personal = 'WPA2 (Recommended)',
  WPA3 = 'WPA3',
  WPA23Mixed = 'WPA2/WPA3 mixed mode',
  WPAPersonal = 'WPA',
  WEP = 'WEP'
}

export enum AAAWlanSecurityEnum {
  WPA2Enterprise = 'WPA2 (Recommended)',
  WPA3 = 'WPA3'
}

export enum WisprSecurityEnum {
  NONE = 'None',
  PSK = 'Pre-Share Key (PSK)',
  OWE = 'OWE encryption'
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
    defaultMessage: '{switchModel} does not support stacking'
  }),
  NONOPERATIONAL_SWITCH_NOT_SUPPORT_CONFIGURED: defineMessage({
    defaultMessage: 'The port can not be edited since it is on a switch that is not operational'
  }),
  STACKING_PORT_NOT_SUPPORT_CONFIGURED: defineMessage({
    defaultMessage: 'This is a stacking port and can not be configured'
  }),
  LAG_MEMBER_PORT_NOT_SUPPORT_CONFIGURED: defineMessage({
    defaultMessage: 'This is a LAG member port and can not be configured'
  }),
  PLEASE_CHECK_INVALID_VALUES_AND_MODIFY_VIA_CLI: defineMessage({
    defaultMessage: 'Please check the invalid field values under the settings tab and modify it via CLI'
  }),
  PLEASE_CHECK_INVALID_VALUES: defineMessage({
    defaultMessage: 'Please check the invalid field values under the settings tab'
  })
}

export const SwitchCliMessages = {
  INVALID_CLI: defineMessage({ defaultMessage: 'Please input CLI commands' }),
  INVALID_CLI_VARIABLES: defineMessage({ defaultMessage: 'Please define variable(s) in CLI commands' }),
  INVALID_CLI_ATTRIBUTES: defineMessage({ defaultMessage: 'Please define attribute(s) in CLI commands' }),
  CLI_COMMANDS: defineMessage({ defaultMessage: 'You can use any combination of the following options: type the commands, copy/paste the configuration from another file, use the examples on the right pane.' }),
  CLI_VARIABLES_REACH_MAX: defineMessage({ defaultMessage: 'The variables had reach to the maximum total 200 entries.' }),
  NOTICE_INFO: defineMessage({ defaultMessage: 'Once the CLI Configuration profile is applied to a <venueSingular></venueSingular>, you will not be able to apply a regular switch configuration profile to the same <venueSingular></venueSingular>' }),
  NOTICE_DESP: defineMessage({ defaultMessage: 'It is the user\'s responsibility to ensure the validity and ordering of CLI commands are accurate. The recommendation is to get familiarized with {link} to avoid configuration failures' }),
  VARIABLE_NAME_RULE: defineMessage({ defaultMessage: 'Variable name may include letters and numbers. It must start with a letter.' }),
  VARIABLE_RANGE_START_RULE: defineMessage({ defaultMessage: 'You may enter numbers between 0 and 65535. Start value must be lower than end value' }),
  VARIABLE_RANGE_END_RULE: defineMessage({ defaultMessage: 'You may enter numbers between 0 and 65535. End value must be higher than start value' }),
  VARIABLE_STRING_RULE: defineMessage({ defaultMessage: 'Special characters (other than space, $, -, . and _) are not allowed' }),
  ALLOW_CUSTOMIZED_ADDRESS_TOOLTIP: defineMessage({ defaultMessage: 'Select an IP address from the subnet defined above.' }),
  ALLOW_CUSTOMIZED_RANGE_TOOLTIP: defineMessage({ defaultMessage: 'Select a number from the range defined above.' }),
  ALLOW_CUSTOMIZED_CLI_TOOLTIP: defineMessage({ defaultMessage: 'This section allows you to dictate the variable value getting assigned to the selected switch.' }),
  NOT_ALLOWED_APPLY_PROFILE: defineMessage({ defaultMessage: 'This switch is already linked with a different configuration profile.' }),
  PREPROVISIONED_SWITCH_LIST_TOOLTIP: defineMessage({ defaultMessage: 'Only the selected models from the previous step will be available for selection when customizing variables.' }),
  PLEASE_ENTER_START_IP: defineMessage({ defaultMessage: 'Please enter Start IP Address first' }),
  PLEASE_ENTER_END_IP: defineMessage({ defaultMessage: 'Please enter End IP Address first' }),
  PLEASE_ENTER_MASK: defineMessage({ defaultMessage: 'Please enter Network Mask first' }),
  PLEASE_ENTER_ADDRESS_VALUES: defineMessage({ defaultMessage: 'Please enter Start IP Address, End IP Address and Network Mask first' }),
  OVERLAPPING_MODELS_TOOLTIP: defineMessage({ defaultMessage: 'A CLI configuration profile with overlapping switch models has been applied to this <venueSingular></venueSingular> so it cannot be selected.' }),
  VENUE_STEP_DESP: defineMessage({ defaultMessage: 'The configuration will be applied to all switches of the selected models, as well as any switch that will be added to the <venueSingular></venueSingular> in the future' }),
  PRE_SELECT_VENUE_FOR_CUSTOMIZED: defineMessage({ defaultMessage: 'Cannot unselect this <venueSingular></venueSingular> because some of it\'s switches have custom variables assigned from the previous step' })
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
    defaultMessage: 'Secures open Wi-Fi networks by encrypting data without needing passwords.'
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
  LAN_PORTS_TRUNK_PORT_VLAN_UNTAG_TOOLTIP: defineMessage({
    defaultMessage: 'Enter the native VLAN ID (no VLAN tag in its Ethernet frames). Only APs with the supported firmware version can modify the untagged VLAN from the default value of 1. Supported model family: Wi-Fi 6, Wi-Fi 6E, Wi-Fi 7'
  }),
  LAN_PORTS_VLAN_MEMBERS_TOOLTIP: defineMessage({
    defaultMessage: 'Can be a single VLAN ID, a VLAN ID range or a combination of both, separated with commas e.g. 1,3,5-7'
  }),
  LAN_PORTS_RESET_TOOLTIP: defineMessage({
    defaultMessage: 'Reset port settings to default'
  }),
  AP_VENUE_DHCP_DISABLED_TOOLTIP: defineMessage({
    defaultMessage: 'Not allow to change <VenueSingular></VenueSingular> on DHCP AP.'
  }),
  AP_VENUE_MESH_DISABLED_TOOLTIP: defineMessage({
    defaultMessage: 'Mesh AP cannot be moved to a different <venueSingular></venueSingular>'
  }),
  AP_NAME_TOOLTIP: defineMessage({
    defaultMessage: 'Name must be between 2 and 32 alpha-numeric characters. Backtick "`" and the "$(" combination are not allowed.'
  })
}

export const WisprSecurityOptionsDescription = {
  PSK: defineMessage({
    defaultMessage: 'Require users to enter a passphrase to connect'
  }),
  OWE: WifiNetworkMessages.ENABLE_OWE_TOOLTIP
}

export const SecurityOptionsDescription = {
  WPA2Personal: WifiNetworkMessages.WPA2_DESCRIPTION,
  WPA3: WifiNetworkMessages.WPA3_DESCRIPTION,
  WPA23Mixed: defineMessage({
    defaultMessage: 'WPA2/WPA3 mixed mode supports the high-end WPA3 which is the highest level of Wi-Fi security available and WPA2 which is still common and provides good security. Typically, mobile devices manufactured after 2006 support WPA2 and devices manufactures after 2019 support WPA3.'
  }),
  WPAPersonal: defineMessage({
    defaultMessage: 'WPA security can be chosen if you have older devices that don\'t support WPA2. These devices were likely manufactured prior to 2006. We recommend you upgrade or replace these older devices.'
  }),
  WEP: defineMessage({
    defaultMessage: 'Ruckus Networks does not recommend using WEP to secure your wireless network because it is insecure and can be exploited easily. RUCKUS One offers WEP to enable customers with very old devices (that are difficult or costly to replace) to continue using those devices to connect to the wireless network. If you must use WEP, DO NOT use the devices using WEP to transport sensitive information over the wireless network.'
  }),
  WPA2_DESCRIPTION_WARNING: defineMessage({
    defaultMessage: '6GHz radios are only supported with WPA3.'
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
      <li>Once CLI profiles are applied, the <venueSingular></venueSingular> can no longer accept regular profiles</li>
      <li>The selected CLI profiles cannot contain overlapping switch models</li>
    </ul>`
  }),
  SNR_THRESHOLD_TOOLTIP: defineMessage({
    defaultMessage: 'SNR threshold above which detected Rogue APs will be reported in RUCKUS One. Available range is 0-100.'
  }),
  CLI_APPLIED: defineMessage({
    defaultMessage: 'These settings cannot be changed, since a CLI profile is applied on the <venueSingular></venueSingular>.'
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
    defaultMessage: 'The cellular AP cannot be moved to the <venueSingular></venueSingular> which doesn\'t enable DHCP service'
  }),
  ERROR_OCCURRED: defineMessage({
    defaultMessage: 'Error occurred while {action} AP'
  }),
  FIRMWARE_IS_NOT_SUPPORTED: defineMessage({
    defaultMessage: 'The version of AP firmware is not supported'
  }),
  IS_NOT_OPERATIONAL: defineMessage({
    defaultMessage: 'The AP is not operational'
  }),
  IS_NOT_FOUND: defineMessage({
    defaultMessage: 'The AP is not found'
  }),
  NO_DETECTED_NEIGHBOR_DATA: defineMessage({
    defaultMessage: 'No detected neighbor data'
  })
}

export const EditPortMessages = {
  UNSELECT_VLANS: defineMessage({
    defaultMessage: 'The port must be a member of at least one VLAN'
  }),
  ADD_VLAN_DISABLE: defineMessage({
    defaultMessage: 'Create and apply a configuration profile to this switch\'s <venueSingular></venueSingular> to add/edit VLANs'
  }),
  ADD_ACL_DISABLE: defineMessage({
    defaultMessage: 'Create and apply a configuration profile to this switch\'s <venueSingular></venueSingular> to add/edit ACL'
  }),
  ADD_LLDP_DISABLE: defineMessage({
    defaultMessage: 'Create and apply a configuration profile to this switch\'s <venueSingular></venueSingular> to add/edit LLDP QoS'
  }),
  VOICE_VLAN_DISABLE: defineMessage({
    defaultMessage: 'No profile VLAN or VLAN option'
  }),
  USE_VENUE_SETTINGS_DISABLE: defineMessage({
    defaultMessage: '<VenueSingular></VenueSingular> settings default VLAN ID is the same as one of switch VLANs'
  }),
  USE_VENUE_SETTINGS_DISABLED_WHEN_FLEX_AUTH_ENABLED: defineMessage({
    defaultMessage: 'When authentication is enabled, <venueSingular></venueSingular> settings cannot be applied.'
  }),
  POE_CAPABILITY_DISABLE: defineMessage({
    defaultMessage: 'Can not configure PoE configurations(PoE Enable, PoE Class, and PoE Priority) since this port doesn\'t have PoE capability.'
  }),
  TAGGED_VLAN_TOOLTIP: defineMessage({
    defaultMessage: 'Cannot set tagged VLANs when IPSG is activated on the port'
  }),
  PORT_SPEED_TOOLTIP: defineMessage({
    defaultMessage: 'Not support on this port'
  }),
  TAGGED_VLAN_VOICE_TOOLTIP: defineMessage({
    defaultMessage: 'The port needs to be a tagged member of the VLAN  in order to use it as a Voice VLAN.'
  }),
  INVALID_VOICE_VLAN: defineMessage({
    defaultMessage: 'Voice VLAN needs to be configured together with Tagged VLAN.'
  }),
  RESET_PORT_WARNING: defineMessage({
    defaultMessage: `Changing the port settings may result in loss of connectivity and
      communication issues to your APs. Do you want to continue with these changes?`
  }),
  MODIFYING_UPLINK_PORT: defineMessage({
    defaultMessage: 'Modifying the uplink port may result in connectivity issues. Are you sure you want to apply these changes?'
  }),
  NEED_CONFIGURE_AAA_RADIUS_SETTINGS: defineMessage({
    defaultMessage: 'Authentication needs RADIUS server and AAA policy to support. If you have set them on R1, will apply the configuration for Authentication automatically. If no, please set them to make Authentication work.'
  }),
  ONLY_SUPPORT_FW_ABOVE_10010F: defineMessage({
    defaultMessage: 'The firmware version on the selected switches must be FI 10.0.10f or higher.'
  }),
  UNTAGGED_PORT_CANNOT_ENABLE_FLEX_AUTH: defineMessage({
    defaultMessage: 'This port is Untagged port. So can not enable Authentication.'
  }),
  CANNOT_ENABLE_FLEX_AUTH_WHEN_IPSG_ENABLED: defineMessage({
    defaultMessage: 'Authentication cannot be enabled if IPSG is turned ON.'
  }),
  CANNOT_ENABLE_IPSG_WHEN_FLEX_AUTH_ENABLED: defineMessage({
    defaultMessage: 'IPSG cannot be enabled if Authentication is turned ON.'
  }),
  CLOUD_PORT_CANNOT_ENABLE_FLEX_AUTH: defineMessage({
    defaultMessage: 'Authentication cannot be enabled on the uplink port because it will result in switch losing connection to RUCKUS One.'
  }),
  SWITCH_LEVEL_AUTH_NOT_ENABLED: defineMessage({
    defaultMessage: 'Before enable Authentication on port, please go to Edit Switch page to apply global level\'s Auth Default VLAN.'
  }),
  GUIDE_TO_AUTHENTICATION: defineMessage({
    defaultMessage: 'Go to "Network Control --> Policies and profiles --> Authentication"'
  }),
  SWITCH_PORT_PROFILE_NOT_ENABLED: defineMessage({
    defaultMessage: 'The firmware version on the selected switches must be FI 10.0.20b or higher.'
  }),
  CLOUD_PORT_CANNOT_ENABLE_SWITCH_PORT_PROFILE: defineMessage({
    defaultMessage: 'Port Profile cannot be enabled on the uplink port because it will result in switch losing connection to RUCKUS One.'
  }),
  STP_BPDU_GUARD: defineMessage({
    defaultMessage: 'When STP BPDU Guard is turned on, the system will automatically enable the BPDU Guard in the Error Disable Recovery settings at the switch level : Applicable to firmware versions FI 10.0.10g and later (or) FI 10.0.20b and later'
  }),
  CANNOT_ENABLE_PORT_MAC_SECURITY_WHEN_FLEX_AUTH_ENABLED: defineMessage({
    defaultMessage: 'Port MAC Security cannot be enabled if Authentication is turned ON.'
  }),
  CANNOT_ENABLE_SWITCH_MAC_ACL_WHEN_FLEX_AUTH_ENABLED: defineMessage({
    defaultMessage: 'MAC ACL cannot be enabled if Authentication is turned ON.'
  }),
  CANNOT_ENABLE_FLEX_AUTH_WHEN_PORT_MAC_SECURITY_ENABLED: defineMessage({
    defaultMessage: 'Authentication cannot be enabled if Port MAC Security is turned ON.'
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

export const FlexAuthVlanLabel = {
  AUTH_DEFAULT_VLAN: defineMessage({ defaultMessage: 'Auth Default VLAN' }),
  CRITICAL_VLAN: defineMessage({ defaultMessage: 'Critical VLAN' }),
  DEFAULT_VLAN: defineMessage({ defaultMessage: 'Default VLAN' }),
  GUEST_VLAN: defineMessage({ defaultMessage: 'Guest VLAN' }),
  RESTRICTED_VLAN: defineMessage({ defaultMessage: 'Restricted VLAN' }),
  SWITCH_AUTH_DEFAULT_VLAN: defineMessage({ defaultMessage: 'Switch Level Auth Default VLAN' }),
  TAGGED_VLANS: defineMessage({ defaultMessage: 'Tagged VLANs' }),
  VLAN_ID: defineMessage({ defaultMessage: 'VLAN ID' })
}

export const FlexAuthMessages = {
  CANNOT_SET_DIFF_PROFILE_AUTH_DEFAULT_VLAN: defineMessage({
    defaultMessage: 'Another Auth-Default VLAN is already defined on this switch. Either select a different profile that has a matching Auth-Default VLAN or use the customize option to set the Auth-Default VLAN to {applyProfileAuthDefaultVlan}.'
  }),
  CANNOT_SET_DIFF_GUEST_VLAN_FOR_PROFILE: defineMessage({
    defaultMessage: 'Guest VLAN is already defined on the switch(es). Select a different profile that has a matching Guest VLAN.'
  }),
  CANNOT_SET_DIFF_GUEST_VLAN: defineMessage({
    defaultMessage: 'Guest VLAN is already defined previously and needs to be consistent across all the ports that have authentication enabled.'
  }),
  CANNOT_SET_FORCE_CONTROL_TYPE: defineMessage({
    defaultMessage: 'The Auth Default VLAN is a required setting. When the 802.1x Port Control value is set to Force Authorized or Force Unauthorized, the Auth Default VLAN cannot be configured. If the Auth Default VLAN is needed, please change the 802.1x Port Control to ‘Auto’.'
  }),
  CANNOT_SET_FORCE_CONTROL_TYPE_FOR_PROFILE: defineMessage({
    defaultMessage: 'When the 802.1x Port Control value in the selected profile(s) is set to Force Authorized or Force Unauthorized, the Auth Default VLAN value must match the switch-level Auth Default VLAN.'
  }),
  VLAN_CANNOT_SAME_AS_TARGET_VLAN: defineMessage({
    defaultMessage: '{sourceVlan} can not be the same as {targetVlan}'
  }),
  CANNOT_APPLIED_DIFF_PROFILES: defineMessage({
    defaultMessage: 'The selected ports have different profiles or some of them have no profile selected previously. Apply a common profile to all the selected ports.'
  }),
  CANNOT_APPLIED_DIFF_AUTH_DEFAULT_VLAN: defineMessage({
    defaultMessage: 'The selected ports have different or no Auth Default VLAN set previously. Define a common Auth Default VLAN for the selected ports.'
  })
}

export const PortStatusMessages = {
  SET_AS_TAGGED: defineMessage({
    defaultMessage: 'Port set as tagged'
  }),
  SET_AS_UNTAGGED: defineMessage({
    defaultMessage: 'Port set as untagged'
  }),
  USED_BY_LAG: defineMessage({
    defaultMessage: 'Port is member of LAG – {lagName}'
  }),
  USED_UNTAGGED_VLAN: defineMessage({
    defaultMessage: 'Port is already an untagged member of VLAN {vlanId}'
  }),
  USED_BY_OTHERS: defineMessage({
    defaultMessage: 'Port used by other VLAN setting'
  }),
  USED_BY_AUTH: defineMessage({
    defaultMessage: 'This port has authentication (802.1x and MAC-AUTH) enabled and cannot be manually added to a VLAN'
  }),
  CURRENT: defineMessage({
    defaultMessage: 'VLANs'
  })
}

export const LbsServerProfileMessages = {
  CONNECTION_PROTOCOL_TOOLTIP: defineMessage({
    defaultMessage: 'This server uses Transport Layer Security (TLS) version 1.2 to ensure secure and encrypted communication.'
  })
}

/* eslint-enable */
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
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.SCREEN_SHARING]: defineMessage({ defaultMessage: 'Screen Sharing' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.SECURE_FILE_SHARING]: defineMessage({ defaultMessage: 'Secure File Sharing' }),
  [BridgeServiceEnum.SECURE_SHELL]: defineMessage({ defaultMessage: 'Secure Shell' }),
  [BridgeServiceEnum.WWW_HTTP]: defineMessage({ defaultMessage: 'WWW HTTP' }),
  [BridgeServiceEnum.WWW_HTTPS]: defineMessage({ defaultMessage: 'WWW HTTPs' }),
  [BridgeServiceEnum.XGRID]: defineMessage({ defaultMessage: 'Xgrid' }),
  [BridgeServiceEnum.OTHER]: defineMessage({ defaultMessage: 'Other' })
}

export const EditPropertyConfigMessages = {
  /* eslint-disable max-len */
  DISABLE_PROPERTY_MESSAGE: defineMessage({ defaultMessage: 'This will delete all related configurations and currently connected clients will lose their connectivity to networking services.' }),
  ENABLE_PROPERTY_TOOLTIP: defineMessage({ defaultMessage: 'Switching property management OFF will delete the entire related configuration and will cause clients to lose their networking service.' }),
  BIND_IDENTITY_GROUP_TOOLTIP: defineMessage({ defaultMessage: 'Please note that once property management has been enabled, changing the identity group is not allowed.' })
  /* eslint-enable */
}

export const PropertyUnitMessages = {
  /* eslint-disable max-len */
  RESEND_NOTIFICATION: defineMessage({ defaultMessage: 'The unit assignment SMS and/or Email has been sent to the unit contact.' })
  /* eslint-enable */
}

export const EthernetPortProfileMessages = {
  /* eslint-disable max-len */
  AUTH_TYPE_ROLE_TRUNK: defineMessage({
    defaultMessage: 'Choose Port-based Authenticator if the AP will authenticate devices connecting to it, or Supplicant if the AP needs to be authenticated by an upstream device, e.g.: Switch'
  }),
  AUTH_TYPE_ROLE_ACCESS: defineMessage({
    defaultMessage: 'If multiple devices connect to an AP port, it can be configured as either Port-based or MAC-based Authenticator. In Port-based mode, one authorized MAC grants access to all hosts. In MAC-based mode, each MAC is individually authenticated.'
  }),
  MAC_AUTH_BYPASS: defineMessage({
    defaultMessage: 'If MAC authentication bypass is enabled, the port first attempts to authenticate the attached device by MAC address, and if that fails, it attempts to authenticate the device using 802.1X.'
  }),
  DYNAMIC_VLAN: defineMessage({
    defaultMessage: 'Enable dynamic VLAN assignment if you want the controller to assign VLAN IDs on a per-user basis.'
  }),
  GUEST_VLAN: defineMessage({
    defaultMessage: 'A guest VLAN is used if you want to allow a device that fails authentication to access the Internet but restrict it from accessing internal network resources'
  }),
  USE_RADIUS_PROXY: defineMessage({
    defaultMessage: 'This option requires your access points to run firmware version 7.0.0.400 or higher.'
  })
  /* eslint-enable */
}

export const SwitchPortProfileMessages = {
  MAC_OUI: <FormattedMessage
    defaultMessage={'Click here to lookup MAC OUI at IEEE ({link})'}
    values={{
      link: <a
        className='link'
        target='_blank'
        href={'https://standards-oui.ieee.org'}
        rel='noreferrer'>
        {'https://standards-oui.ieee.org'}
      </a>
    }}
  />,
  LLDP_TLV: defineMessage({
    defaultMessage: 'Define LLDP match criterion - like the System Name and/or Description.'
  }),
  // eslint-disable-next-line max-len
  POE_ENABLED: defineMessage({ defaultMessage: 'When MAC OUI or LLDP TLV is selected for this port profile, PoE cannot be turned off.' }),
  // eslint-disable-next-line max-len
  POE_LABEL: defineMessage({ defaultMessage: 'PoE needs to be enabled in order to assign MAC OUI and LLDP TLV to this profile.' }),
  // eslint-disable-next-line max-len
  MACOUI_POE_DISABLED: defineMessage({ defaultMessage: 'PoE needs to be enabled in order to assign MAC OUI to this profile. ' }),
  // eslint-disable-next-line max-len
  LLDPTLV_POE_DISABLED: defineMessage({ defaultMessage: 'PoE needs to be enabled in order to assign LLDP TLV to this profile. ' }),
  // eslint-disable-next-line max-len
  APPLY_PORT_PROFILE_CHANGE: defineMessage({ defaultMessage: 'Changes to the port profile will get automatically applied to the associated ports.' }),
  // eslint-disable-next-line max-len
  IPSG_ENABLED: defineMessage({ defaultMessage: 'IPSG needs to be disabled in order to enable Ingress ACL, 802.1x and MAC Auth to this profile.' }),
  // eslint-disable-next-line max-len
  INGRESS_ACL_DISABLED: defineMessage({ defaultMessage: 'Ingress ACL cannot be configured if IPSG is turned ON.' }),
  // eslint-disable-next-line max-len
  DOT1X_DISABLED: defineMessage({ defaultMessage: '802.1x cannot be selected if IPSG is turned ON.' }),
  // eslint-disable-next-line max-len
  MAC_AUTH_DISABLED: defineMessage({ defaultMessage: 'MAC Auth cannot be selected if IPSG is turned ON.' })
}

export const ClientIsolationMessages = {
  /* eslint-disable max-len */
  ENABLE_TOGGLE: defineMessage({
    defaultMessage: 'Switching client isolation requires a manual device reboot to take effect. You can select the specific AP devices from the AP list and click the ‘Reboot’ button to restart them.'
  })
}

export const SamlIdpMessages = {
  /* eslint-disable max-len */
  METADATA_TEXTAREA: defineMessage({
    defaultMessage: 'Enter the metadata required for authentication with your identity provider.' +
                   'You can upload an XML file, provide a metadata URL, or enter the codes.'
  }),
  METADATA_TEXTAREA_NOTE: defineMessage({
    defaultMessage: 'Note: Importing metadata from a file will overwrite any existing configuration.'
  }),
  /* eslint-disable max-len */
  SAML_REQUEST_SIGNATURE_TOGGLE: defineMessage({
    defaultMessage: 'When enabled, SAML authentication requests from RUCKUS One will be digitally signed for enhanced security.'
  }),
  /* eslint-disable max-len */
  SAML_RESPONSE_ENCRYPTION_TOGGLE: defineMessage({
    defaultMessage: 'Use a server certificate to enable encrypted SAML responses from identity provider (IdP).'
  }),
  DOWNLOAD_SAML_METADATA: defineMessage({
    defaultMessage: 'Download SAML metadata'
  }),
  UPLOAD_SAML_METADATA: defineMessage({
    defaultMessage: 'Download the SAML metadata file and provide it to the identity provider you are using.'
  }),
  IDENTITY_NAME: defineMessage({
    defaultMessage: 'If "Identity Name" is empty or does not match, it will default to “NameID”.'
  })
}