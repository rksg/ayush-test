/* eslint-disable max-len */
import React from 'react'

import { MessageDescriptor, defineMessage } from 'react-intl'

import { get } from '@acx-ui/config'

import {
  ClientType,
  TestStage,
  TestType,
  ScheduleFrequency
} from './types'

import type { Props as FormattedMessageProps } from 'react-intl/lib/src/components/message'

export const formatValues: FormattedMessageProps['values'] = {
  ul: (chunks) => React.createElement('ul', { children: chunks }),
  li: (chunks) => React.createElement('li', { children: chunks }),
  p: (chunks) => React.createElement('p', { children: chunks })
}

export const steps = {
  settings: defineMessage({ defaultMessage: 'Settings' }),
  apsSelection: defineMessage({ defaultMessage: 'APs Selection' }),
  summary: defineMessage({ defaultMessage: 'Summary' })
}

export const clientTypes = {
  [ClientType.VirtualClient]: defineMessage({ defaultMessage: 'Virtual Client' }),
  [ClientType.VirtualWirelessClient]: defineMessage({ defaultMessage: 'Virtual Wireless Client' })
}

export const testTypes: Record<string, MessageDescriptor> = {
  [TestType.OnDemand]: defineMessage({ defaultMessage: 'On-Demand' }),
  [TestType.Scheduled]: defineMessage({ defaultMessage: 'Scheduled' })
}

export const testTypesWithSchedule: Record<string, MessageDescriptor> = {
  [TestType.OnDemand]: defineMessage({ defaultMessage: 'On-Demand' }),
  [ScheduleFrequency.Daily]: defineMessage({ defaultMessage: 'Daily' }),
  [ScheduleFrequency.Weekly]: defineMessage({ defaultMessage: 'Weekly' }),
  [ScheduleFrequency.Monthly]: defineMessage({ defaultMessage: 'Monthly' })
}

export const unsupportedAuthMethods = {
  [ClientType.VirtualClient]: get('IS_MLISA_SA') ? defineMessage({ defaultMessage: `
    <p>The following are not supported:</p>
    <ul>
      <li>802.1X with EAP-TLS and EAP-SIM</li>
      <li>Authentication with WEP/WPA3 encryption</li>
      <li>DPSK</li>
      <li>Hotspot 2.0 Access/Onboarding</li>
      <li>MAC authentication</li>
      <li>OWE</li>
      <li>Social Media Login</li>
      <li>WeChat</li>
      <li>WISPr with external service provider</li>
    </ul>
  ` }) : defineMessage({ defaultMessage: `
    <p>The following are not supported:</p>
    <ul>
      <li>802.1X with EAP-TLS and EAP-SIM</li>
      <li>Authentication with WEP/WPA3 security protocol</li>
      <li>Captive portal</li>
      <li>Cloudpath</li>
      <li>DPSK</li>
    </ul>
  ` }),
  [ClientType.VirtualWirelessClient]: get('IS_MLISA_SA') ? defineMessage({ defaultMessage: `
    <p>The following are not supported:</p>
    <ul>
      <li>802.1X with WPA3, EAP-TLS and EAP-SIM</li>
      <li>WEP encryption</li>
      <li>WPA2/WPA3-Mixed and WPA3 encryption (except when station AP has 3 radios e.g. R760)</li>
      <li>DPSK</li>
      <li>Hotspot 2.0 Access/Onboarding</li>
      <li>MAC authentication</li>
      <li>OWE</li>
      <li>Social Media Login</li>
      <li>WeChat</li>
      <li>WISPr with external service provider</li>
    </ul>
  ` }) : defineMessage({ defaultMessage: `
    <p>The following are not supported:</p>
    <ul>
      <li>802.1X with WPA3, EAP-TLS and EAP-SIM</li>
      <li>WEP encryption</li>
      <li>WPA3/WPA2 mixed mode and WPA3 encryption (except when station AP has 3 radios e.g. R760)</li>
      <li>Captive portal</li>
      <li>Cloudpath</li>
      <li>DPSK</li>
    </ul>
  ` })
}

export const clientTypeTooltip = defineMessage({
  defaultMessage: `
    <p>Service Validation now supports 2 options - Virtual Client and Virtual Wireless Client.</p>

    <p>For the Virtual Client option, the target AP to be tested will itself emulate as a WiFi client
    and test the connection stages, without any actual RF transmission over the air.
    The benefit of this option is that Service Validation tests for the non-wireless portion
    of the network (e.g. DHCP, RADIUS, DNS, etc.) can be simultaneously tested quickly over a
    large number of APs with no impact on existing WiFi services.</p>

    <p>For the Virtual Wireless Client option, there will be actual RF transmissions over the air.
    For every target AP to be tested, a corresponding "station AP" will be selected.
    The station AP is a neigbouring AP with the best signal strength, and during the test,
    this station AP will behave as a station (i.e. a WiFi client) and wirelessly connect to the
    target AP, just like a regular WiFi client, for the test. The benefit of this option is that
    the Service Validation test will comprehensively cover both the wireless and wired portion of
    the network. However, during this test, the station AP may need to switch its operating channel
    to be the same as the target AP. This change in channel may cause some disruptions to the end
    user WiFi experience (e.g. during video calls). Thus, when Virtual Wireless Client is selected,
    the test procedure will be done one AP at a time to minimize disruption to the network, resulting
    in a longer test duration compared to the Virtual Client option.</p>
  `
})

export const scheduleMonthlyTooltip = defineMessage({
  defaultMessage: `
    Schedule will fall on last day of the month if 29th, 30th or 31st is selected
    and the month does not have these days.
  `
})

export const apsSelectionTooltip: Record<ClientType, MessageDescriptor | undefined> = {
  [ClientType.VirtualClient]: get('IS_MLISA_SA') ? defineMessage({
    defaultMessage: `<p>
      Service Validation (Virtual Client) is only supported in SmartZone v{requiredSZVersion} and above.
      802.11ac wave 1 APs and older are not supported. For details, please refer to the release notes.
      Only supported SmartZone versions and AP models are shown in the list below.
    </p>`
  }) : defineMessage({
    defaultMessage: `<p>
      802.11ac wave 1 APs and older are not supported.
      Only supported AP models are shown in the list below.
      For details, please refer to the release notes.
    </p>`
  }),
  [ClientType.VirtualWirelessClient]: get('IS_MLISA_SA') ? defineMessage({
    defaultMessage: `<p>
      Service Validation (Virtual Wireless Client) is only supported in SmartZone v{requiredSZVersion} and above.
      AP firmware v{requiredAPFirmware} and above is required.
      For details, please refer to the release notes.
      Only supported SmartZone versions and AP firmware/models are shown in the list below.
    </p>`
  }) : undefined
}

export const messageMapping = {
  RUN_TEST_NO_APS: defineMessage({ defaultMessage: 'There are no APs to run the test' }),
  SPEC_NOT_FOUND: defineMessage({ defaultMessage: 'Service Validation test does not exist' }),
  TEST_NOT_FOUND: defineMessage({ defaultMessage: 'Service Validation test does not exist' }),
  INTERNAL_SERVER_ERROR: defineMessage({ defaultMessage: 'Internal Server Error' }),
  TEST_IN_PROGRESS: defineMessage({ defaultMessage: 'Test is in progress' }),
  EDIT_NOT_ALLOWED: defineMessage({ defaultMessage: 'Only the creator of the test is allowed to edit' }),
  DUPLICATE_NAME_NOT_ALLOWED: defineMessage({ defaultMessage: 'Duplicate test name exist' }),
  TEST_CREATED: defineMessage({ defaultMessage: 'Service Validation test created' }),
  TEST_UPDATED: defineMessage({ defaultMessage: 'Service Validation test updated' }),
  TEST_DELETED: defineMessage({ defaultMessage: 'Service Validation test deleted' }),
  TEST_CLONED: defineMessage({ defaultMessage: 'Service Validation test cloned' }),
  RUN_TEST_SUCCESS: defineMessage({ defaultMessage: 'Service Validation test running' })
}

export const stages: Record<TestStage, MessageDescriptor> = {
  auth: defineMessage({ defaultMessage: '802.11 Auth', description: '802.11 Authentication' }),
  assoc: defineMessage({ defaultMessage: 'Association' }),
  eap: defineMessage({ defaultMessage: 'EAP' }),
  radius: defineMessage({ defaultMessage: 'RADIUS' }),
  dhcp: defineMessage({ defaultMessage: 'DHCP' }),
  userAuth: defineMessage({ defaultMessage: 'L3 Authentication' }),
  dns: defineMessage({ defaultMessage: 'DNS' }),
  ping: defineMessage({ defaultMessage: 'Ping' }),
  traceroute: defineMessage({ defaultMessage: 'Traceroute' }),
  speedTest: defineMessage({ defaultMessage: 'Speed Test' })
}

type errorMapValue = { id : number , text : MessageDescriptor }
export const stagesErrorMappings: Record<string,errorMapValue>= {

  SPEED_TEST_INVALID: {
    id: -3,
    text: defineMessage({ defaultMessage: 'Speed test timeout' })
  },
  SPEED_TEST_UNSUCCESSFUL: {
    id: -2,
    text: defineMessage({ defaultMessage: 'Speed test unsuccessful' })
  },
  SPEED_TEST_TIMEOUT: {
    id: -1,
    text: defineMessage({ defaultMessage: 'Speed test timeout' })
  },
  NO_ERROR: {
    id: 0,
    text: defineMessage({ defaultMessage: 'No error' })
  },
  SPEED_TEST_SKIPPED_UE_TUNNEL_SAME_SUBNET: {
    id: 1,
    text: defineMessage({ defaultMessage: 'Speed test skipped as virtual client and data plane mapped to tunnel WLAN are in same subnet and is not supported' })
  },
  SPEED_TEST_SKIPPED_UE_SZ_SAME_SUBNET: {
    id: 2,
    text: defineMessage({ defaultMessage: 'Speed test skipped as virtual client and AP management interface are in same subnet and is not supported' })
  }
}

export const errorMappings : Record<string, errorMapValue> = {
  AP_6GHZ_NOT_SUPPORT: {
    id: -6,
    text: defineMessage({ defaultMessage: '6 GHz is not supported by target AP' })
  },
  NO_SERIAL: {
    id: -5,
    text: defineMessage({ defaultMessage: 'Unable to find AP serial' })
  },
  TEST_TIMEOUT: {
    id: -4,
    text: defineMessage({ defaultMessage: 'Test timeout' })
  },
  STATION_CANNOT_FIND_TARGET: {
    id: -3,
    text: defineMessage({ defaultMessage: 'Station AP unable to find target AP' })
  },
  NO_TARGET_AP: {
    id: -2,
    text: defineMessage({ defaultMessage: 'No traffic on target AP in the last 7 days (try again after WLANs are configured)' })
  },
  NO_STATION_AP: {
    id: -1,
    text: defineMessage({ defaultMessage: 'Unable to find station AP' })
  },
  NO_ERROR: {
    id: 0,
    text: defineMessage({ defaultMessage: 'No error' })
  },
  AP_OFFLINE: {
    id: 1,
    text: defineMessage({ defaultMessage: 'AP offline' })
  },
  AP_RESPONSE_TIMEOUT: {
    id: 2,
    text: defineMessage({ defaultMessage: 'AP response timeout' })
  },
  AP_MODEL_NOT_SUPPORT: {
    id: 3,
    text: defineMessage({ defaultMessage: 'AP not ready for test' })
  },
  OVER_VRUE_CAPACITY: {
    id: 4,
    text: defineMessage({ defaultMessage: 'Another test in progress' })
  },
  WLAN_CONF_ERROR: {
    id: 5,
    text: defineMessage({ defaultMessage: 'WLAN configuration errors' })
  },
  SPEED_TEST_LIMITATION: {
    id: 6,
    text: defineMessage({ defaultMessage: 'Another speed test in progress' })
  },
  SG_APCONFIG_UNSUPPORT: {
    id: 7,
    text: defineMessage({ defaultMessage: 'AP configuration not supported (refer to release notes)' })
  }
}

export const noFailureDetailsMap = {
  PROCESSING: defineMessage({ defaultMessage: 'Failure reason pending' }),
  UNKNOWN: defineMessage({ defaultMessage: 'Failure reason unavailable' })
}
