/* eslint-disable max-len */
import { defineMessage, MessageDescriptor } from 'react-intl'

export type StatusTrail = Array<{ status: Lowercase<StateType>, createdAt?: string }>

type CodeInfo = {
  aiFeature: MessageDescriptor,
  intent: MessageDescriptor,
  category: MessageDescriptor
}

const aiFeatures = {
  'AI-Driven RRM': defineMessage({ defaultMessage: 'AI-Driven RRM' }),
  'AirFlexAI': defineMessage({ defaultMessage: 'AirFlexAI' }),
  'AI Operations': defineMessage({ defaultMessage: 'AI Operations' }),
  'EcoFlexAI': defineMessage({ defaultMessage: 'EcoFlexAI' })
}

const categories = {
  'Wi-Fi Client Experience': defineMessage({ defaultMessage: 'Wi-Fi Client Experience' }),
  'Security': defineMessage({ defaultMessage: 'Security' }),
  'Infrastructure': defineMessage({ defaultMessage: 'Infrastructure' }),
  'AP Performance': defineMessage({ defaultMessage: 'AP Performance' }),
  'AI-Driven Cloud RRM': defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' })
}

export const states = {
  new: {
    text: defineMessage({ defaultMessage: 'New' }),
    tooltip: defineMessage({ defaultMessage: 'Schedule a day and time to apply this recommendation.' })
  },
  applyscheduled: {
    text: defineMessage({ defaultMessage: 'Scheduled' }),
    tooltip: defineMessage({ defaultMessage: 'Recommendation has been scheduled for {scheduledAt}. Note that the actual configuration change will happen asynchronously within 1 hour of the scheduled time.' })
  },
  applyscheduleinprogress: {
    text: defineMessage({ defaultMessage: 'Apply In Progress' }),
    tooltip: defineMessage({ defaultMessage: 'Recommendation scheduled for {scheduledAt} is in progress' })
  },
  applied: {
    text: defineMessage({ defaultMessage: 'Applied' }),
    tooltip: defineMessage({ defaultMessage: 'Recommendation has been successfully applied on {updatedAt}. RUCKUS Analytics will monitor this configuration change for the next 7 days until {updatedAtPlus7Days}.' }),
    tooltipCCR: defineMessage({ defaultMessage: 'Recommendation has been successfully applied on {updatedAt}.' })
  },
  applyfailed: {
    text: defineMessage({ defaultMessage: 'Failed' }),
    tooltip: defineMessage({ defaultMessage: 'An error was encountered on {updatedAt} when the recommended configuration change was applied. Note that no configuration change was made.\n\nError: {errorMessage}' })
  },
  beforeapplyinterrupted: {
    text: defineMessage({ defaultMessage: 'Interrupted (Recommendation not applied)' }),
    tooltip: defineMessage({ defaultMessage: 'RUCKUS Analytics has detected a manual configuration change in {smartZone} on {updatedAt} that may interfere with this recommendation. As such, the recommendation scheduled for {scheduledAt} has been canceled. Manually check whether this recommendation is still valid.' })
  },
  afterapplyinterrupted: {
    text: defineMessage({ defaultMessage: 'Interrupted (Recommendation applied)' }),
    tooltip: defineMessage({ defaultMessage: 'RUCKUS Analytics has detected a manual configuration change in {smartZone} on {updatedAt} that may interfere with this recommendation. As such, the results from the monitoring of this configuration change may not be relevant anymore. Manually check whether this recommendation is still valid.' })
  },
  applywarning: {
    text: defineMessage({ defaultMessage: 'REVERT' }),
    tooltip: defineMessage({ defaultMessage: 'RUCKUS Analytics has detected a degradation in network performance after the application of the recommended configuration on {updatedAt}. Click revert to undo the configuration change as soon as possible.' })
  },
  revertscheduled: {
    text: defineMessage({ defaultMessage: 'Revert Scheduled' }),
    tooltip: defineMessage({ defaultMessage: 'A reversion to undo the configuration change has been scheduled for {scheduledAt}. Note that the actual reversion of configuration will happen asynchronously within 1 hour of the scheduled time.' })
  },
  revertscheduleinprogress: {
    text: defineMessage({ defaultMessage: 'Revert In Progress' }),
    tooltip: defineMessage({ defaultMessage: 'Revert scheduled for {scheduledAt} is in progress' })
  },
  revertfailed: {
    text: defineMessage({ defaultMessage: 'Revert Failed' }),
    tooltip: defineMessage({ defaultMessage: 'An error was encountered on {updatedAt} when the reversion was applied. Note that no reversion was made.\n\nError: {errorMessage}' }),
    tooltipPartial: defineMessage({ defaultMessage: 'Error(s) were encountered on {updatedAt} when the reversion was applied. \n\nErrors: \n{errorMessage}' })
  },
  reverted: {
    text: defineMessage({ defaultMessage: 'Reverted' }),
    tooltip: defineMessage({ defaultMessage: 'Reversion has been successfully applied on {updatedAt}.' })
  },
  deleted: {
    text: defineMessage({ defaultMessage: 'Deleted' }),
    tooltip: defineMessage({ defaultMessage: 'Deleted' })
  }
  //TODO: audit API isn't ready yet for 'unqualifiedZone', 'noAps', 'insufficientLicenses', 'verificationError', 'verified', 'unknown'
  //TODO: PRD has defined new states https://jira-wiki.ruckuswireless.com/display/Team/RUCKUS+IntentAI+-+PRD#RUCKUSIntentAIPRD-Requirements
}

export type StateType = keyof typeof states

//For original codes, please refer to libs/analytics/components/src/Recommendations/config.ts
export const codes = {
  'c-bgscan24g-enable': {
    aiFeature: aiFeatures['AI Operations'],
    intent: defineMessage({ defaultMessage: 'Dynamic vs Static Channel capability on 2.4 GHz radio' }),
    category: categories['Wi-Fi Client Experience']
  },
  'c-bgscan5g-enable': {
    aiFeature: aiFeatures['AI Operations'],
    intent: defineMessage({ defaultMessage: 'Dynamic vs Static Channel capability on 5 GHz radio' }),
    category: categories['Wi-Fi Client Experience']
  },
  'c-bgscan24g-timer': {
    aiFeature: aiFeatures['AI Operations'],
    intent: defineMessage({ defaultMessage: 'Network Efficiency vs Stability on 2.4 GHz radio' }),
    category: categories['Wi-Fi Client Experience']
  },
  'c-bgscan5g-timer': {
    aiFeature: aiFeatures['AI Operations'],
    intent: defineMessage({ defaultMessage: 'Network Efficiency vs Stability on 5 GHz radio' }),
    category: categories['Wi-Fi Client Experience']
  },
  'c-bgscan6g-timer': {
    aiFeature: aiFeatures['AI Operations'],
    intent: defineMessage({ defaultMessage: 'Network Efficiency vs Stability on 6 GHz radio' }),
    category: categories['Wi-Fi Client Experience']
  },
  'c-dfschannels-enable': {
    aiFeature: aiFeatures['AI Operations'],
    intent: defineMessage({ defaultMessage: 'Expanded Radar channels vs Limited Channel options' }),
    category: categories['Wi-Fi Client Experience']
  },
  'c-dfschannels-disable': {
    aiFeature: aiFeatures['AI Operations'],
    intent: defineMessage({ defaultMessage: 'Radar Interference vs Optimal Channel availability' }),
    category: categories['Wi-Fi Client Experience']
  },
  'c-bandbalancing-enable': {
    aiFeature: aiFeatures['AI Operations'],
    intent: defineMessage({ defaultMessage: 'Client Performance vs Compatibility' }),
    category: categories['Wi-Fi Client Experience']
  },
  'c-bandbalancing-enable-below-61': {
    aiFeature: aiFeatures['AI Operations'],
    intent: defineMessage({ defaultMessage: 'Client Performance vs Compatibility' }),
    category: categories['Wi-Fi Client Experience']
  },
  'c-bandbalancing-proactive': {
    aiFeature: aiFeatures['AI Operations'],
    intent: defineMessage({ defaultMessage: 'Client Distribution vs Compatibility' }),
    category: categories['Wi-Fi Client Experience']
  },
  'c-aclb-enable': {
    aiFeature: aiFeatures['AI Operations'],
    intent: defineMessage({ defaultMessage: 'Distributed Wi-Fi Load vs Client Stability' }),
    category: categories['Wi-Fi Client Experience']
  },
  'i-zonefirmware-upgrade': {
    aiFeature: aiFeatures['AI Operations'],
    intent: defineMessage({ defaultMessage: 'Secure AP firmware vs Client Device Compatibility' }),
    category: categories.Infrastructure
  },
  'c-txpower-same': {
    aiFeature: aiFeatures['AI Operations'],
    intent: defineMessage({ defaultMessage: 'Optimize for 5 GHz Radio vs Longer range with 2.4 GHz' }),
    category: categories['Wi-Fi Client Experience']
  },
  'c-crrm-channel24g-auto': {
    aiFeature: aiFeatures['AI-Driven RRM'],
    intent: defineMessage({ defaultMessage: 'Client Density vs. Throughput for 2.4 GHz radio' }),
    category: categories['AI-Driven Cloud RRM']
  },
  'c-crrm-channel5g-auto': {
    aiFeature: aiFeatures['AI-Driven RRM'],
    intent: defineMessage({ defaultMessage: 'Client Density vs. Throughput for 5 GHz radio' }),
    category: categories['AI-Driven Cloud RRM']
  },
  'c-crrm-channel6g-auto': {
    aiFeature: aiFeatures['AI-Driven RRM'],
    intent: defineMessage({ defaultMessage: 'Client Density vs. Throughput for 6 GHz radio' }),
    category: categories['AI-Driven Cloud RRM']
  },
  'c-probeflex-24g': {
    aiFeature: aiFeatures.AirFlexAI,
    intent: defineMessage({ defaultMessage: 'Time to Connect vs. Client Density for 2.4 GHz' }),
    category: categories['Wi-Fi Client Experience']
  },
  'c-probeflex-5g': {
    aiFeature: aiFeatures.AirFlexAI,
    intent: defineMessage({ defaultMessage: 'Time to Connect vs. Client Density for 5 GHz' }),
    category: categories['Wi-Fi Client Experience']
  },
  'c-probeflex-6g': {
    aiFeature: aiFeatures.AirFlexAI,
    intent: defineMessage({ defaultMessage: 'Time to Connect vs. Client Density for 6 GHz' }),
    category: categories['Wi-Fi Client Experience']
  }
  //TODO: audit API isn't ready yet for 'unqualifiedZone', 'noAps', 'insufficientLicenses', 'verificationError', 'verified', 'unknown'
} as unknown as Record<string, CodeInfo>
