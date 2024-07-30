/* eslint-disable max-len */
import { defineMessage, MessageDescriptor } from 'react-intl'

import { statusReasons, statuses as stateType } from './states'

export type StatusTrail = Array<{ status: stateType, createdAt?: string }>

export const aiFeaturesLabel = {
  'AI-Driven RRM': defineMessage({ defaultMessage: 'AI-Driven RRM' }),
  'AirFlexAI': defineMessage({ defaultMessage: 'AirFlexAI' }),
  'AI Operations': defineMessage({ defaultMessage: 'AI Operations' }),
  'EcoFlexAI': defineMessage({ defaultMessage: 'EcoFlexAI' })
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
  [statusReasons.new]: {
    text: defineMessage({ defaultMessage: 'New' }),
    tooltip: defineMessage({ defaultMessage: 'IntentAI has analyzed the data and generated a change recommendations, awaiting your approval. To review the details, specify Intent priority, and apply the recommendations, click "Optimize." Alternatively, use "1-Click Optimize" to instantly apply the changes with default priority.' })
  },
  [statusReasons.scheduled]: {
    text: defineMessage({ defaultMessage: 'Scheduled' }),
    tooltip: defineMessage({ defaultMessage: 'The change recommendation has been scheduled via the user action "Optimize".' }) //TODO: initiated by the user {userName}
  },
  [statusReasons.scheduledOneClick]: {
    text: defineMessage({ defaultMessage: 'Scheduled' }),
    tooltip: defineMessage({ defaultMessage: 'The change recommendation has been scheduled via the user action "1-Click Optimize".' }) //TODO: initiated by the user {userName}
  },
  [statusReasons.applyScheduled]: {
    text: defineMessage({ defaultMessage: 'Scheduled' }),
    tooltip: defineMessage({ defaultMessage: 'The change recommendation has been automatically scheduled by IntentAI.' })
  },
  [statusReasons.applyScheduleInProgress]: {
    text: defineMessage({ defaultMessage: 'Apply In Progress' }),
    tooltip: defineMessage({ defaultMessage: 'IntentAI recommended changes are getting applied to the zone {zoneName}.' })
  },
  [statusReasons.active]: {
    text: defineMessage({ defaultMessage: 'Active' }),
    tooltip: defineMessage({ defaultMessage: 'IntentAI is active and has successfully applied the changes to the zone {zoneName}.' }) //TODO: The new configuration is: {newConfig}.
  },
  [statusReasons.pausedApplyFailed]: {
    text: defineMessage({ defaultMessage: 'Paused, Applied Failed' }),
    tooltip: defineMessage({ defaultMessage: 'IntentAI recommended changes failed to apply to the zone {zoneName} due to: {errorMessage}. The intent is currently paused. To process new data and generate updated recommendations using ML algorithms, please select the "Resume" action.' })
  },
  [statusReasons.revertScheduled]: {
    text: defineMessage({ defaultMessage: 'Revert Scheduled' }),
    tooltip: defineMessage({ defaultMessage: 'The Revert of the IntentAI recommended changes are scheduled for {scheduledAt}, via user action "Revert".' }) //TODO: initiated by the user {userName}
  },
  [statusReasons.revertScheduleInProgress]: {
    text: defineMessage({ defaultMessage: 'Revert In Progress' }),
    tooltip: defineMessage({ defaultMessage: 'IntentAI recommended changes are getting reverted, to the earlier configuration, on the zone {zoneName}.' })
  },
  [statusReasons.pausedRevertFailed]: {
    text: defineMessage({ defaultMessage: 'Paused, Revert Failed' }),
    tooltip: defineMessage({ defaultMessage: 'The Revert action on the IntentAI recommended change, failed due to the following reason: {errorMessage}. The intent is currently paused. To process new data and generate updated recommendations using ML algorithms, please select the "Resume" action.' })
  },
  [statusReasons.pausedReverted]: {
    text: defineMessage({ defaultMessage: 'Paused, Revert Success' }),
    tooltip: defineMessage({ defaultMessage: 'The intent is currently paused. To process new data and generate updated recommendations using ML algorithms, please select the "Resume" action.' })
  },
  [statusReasons.paused]: {
    text: defineMessage({ defaultMessage: 'Paused' }),
    tooltip: defineMessage({ defaultMessage: 'The Intent is paused by the user action "Pause". A Paused Intent will refrain from executing any tasks, including KPI measurement, ML model generations, recommendation generation and configuration changes.' }) //TODO: initiated by the user {userName}
  },
  [statusReasons.pausedFromActive]: {
    text: defineMessage({ defaultMessage: 'Paused' }),
    tooltip: defineMessage({ defaultMessage: 'The Intent is paused by the user action "Pause". A Paused Intent will refrain from executing any tasks, including KPI measurement, ML model generations, recommendation generation and configuration changes.' }) //TODO: initiated by the user {userName}
  },
  [statusReasons.pausedByDefault]: {
    text: defineMessage({ defaultMessage: 'Paused' }),
    tooltip: defineMessage({ defaultMessage: 'The Intent is in default state of "Paused". A Paused Intent will refrain from executing any tasks, including KPI measurement, ML model generations, recommendation generation and configuration changes.' })
  },
  [statusReasons.naConflictingConfiguration]: {
    text: defineMessage({ defaultMessage: 'No recommendation, Conflicting Configuration' }),
    tooltip: defineMessage({ defaultMessage: 'No recommendation was generated because IntentAI detected conflicting configurations. Conflict: Mesh APs are present in the zone.' })
  },
  [statusReasons.naNoAps]: {
    text: defineMessage({ defaultMessage: 'No recommendation, No APs' }),
    tooltip: defineMessage({ defaultMessage: 'No recommendation was generated because IntentAI found no APs in the zone {zoneName}.' })
  },
  [statusReasons.naNotEnoughLicense]: {
    text: defineMessage({ defaultMessage: 'No recommendation, Not enough license' }),
    tooltip: defineMessage({ defaultMessage: 'No recommendation was generated because IntentAI did not find sufficient licenses for the zone {zoneName}.' })
  },
  [statusReasons.naNotEnoughData]: {
    text: defineMessage({ defaultMessage: 'No recommendation, Not enough data' }),
    tooltip: defineMessage({ defaultMessage: 'No recommendation was generated because IntentAI found less than 4 days of data in the zone {zoneName}.' })
  },
  [statusReasons.naVerified]: {
    text: defineMessage({ defaultMessage: 'Verified' }),
    tooltip: defineMessage({ defaultMessage: 'IntentAI has validated zone {zoneName} configurations. No new changes have been recommended.' })
  },
  [statusReasons.naWaitingForEtl]: {
    text: defineMessage({ defaultMessage: 'No recommendation' }),
    tooltip: defineMessage({ defaultMessage: 'No recommendation available. Awaiting data processing and recommendation generation by ML algorithms.' })
  }
} as Record<statusReasons, StateInfo>

//For original codes, please refer to libs/analytics/components/src/Recommendations/config.ts
export const codes = {
  'c-bgscan24g-enable': {
    aiFeature: 'AI Operations',
    intent: defineMessage({ defaultMessage: 'Dynamic vs Static Channel capability on 2.4 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bgscan5g-enable': {
    aiFeature: 'AI Operations',
    intent: defineMessage({ defaultMessage: 'Dynamic vs Static Channel capability on 5 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bgscan24g-timer': {
    aiFeature: 'AI Operations',
    intent: defineMessage({ defaultMessage: 'Network Efficiency vs Stability on 2.4 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bgscan5g-timer': {
    aiFeature: 'AI Operations',
    intent: defineMessage({ defaultMessage: 'Network Efficiency vs Stability on 5 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bgscan6g-timer': {
    aiFeature: 'AI Operations',
    intent: defineMessage({ defaultMessage: 'Network Efficiency vs Stability on 6 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-dfschannels-enable': {
    aiFeature: 'AI Operations',
    intent: defineMessage({ defaultMessage: 'Expanded Radar channels vs Limited Channel options' }),
    category: categories['Wi-Fi Experience']
  },
  'c-dfschannels-disable': {
    aiFeature: 'AI Operations',
    intent: defineMessage({ defaultMessage: 'Radar Interference vs Optimal Channel availability' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bandbalancing-enable': {
    aiFeature: 'AI Operations',
    intent: defineMessage({ defaultMessage: 'Client Performance vs Compatibility' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bandbalancing-enable-below-61': {
    aiFeature: 'AI Operations',
    intent: defineMessage({ defaultMessage: 'Client Performance vs Compatibility' }),
    category: categories['Wi-Fi Experience']
  },
  'c-bandbalancing-proactive': {
    aiFeature: 'AI Operations',
    intent: defineMessage({ defaultMessage: 'Client Distribution vs Compatibility' }),
    category: categories['Wi-Fi Experience']
  },
  'c-aclb-enable': {
    aiFeature: 'AI Operations',
    intent: defineMessage({ defaultMessage: 'Distributed Wi-Fi Load vs Client Stability' }),
    category: categories['Wi-Fi Experience']
  },
  'i-zonefirmware-upgrade': {
    aiFeature: 'AI Operations',
    intent: defineMessage({ defaultMessage: 'Secure AP firmware vs Client Device Compatibility' }),
    category: categories.Infrastructure
  },
  'c-txpower-same': {
    aiFeature: 'AI Operations',
    intent: defineMessage({ defaultMessage: 'Optimize for 5 GHz Radio vs Longer range with 2.4 GHz' }),
    category: categories['Wi-Fi Experience']
  },
  'c-crrm-channel24g-auto': {
    aiFeature: 'AI-Driven RRM',
    intent: defineMessage({ defaultMessage: 'Client Density vs. Throughput for 2.4 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-crrm-channel5g-auto': {
    aiFeature: 'AI-Driven RRM',
    intent: defineMessage({ defaultMessage: 'Client Density vs. Throughput for 5 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-crrm-channel6g-auto': {
    aiFeature: 'AI-Driven RRM',
    intent: defineMessage({ defaultMessage: 'Client Density vs. Throughput for 6 GHz radio' }),
    category: categories['Wi-Fi Experience']
  },
  'c-probeflex-24g': {
    aiFeature: 'AirFlexAI',
    intent: defineMessage({ defaultMessage: 'Time to Connect vs. Client Density for 2.4 GHz' }),
    category: categories['Wi-Fi Experience']
  },
  'c-probeflex-5g': {
    aiFeature: 'AirFlexAI',
    intent: defineMessage({ defaultMessage: 'Time to Connect vs. Client Density for 5 GHz' }),
    category: categories['Wi-Fi Experience']
  },
  'c-probeflex-6g': {
    aiFeature: 'AirFlexAI',
    intent: defineMessage({ defaultMessage: 'Time to Connect vs. Client Density for 6 GHz' }),
    category: categories['Wi-Fi Experience']
  }
} as Record<string, CodeInfo>
