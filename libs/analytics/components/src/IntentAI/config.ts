/* eslint-disable max-len */
import { defineMessage, MessageDescriptor } from 'react-intl'

import type { NetworkPath, NodeType, NetworkNode } from '@acx-ui/utils'

import { DisplayStates, Statuses, StatusReasons } from './states'

export type IntentWlan = {
  name: string
  ssid: string
}

export type Metadata = {
  appliedAt: string
  changedByName?: string
  dataEndTime: string
  failures?: (keyof typeof failureCodes)[]
  error?: { details?: Record<string, unknown>[] }
  oneClickOptimize?: boolean
  preferences?: IntentPreferences
  preferencesUpdatedAt?: string
  retries?: number
  scheduledAt: string
  scheduledBy?: string
  unsupportedAPs?: string[]
  updatedAt?: string
  wlans?: IntentWlan[]
}

export type StatusTrailMetadata = Pick<Metadata,
    'changedByName'
  | 'failures'
  | 'scheduledAt'
  | 'retries'
  | 'updatedAt'
>

export type StatusTrail = {
  status: Statuses
  statusReason?: StatusReasons
  displayStatus: DisplayStates
  createdAt: string
  metadata: StatusTrailMetadata & object
}

type IntentPreferences = {
  crrmFullOptimization: boolean;
  excludedHours?: Record<string, number[]>
  averagePowerPrice?: {
    currency: string
    value: number
  }
  excludedAPs?: [NetworkNode[]]
}

export type Intent = {
  id: string
  root: string
  code: string
  sliceId: string
  status: Statuses
  statusReason: StatusReasons
  displayStatus: DisplayStates
  metadata: Metadata & object
  preferences?: IntentPreferences
  sliceType: NodeType
  sliceValue: string
  path: NetworkPath
  idPath: NetworkPath
  statusTrail: StatusTrail[]
  createdAt: string
  updatedAt: string
}

export type IntentListItem = Intent & {
  aiFeature: string
  intent: string
  scope: string
  type?: string
  category: string
  statusLabel: string
}

export enum AiFeatures {
  RRM = 'AI-Driven RRM',
  EquiFlex = 'EquiFlex',
  AIOps = 'AI Operations',
  EcoFlex = 'Energy Saving'
}

export const aiFeaturesLabel = {
  [AiFeatures.RRM]: defineMessage({ defaultMessage: 'AI-Driven RRM' }),
  [AiFeatures.EquiFlex]: defineMessage({ defaultMessage: 'EquiFlex' }),
  [AiFeatures.AIOps]: defineMessage({ defaultMessage: 'AI Operations' }),
  [AiFeatures.EcoFlex]: defineMessage({ defaultMessage: 'Energy Saving' })
}

type CodeInfo = {
  aiFeature: keyof typeof aiFeaturesLabel,
  intent: MessageDescriptor,
  category: MessageDescriptor
}

type StateInfo = {
  text: MessageDescriptor,
  tooltip: MessageDescriptor
  showRetries?: boolean
}

const categories = {
  'Wi-Fi Experience': defineMessage({ defaultMessage: 'Wi-Fi Experience' }),
  'Security': defineMessage({ defaultMessage: 'Security' }),
  'Infrastructure': defineMessage({ defaultMessage: 'Infrastructure' }),
  'AP Performance': defineMessage({ defaultMessage: 'AP Performance' }),
  'Sustainability': defineMessage({ defaultMessage: 'Sustainability' })
}

export const states = {
  [DisplayStates.new]: {
    text: defineMessage({ defaultMessage: 'New' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>IntentAI has analyzed the data and generated a change recommendations, awaiting your approval. To review the details, specify Intent priority, and apply the recommendations, click "Optimize." Alternatively, use "1-Click Optimize" to instantly apply the changes with default priority.</p>
    ` })
  },
  [DisplayStates.scheduled]: {
    text: defineMessage({ defaultMessage: 'Scheduled' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>The change recommendation has been scheduled for {scheduledAt}, via the user action "Optimize" initiated by the user{changedByName, select, undefined {} other { {changedByName}}}.</p>
    ` })
  },
  [DisplayStates.scheduledOneClick]: {
    text: defineMessage({ defaultMessage: 'Scheduled' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>The change recommendation has been scheduled for {scheduledAt}, via the user action "1-Click Optimize" initiated by the user{changedByName, select, undefined {} other { {changedByName}}}.</p>
    ` })
  },
  [DisplayStates.applyScheduled]: {
    text: defineMessage({ defaultMessage: 'Scheduled' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>The change recommendation has been automatically scheduled for {scheduledAt}, by IntentAI.</p>
    ` })
  },
  [DisplayStates.applyScheduleInProgress]: {
    text: defineMessage({ defaultMessage: 'Apply In Progress' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>IntentAI recommended changes are getting applied to <VenueSingular></VenueSingular> {zoneName}.</p>
    ` })
  },
  [DisplayStates.active]: {
    text: defineMessage({ defaultMessage: 'Active' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>IntentAI is active on <VenueSingular></VenueSingular> {zoneName}.</p>
    ` }) //TODO: The new configuration is: {newConfig}.
  },
  [DisplayStates.pausedApplyFailed]: {
    showRetries: true,
    text: defineMessage({ defaultMessage: 'Paused, Apply Failed' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>IntentAI recommended changes failed to apply to <VenueSingular></VenueSingular> {zoneName} due to:</p>
      {errorMessage}
      <p>The intent is currently paused. To process new data and generate updated recommendations using ML algorithms, please select the "Resume" action.</p>
    ` })
  },
  [DisplayStates.revertScheduled]: {
    text: defineMessage({ defaultMessage: 'Revert Scheduled' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>The Revert of the IntentAI recommended changes are scheduled for {scheduledAt}, via user action "Revert" initiated by the user{changedByName, select, undefined {} other { {changedByName}}}.</p>
    ` })
  },
  [DisplayStates.revertScheduleInProgress]: {
    text: defineMessage({ defaultMessage: 'Revert In Progress' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>IntentAI recommended changes are getting reverted, to the earlier configuration, on <VenueSingular></VenueSingular> {zoneName}.</p>
    ` })
  },
  [DisplayStates.pausedRevertFailed]: {
    text: defineMessage({ defaultMessage: 'Paused, Revert Failed' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>The Revert action on the IntentAI recommended change, failed due to the following reason:</p>
      {errorMessage}
      <p>The intent is currently paused. To process new data and generate updated recommendations using ML algorithms, please select the "Resume" action.</p>
    ` })
  },
  [DisplayStates.pausedReverted]: {
    text: defineMessage({ defaultMessage: 'Paused, Revert Success' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>The intent is currently paused. To process new data and generate updated recommendations using ML algorithms, please select the "Resume" action.</p>
    ` })
  },
  [DisplayStates.pausedFromInactive]: {
    text: defineMessage({ defaultMessage: 'Paused' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>The Intent is paused by the user action "Pause" initiated by the user{changedByName, select, undefined {} other { {changedByName}}}. A Paused Intent will refrain from executing any tasks, including KPI measurement, ML model generations, recommendation generation and configuration changes.</p>
    ` })
  },
  [DisplayStates.pausedFromActive]: {
    text: defineMessage({ defaultMessage: 'Paused' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>The Intent is paused by the user action "Pause" initiated by the user{changedByName, select, undefined {} other { {changedByName}}}. A Paused Intent will refrain from executing any tasks, including KPI measurement, ML model generations, recommendation generation and configuration changes.</p>
    ` })
  },
  [DisplayStates.pausedByDefault]: {
    text: defineMessage({ defaultMessage: 'Paused' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>The Intent is in default state of "Paused". A Paused Intent will refrain from executing any tasks, including KPI measurement, ML model generations, recommendation generation and configuration changes.</p>
    ` })
  },
  [DisplayStates.naConflictingConfiguration]: {
    text: defineMessage({ defaultMessage: 'No Recommendation, Conflicting Configuration' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>No recommendation was generated. Reason:</p>
      {errorMessage}
    ` })
  },
  [DisplayStates.naNoAps]: {
    text: defineMessage({ defaultMessage: 'No Recommendation, No APs' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>No recommendation was generated. Reason:</p>
      <ul>
        <li> No APs are detected in the network.</li>
      </ul>
    ` })
  },
  [DisplayStates.naNotEnoughLicense]: {
    text: defineMessage({ defaultMessage: 'No Recommendation, Not Enough License' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>No recommendation was generated because IntentAI did not find sufficient licenses for <VenueSingular></VenueSingular> {zoneName}.</p>
    ` })
  },
  [DisplayStates.naNotEnoughData]: {
    text: defineMessage({ defaultMessage: 'No Recommendation, Not Enough Data' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>No recommendation was generated. Reason:</p>
      {errorMessage}
    ` })
  },
  [DisplayStates.naVerified]: {
    text: defineMessage({ defaultMessage: 'Verified' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>IntentAI has validated <VenueSingular></VenueSingular> {zoneName} configurations. No new changes have been recommended.</p>
    ` })
  },
  [DisplayStates.naWaitingForEtl]: {
    text: defineMessage({ defaultMessage: 'No Recommendation' }),
    tooltip: defineMessage({ defaultMessage: `
      <p>No recommendation was generated. Reason: Awaiting data processing and recommendation generation by ML algorithms.</p>
    ` })
  }
} as Record<DisplayStates, StateInfo>

export const groupedStates = [
  {
    group: defineMessage({ defaultMessage: 'Scheduled' }),
    states: [DisplayStates.scheduled, DisplayStates.scheduledOneClick, DisplayStates.applyScheduled]
  },
  {
    group: defineMessage({ defaultMessage: 'Paused' }),
    states: [DisplayStates.pausedFromInactive, DisplayStates.pausedFromActive, DisplayStates.pausedByDefault]
  }
]

export const stateToGroupedStates = groupedStates.reduce((grouped, { group, states }) => {
  states.forEach(state => grouped[state] = { key: states.join('+'), group })
  return grouped
}, {} as Record<DisplayStates, { key: string, group: MessageDescriptor }>)

export const failureCodes = {
  'auto-cell-sizing-24g-disabled': defineMessage({ defaultMessage: 'Auto Cell Sizing needs to be disabled for 2.4Ghz radio.' }),
  'auto-cell-sizing-5g-disabled': defineMessage({ defaultMessage: 'Auto Cell Sizing needs to be disabled for 5Ghz radio.' }),
  'band-balancing-enabled': defineMessage({ defaultMessage: 'Band Balancing needs to be enabled on this network.' }),
  'bg-scan-24g-enabled': defineMessage({ defaultMessage: 'Background Scanning needs to be enabled for 2.4Ghz radio.' }),
  'bg-scan-5g-enabled': defineMessage({ defaultMessage: 'Background Scanning needs to be enabled for 5Ghz radio.' }),
  'bg-scan-6g-enabled': defineMessage({ defaultMessage: 'Background Scanning needs to be enabled for 6Ghz radio.' }),
  'bg-scan-enabled-on-any-radio': defineMessage({ defaultMessage: 'Background Scanning needs to be enabled on one or more radios.' }),
  'channel-5g-is-auto': defineMessage({ defaultMessage: 'The 5GHz radio channel is expected to be Auto.' }),
  'channel-select-24g-is-channel-fly-or-bg-scan': defineMessage({ defaultMessage: 'Auto Channel Selection for 2.4Ghz radio needs to be set to Channel Fly or Background (BG) Scan.' }),
  'channel-select-5g-is-channel-fly-or-bg-scan': defineMessage({ defaultMessage: 'Auto Channel Selection for 5Ghz radio needs to be set to Channel Fly or Background (BG) Scan.' }),
  'channel-select-6g-is-channel-fly-or-bg-scan': defineMessage({ defaultMessage: 'Auto Channel Selection for 6Ghz radio needs to be set to Channel Fly or Background (BG) Scan.' }),
  'compare-tx-power-24g-with-min-other-bands': defineMessage({ defaultMessage: 'No further TxPower changes required on the radios.' }),
  'deleted-zone': defineMessage({ defaultMessage: 'Unable to read <venueSingular></venueSingular> configuration.' }),
  'dual-5g-disabled-or-no-R760': defineMessage({ defaultMessage: 'The network has one or more R760 APs with dual 5GHz radios, which are not currently supported.' }),
  'for-country-us': defineMessage({ defaultMessage: 'The network\'s country code is set to a region other than the US, which is not supported.' }),
  'invalid-aggregation-interval': defineMessage({ defaultMessage: 'SmartZone data interval is too long; recommended interval is 3 minutes or less.' }),
  'no-ap-mesh-checker': defineMessage({ defaultMessage: 'The network has active Mesh APs, which are currently not supported.' }),
  'no-ap-peer-data': defineMessage({ defaultMessage: 'Insufficient data on neighbour APs.' }),
  'no-aps': defineMessage({ defaultMessage: 'No APs are detected in the network.' }),
  'no-channel-range-for-aps': defineMessage({ defaultMessage: 'Insufficient channel range data for one or more APs.' }),
  'no-neighbourhood-data': defineMessage({ defaultMessage: 'AP neighbor information is currently unavailable for this network.' }),
  'no-rssi-data': defineMessage({ defaultMessage: 'Not enough Wi-Fi clients detected in the network.' }),
  'not-fully-licensed': defineMessage({ defaultMessage: 'The network contains unlicensed APs.' }),
  'probeflex-support-fw-version': defineMessage({ defaultMessage: 'AP firmware version is unsupported.' }),
  'sufficient-aps-crrm': defineMessage({ defaultMessage: 'The network has an insufficient number of APs to meet the minimum requirements.' }),
  'sufficient-aps-pf': defineMessage({ defaultMessage: 'The network has an insufficient number of APs to meet the minimum requirements.' }),
  'sz-version-and-zone-name-checker': defineMessage({ defaultMessage: 'Unsupported SmartZone version or restricted Zone configuration detected.' }),
  'zone-version-is-equal-to-sz-version': defineMessage({ defaultMessage: 'Detected a mismatch between the Zone firmware version and the SmartZone version.' })
}

export const codes = {
  'c-bgscan24g-enable': {
    aiFeature: AiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Dynamic vs Static Channel capability on 2.4 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bgscan5g-enable': {
    aiFeature: AiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Dynamic vs Static Channel capability on 5 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bgscan24g-timer': {
    aiFeature: AiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Network Efficiency vs Stability on 2.4 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bgscan5g-timer': {
    aiFeature: AiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Network Efficiency vs Stability on 5 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bgscan6g-timer': {
    aiFeature: AiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Network Efficiency vs Stability on 6 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-dfschannels-enable': {
    aiFeature: AiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Expanded Radar channels vs Limited Channel options' }),
    category: categories['Wi-Fi Experience']
  },
  'c-dfschannels-disable': {
    aiFeature: AiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Radar Interference vs Optimal Channel availability' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bandbalancing-enable': {
    aiFeature: AiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Client Performance vs Compatibility' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bandbalancing-enable-below-61': {
    aiFeature: AiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Client Performance vs Compatibility' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bandbalancing-proactive': {
    aiFeature: AiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Client Distribution vs Compatibility' }),
    category: categories['Wi-Fi Experience']
  },
  'c-aclb-enable': {
    aiFeature: AiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Distributed Wi-Fi Load vs Client Stability' }),
    category: categories['Wi-Fi Experience']
  },
  'i-zonefirmware-upgrade': {
    aiFeature: AiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Secure AP firmware vs Client Device Compatibility' }),
    category: categories.Infrastructure
  },
  'c-txpower-same': {
    aiFeature: AiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Optimize for 5 GHz Radio vs Longer range with 2.4 GHz' }),
    category: categories['Wi-Fi Experience']
  },
  'c-crrm-channel24g-auto': {
    aiFeature: AiFeatures.RRM,
    intent: defineMessage({ defaultMessage: 'Client Density vs Throughput for 2.4 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-crrm-channel5g-auto': {
    aiFeature: AiFeatures.RRM,
    intent: defineMessage({ defaultMessage: 'Client Density vs Throughput for 5 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-crrm-channel6g-auto': {
    aiFeature: AiFeatures.RRM,
    intent: defineMessage({ defaultMessage: 'Client Density vs Throughput for 6 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-probeflex-24g': {
    aiFeature: AiFeatures.EquiFlex,
    intent: defineMessage({ defaultMessage: 'Time to Connect vs Client Density for 2.4 GHz' }),
    category: categories['Wi-Fi Experience']
  },
  'c-probeflex-5g': {
    aiFeature: AiFeatures.EquiFlex,
    intent: defineMessage({ defaultMessage: 'Time to Connect vs Client Density for 5 GHz' }),
    category: categories['Wi-Fi Experience']
  },
  'c-probeflex-6g': {
    aiFeature: AiFeatures.EquiFlex,
    intent: defineMessage({ defaultMessage: 'Time to Connect vs Client Density for 6 GHz' }),
    category: categories['Wi-Fi Experience']
  },
  'i-ecoflex': {
    aiFeature: AiFeatures.EcoFlex,
    intent: defineMessage({ defaultMessage: 'Energy Footprint vs Mission Criticality' }),
    category: categories.Sustainability
  }
} as Record<string, CodeInfo>
