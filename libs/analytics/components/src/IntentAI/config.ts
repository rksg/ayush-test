/* eslint-disable max-len */
import { defineMessage, MessageDescriptor } from 'react-intl'

import { displayStates, statuses as stateType } from './states'

export type StatusTrail = Array<{ status: stateType, createdAt?: string }>

export enum aiFeatures {
  RRM = 'AI-Driven RRM',
  AirFlexAI = 'AirFlexAI',
  AIOps = 'AI Operations',
  EcoFlexAI = 'EcoFlexAI'
}

export const aiFeaturesLabel = {
  'AI-Driven RRM': defineMessage({ defaultMessage: 'AI-Driven RRM' }),
  [aiFeatures.AirFlexAI]: defineMessage({ defaultMessage: 'AirFlexAI' }),
  [aiFeatures.AIOps]: defineMessage({ defaultMessage: 'AI Operations' }),
  [aiFeatures.EcoFlexAI]: defineMessage({ defaultMessage: 'EcoFlexAI' })
}

type CodeInfo = {
  aiFeature: keyof typeof aiFeaturesLabel,
  intent: MessageDescriptor,
  category: MessageDescriptor
}

type StateInfo = {
  text: MessageDescriptor,
  tooltip: MessageDescriptor
}

const categories = {
  'Wi-Fi Experience': defineMessage({ defaultMessage: 'Wi-Fi Experience' }),
  'Security': defineMessage({ defaultMessage: 'Security' }),
  'Infrastructure': defineMessage({ defaultMessage: 'Infrastructure' }),
  'AP Performance': defineMessage({ defaultMessage: 'AP Performance' })
}

export const states = {
  [displayStates.new]: {
    text: defineMessage({ defaultMessage: 'New' }),
    tooltip: defineMessage({ defaultMessage: 'IntentAI has analyzed the data and generated a change recommendations, awaiting your approval. To review the details, specify Intent priority, and apply the recommendations, click "Optimize." Alternatively, use "1-Click Optimize" to instantly apply the changes with default priority.' })
  },
  [displayStates.scheduled]: {
    text: defineMessage({ defaultMessage: 'Scheduled' }),
    tooltip: defineMessage({ defaultMessage: 'The change recommendation has been scheduled via the user action "Optimize".' }) //TODO: initiated by the user {userName}
  },
  [displayStates.scheduledOneClick]: {
    text: defineMessage({ defaultMessage: 'Scheduled' }),
    tooltip: defineMessage({ defaultMessage: 'The change recommendation has been scheduled via the user action "1-Click Optimize".' }) //TODO: initiated by the user {userName}
  },
  [displayStates.applyScheduled]: {
    text: defineMessage({ defaultMessage: 'Scheduled' }),
    tooltip: defineMessage({ defaultMessage: 'The change recommendation has been automatically scheduled by IntentAI.' })
  },
  [displayStates.applyScheduleInProgress]: {
    text: defineMessage({ defaultMessage: 'Apply In Progress' }),
    tooltip: defineMessage({ defaultMessage: 'IntentAI recommended changes are getting applied to the <VenueSingular></VenueSingular> {zoneName}.' })
  },
  [displayStates.active]: {
    text: defineMessage({ defaultMessage: 'Active' }),
    tooltip: defineMessage({ defaultMessage: 'IntentAI is active and has successfully applied the changes to the <VenueSingular></VenueSingular> {zoneName}.' }) //TODO: The new configuration is: {newConfig}.
  },
  [displayStates.pausedApplyFailed]: {
    text: defineMessage({ defaultMessage: 'Paused, Applied Failed' }),
    tooltip: defineMessage({ defaultMessage: 'IntentAI recommended changes failed to apply to the <VenueSingular></VenueSingular> {zoneName} due to: {errorMessage}. The intent is currently paused. To process new data and generate updated recommendations using ML algorithms, please select the "Resume" action.' })
  },
  [displayStates.revertScheduled]: {
    text: defineMessage({ defaultMessage: 'Revert Scheduled' }),
    tooltip: defineMessage({ defaultMessage: 'The Revert of the IntentAI recommended changes are scheduled for {scheduledAt}, via user action "Revert".' }) //TODO: initiated by the user {userName}
  },
  [displayStates.revertScheduleInProgress]: {
    text: defineMessage({ defaultMessage: 'Revert In Progress' }),
    tooltip: defineMessage({ defaultMessage: 'IntentAI recommended changes are getting reverted, to the earlier configuration, on the <VenueSingular></VenueSingular> {zoneName}.' })
  },
  [displayStates.pausedRevertFailed]: {
    text: defineMessage({ defaultMessage: 'Paused, Revert Failed' }),
    tooltip: defineMessage({ defaultMessage: 'The Revert action on the IntentAI recommended change, failed due to the following reason: {errorMessage}. The intent is currently paused. To process new data and generate updated recommendations using ML algorithms, please select the "Resume" action.' })
  },
  [displayStates.pausedReverted]: {
    text: defineMessage({ defaultMessage: 'Paused, Revert Success' }),
    tooltip: defineMessage({ defaultMessage: 'The intent is currently paused. To process new data and generate updated recommendations using ML algorithms, please select the "Resume" action.' })
  },
  [displayStates.pausedFromInactive]: {
    text: defineMessage({ defaultMessage: 'Paused' }),
    tooltip: defineMessage({ defaultMessage: 'The Intent is paused by the user action "Pause". A Paused Intent will refrain from executing any tasks, including KPI measurement, ML model generations, recommendation generation and configuration changes.' }) //TODO: initiated by the user {userName}
  },
  [displayStates.pausedFromActive]: {
    text: defineMessage({ defaultMessage: 'Paused' }),
    tooltip: defineMessage({ defaultMessage: 'The Intent is paused by the user action "Pause". A Paused Intent will refrain from executing any tasks, including KPI measurement, ML model generations, recommendation generation and configuration changes.' }) //TODO: initiated by the user {userName}
  },
  [displayStates.pausedByDefault]: {
    text: defineMessage({ defaultMessage: 'Paused' }),
    tooltip: defineMessage({ defaultMessage: 'The Intent is in default state of "Paused". A Paused Intent will refrain from executing any tasks, including KPI measurement, ML model generations, recommendation generation and configuration changes.' })
  },
  [displayStates.naConflictingConfiguration]: {
    text: defineMessage({ defaultMessage: 'No Recommendation, Conflicting Configuration' }),
    tooltip: defineMessage({ defaultMessage: 'No recommendation was generated because IntentAI detected conflicting configurations. Conflict: Mesh APs are present in the <VenueSingular></VenueSingular>.' })
  },
  [displayStates.naNoAps]: {
    text: defineMessage({ defaultMessage: 'No Recommendation, No APs' }),
    tooltip: defineMessage({ defaultMessage: 'No recommendation was generated because IntentAI found no APs in the <VenueSingular></VenueSingular> {zoneName}.' })
  },
  [displayStates.naNotEnoughLicense]: {
    text: defineMessage({ defaultMessage: 'No Recommendation, Not Enough License' }),
    tooltip: defineMessage({ defaultMessage: 'No recommendation was generated because IntentAI did not find sufficient licenses for the <VenueSingular></VenueSingular> {zoneName}.' })
  },
  [displayStates.naNotEnoughData]: {
    text: defineMessage({ defaultMessage: 'No Recommendation, Not Enough Data' }),
    tooltip: defineMessage({ defaultMessage: 'No recommendation was generated because IntentAI found less than 4 days of data in the <VenueSingular></VenueSingular> {zoneName}.' })
  },
  [displayStates.naVerified]: {
    text: defineMessage({ defaultMessage: 'Verified' }),
    tooltip: defineMessage({ defaultMessage: 'IntentAI has validated the <VenueSingular></VenueSingular> {zoneName} configurations. No new changes have been recommended.' })
  },
  [displayStates.naWaitingForEtl]: {
    text: defineMessage({ defaultMessage: 'No Recommendation' }),
    tooltip: defineMessage({ defaultMessage: 'No recommendation available. Awaiting data processing and recommendation generation by ML algorithms.' })
  }
} as Record<displayStates, StateInfo>

export const groupedStates = [
  {
    group: defineMessage({ defaultMessage: 'Scheduled' }),
    states: [displayStates.scheduled, displayStates.scheduledOneClick, displayStates.applyScheduled] as unknown as string[]
  },
  {
    group: defineMessage({ defaultMessage: 'Paused' }),
    states: [displayStates.pausedFromInactive, displayStates.pausedFromActive, displayStates.pausedByDefault] as unknown as string[]
  }
]


//For original codes, please refer to libs/analytics/components/src/Recommendations/config.ts
export const codes = {
  'c-bgscan24g-enable': {
    aiFeature: aiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Dynamic vs Static Channel capability on 2.4 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bgscan5g-enable': {
    aiFeature: aiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Dynamic vs Static Channel capability on 5 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bgscan24g-timer': {
    aiFeature: aiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Network Efficiency vs Stability on 2.4 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bgscan5g-timer': {
    aiFeature: aiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Network Efficiency vs Stability on 5 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bgscan6g-timer': {
    aiFeature: aiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Network Efficiency vs Stability on 6 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-dfschannels-enable': {
    aiFeature: aiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Expanded Radar channels vs Limited Channel options' }),
    category: categories['Wi-Fi Experience']
  },
  'c-dfschannels-disable': {
    aiFeature: aiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Radar Interference vs Optimal Channel availability' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bandbalancing-enable': {
    aiFeature: aiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Client Performance vs Compatibility' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bandbalancing-enable-below-61': {
    aiFeature: aiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Client Performance vs Compatibility' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bandbalancing-proactive': {
    aiFeature: aiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Client Distribution vs Compatibility' }),
    category: categories['Wi-Fi Experience']
  },
  'c-aclb-enable': {
    aiFeature: aiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Distributed Wi-Fi Load vs Client Stability' }),
    category: categories['Wi-Fi Experience']
  },
  'i-zonefirmware-upgrade': {
    aiFeature: aiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Secure AP firmware vs Client Device Compatibility' }),
    category: categories.Infrastructure
  },
  'c-txpower-same': {
    aiFeature: aiFeatures.AIOps,
    intent: defineMessage({ defaultMessage: 'Optimize for 5 GHz Radio vs Longer range with 2.4 GHz' }),
    category: categories['Wi-Fi Experience']
  },
  'c-crrm-channel24g-auto': {
    aiFeature: aiFeatures.RRM,
    intent: defineMessage({ defaultMessage: 'Client Density vs. Throughput for 2.4 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-crrm-channel5g-auto': {
    aiFeature: aiFeatures.RRM,
    intent: defineMessage({ defaultMessage: 'Client Density vs. Throughput for 5 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-crrm-channel6g-auto': {
    aiFeature: aiFeatures.RRM,
    intent: defineMessage({ defaultMessage: 'Client Density vs. Throughput for 6 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-probeflex-24g': {
    aiFeature: aiFeatures.AirFlexAI,
    intent: defineMessage({ defaultMessage: 'Time to Connect vs. Client Density for 2.4 GHz' }),
    category: categories['Wi-Fi Experience']
  },
  'c-probeflex-5g': {
    aiFeature: aiFeatures.AirFlexAI,
    intent: defineMessage({ defaultMessage: 'Time to Connect vs. Client Density for 5 GHz' }),
    category: categories['Wi-Fi Experience']
  },
  'c-probeflex-6g': {
    aiFeature: aiFeatures.AirFlexAI,
    intent: defineMessage({ defaultMessage: 'Time to Connect vs. Client Density for 6 GHz' }),
    category: categories['Wi-Fi Experience']
  },
  'eco-flex-code': {
    // TODO: EcoFlexAI code is not defined yet
    aiFeature: aiFeatures.EcoFlexAI,
    intent: defineMessage({ defaultMessage: 'TBD' }),
    category: categories['Wi-Fi Experience']
  }
} as Record<string, CodeInfo>
