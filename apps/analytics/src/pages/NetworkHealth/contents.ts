/* eslint-disable max-len */
import React from 'react'

import { MessageDescriptor, defineMessage } from 'react-intl'

import {
  ClientType,
  TestStage,
  TestType
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

export const testTypes = {
  [TestType.OnDemand]: defineMessage({ defaultMessage: 'On-Demand' }),
  [TestType.Scheduled]: defineMessage({ defaultMessage: 'Scheduled' })
}

export const unsupportedAuthMethods = {
  [ClientType.VirtualClient]: defineMessage({ defaultMessage: `
    <p>The following are not supported:</p>
    <ul>
      <li>802.1X with EAP-TLS and EAP-SIM</li>
      <li>Authentication with WEP/WPA3 security protocol</li>
      <li>Captive portal</li>
      <li>Cloudpath</li>
      <li>DPSK</li>
    </ul>
  ` }),
  [ClientType.VirtualWirelessClient]: defineMessage({ defaultMessage: `
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

export const apsSelectionTooltip = defineMessage({
  defaultMessage: `<p>
    802.11ac wave 1 APs and older are not supported.
    Only supported AP models are shown in the list below.
    For details, please refer to the release notes.
  </p>`
})

export const messageMapping = {
  RUN_TEST_NO_APS: defineMessage({ defaultMessage: 'There are no APs to run the test' }),
  SPEC_NOT_FOUND: defineMessage({ defaultMessage: 'Network Health test does not exist' }),
  TEST_NOT_FOUND: defineMessage({ defaultMessage: 'Network Health test does not exist' }),
  INTERNAL_SERVER_ERROR: defineMessage({ defaultMessage: 'Internal Server Error' }),
  TEST_IN_PROGRESS: defineMessage({ defaultMessage: 'Test is in progress' }),
  EDIT_NOT_ALLOWED: defineMessage({ defaultMessage: 'Only the creator of the test is allowed to edit' }),
  DUPLICATE_NAME_NOT_ALLOWED: defineMessage({ defaultMessage: 'Duplicate test name exist' }),
  TEST_CREATED: defineMessage({ defaultMessage: 'Network Health test created' }),
  TEST_UPDATED: defineMessage({ defaultMessage: 'Network Health test updated' }),
  TEST_DELETED: defineMessage({ defaultMessage: 'Network Health test deleted' }),
  RUN_TEST_SUCCESS: defineMessage({ defaultMessage: 'Network Health test running' })
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
