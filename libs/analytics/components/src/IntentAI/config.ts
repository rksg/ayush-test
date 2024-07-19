/* eslint-disable max-len */
import { defineMessage, MessageDescriptor } from 'react-intl'

export type StatusTrail = Array<{ status: Lowercase<StateType>, createdAt?: string }>

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
  tooltip: MessageDescriptor,
  tooltipPartial?: MessageDescriptor
}

const categories = {
  'Wi-Fi Experience': defineMessage({ defaultMessage: 'Wi-Fi Experience' }),
  'Security': defineMessage({ defaultMessage: 'Security' }),
  'Infrastructure': defineMessage({ defaultMessage: 'Infrastructure' }),
  'AP Performance': defineMessage({ defaultMessage: 'AP Performance' })
}

export const states = {
  'new': {
    text: defineMessage({ defaultMessage: 'New' }),
    tooltip: defineMessage({ defaultMessage: 'IntentAI has analyzed the data and generated a change recommendations, awaiting your approval.\nTo review the details, specify Intent priority, and apply the recommendations, click "Optimize."\nAlternatively, use "1-Click Optimize" to instantly apply the changes with default priority.' })
  },
  'applyscheduled': {
    text: defineMessage({ defaultMessage: 'Scheduled' }),
    tooltip: defineMessage({ defaultMessage: 'The change recommendation has been scheduled via the user action "1-Click Optimize" initiated by the user {userName}.\nOR\nThe change recommendation has been scheduled via user action "Optimize" initiated by the user {userName}.\nOR\nThe change recommendation has been automatically scheduled by IntentAI.' })
  },
  'applyscheduleinprogress': {
    text: defineMessage({ defaultMessage: 'Apply In Progress' }),
    tooltip: defineMessage({ defaultMessage: 'IntentAI recommended changes are getting applied to the {zoneName}.' })
  },
  'applied': {
    text: defineMessage({ defaultMessage: 'Applied' }),
    tooltip: defineMessage({ defaultMessage: 'IntentAI has successfully applied the changes to the {zoneName}. The new configuration is: {newConfig}.' })
  },
  'applyfailed': {
    text: defineMessage({ defaultMessage: 'Applied Failed' }),
    tooltip: defineMessage({ defaultMessage: 'IntentAI recommended changes failed to be applied to the {zoneName} due to the reason:\n\n{errorMessage}' })
  },
  'revertscheduled': {
    text: defineMessage({ defaultMessage: 'Revert Scheduled' }),
    tooltip: defineMessage({ defaultMessage: 'The Revert of the IntentAI recommended changes are scheduled for {scheduledAt}, via user action "Revert" initiated by the user {userName}.' })
  },
  'revertscheduleinprogress': {
    text: defineMessage({ defaultMessage: 'Revert In Progress' }),
    tooltip: defineMessage({ defaultMessage: 'IntentAI recommended changes are getting reverted, to the earlier configuration, on the {zoneName}.' })
  },
  'revertfailed': {
    text: defineMessage({ defaultMessage: 'Revert Failed' }),
    tooltip: defineMessage({ defaultMessage: 'The Revert action on the IntentAI recommended change, failed due to the following reason: \n\n{errorMessage}' }),
    tooltipPartial: defineMessage({ defaultMessage: 'Error(s) were encountered on {updatedAt} when the reversion was applied. \n\nErrors: \n{errorMessage}' })
  },
  'reverted': {
    text: defineMessage({ defaultMessage: 'Revert Success' }),
    tooltip: defineMessage({ defaultMessage: 'The Revert action on the IntentAI recommended change was successful. The new configuration is: XYZ.' })
  },
  'paused': {
    text: defineMessage({ defaultMessage: 'Paused' }),
    tooltip: defineMessage({ defaultMessage: 'The Intent is paused by the user action "Pause" initiated by the user {userName}/nOR/nThe Intent is in default state of "Paused".\nA Paused Intent will refrain from executing any tasks, including KPI measurement, ML model generations, recommendation generation and configuration changes.' })
  },
  'na-conflicting-configuration': {
    text: defineMessage({ defaultMessage: 'No recommendation, Conflicting Configuration' }),
    tooltip: defineMessage({ defaultMessage: 'No recommendation was generated because IntentAI detected conflicting configurations. Conflict: Mesh APs are present in the zone.' })
  },
  'na-no-aps': {
    text: defineMessage({ defaultMessage: 'No recommendation, No APs' }),
    tooltip: defineMessage({ defaultMessage: 'No recommendation was generated because IntentAI found no APs in the {zoneName}.' })
  },
  'na-not-enough-license': {
    text: defineMessage({ defaultMessage: 'No recommendation, Not enough license' }),
    tooltip: defineMessage({ defaultMessage: 'No recommendation was generated because IntentAI did not find sufficient licenses for the zone {zoneName}.' })
  },
  'na-not-enough-data': {
    text: defineMessage({ defaultMessage: 'No recommendation, Not enough data' }),
    tooltip: defineMessage({ defaultMessage: 'No recommendation was generated because IntentAI found less than X days of data in the {zoneName}.' })
  },
  'na-verified': {
    text: defineMessage({ defaultMessage: 'Verified' }),
    tooltip: defineMessage({ defaultMessage: 'IntentAI has validated {zoneName} configurations. No new changes have been recommended.' })
  },
  'na-unknown-reason': {
    text: defineMessage({ defaultMessage: 'No recommendation, Unknown reason' }),
    tooltip: defineMessage({ defaultMessage: 'No recommendation was generated because IntentAI encountered and an unknown issue.' })
  }
} as Record<string, StateInfo>

export type StateType = keyof typeof states

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
