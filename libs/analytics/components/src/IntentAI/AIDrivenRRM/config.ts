/* eslint-disable max-len */
import { defineMessage, MessageDescriptor } from 'react-intl'

import { get }       from '@acx-ui/config'
import { formatter } from '@acx-ui/formatter'

import { CRRMStates } from './states'
import { crrmText }   from './utils'

export type IconValue = { order: number, label: MessageDescriptor }

export type StatusTrail = Array<{ status: Lowercase<StateType>, createdAt?: string }>

export type ConfigurationValue =
  string |
  Array<{ channelMode: string, channelWidth: string, radio: string }> |
  boolean |
  null

export const crrmStates: Record<CRRMStates, IconValue> = {
  [CRRMStates.optimized]: { order: 0, label: defineMessage({ defaultMessage: 'Optimized' }) },
  [CRRMStates.nonOptimized]: { order: 1, label: defineMessage({ defaultMessage: 'Non-Optimized' }) },
  [CRRMStates.verified]: { order: 0, label: defineMessage({ defaultMessage: 'Verified' }) },
  [CRRMStates.insufficientLicenses]: { order: 2, label: defineMessage({ defaultMessage: 'Insufficient Licenses' }) },
  [CRRMStates.unqualifiedZone]: { order: 2, label: defineMessage({ defaultMessage: 'Unqualified Zone' }) },
  [CRRMStates.noAps]: { order: 2, label: defineMessage({ defaultMessage: 'No APs' }) },
  [CRRMStates.verificationError]: { order: 2, label: defineMessage({ defaultMessage: 'Verification Error' }) },
  [CRRMStates.unknown]: { order: 2, label: defineMessage({ defaultMessage: 'Unknown' }) }
}

export const priorities: Record<'low' | 'medium' | 'high', IconValue> = {
  low: { order: 0, label: defineMessage({ defaultMessage: 'Low' }) },
  medium: { order: 1, label: defineMessage({ defaultMessage: 'Medium' }) },
  high: { order: 2, label: defineMessage({ defaultMessage: 'High' }) }
}

type IntentType = {
  introduction: MessageDescriptor,
  intent: MessageDescriptor,
  category: MessageDescriptor
}

const intentType: Record<string, IntentType> = {
  aiDrivenRRM: {
    introduction: defineMessage({ defaultMessage: 'Choose between a network with maximum throughput, allowing some interference, or one with minimal interference, for high client density.' }),
    intent: defineMessage({ defaultMessage: 'Client density vs Client throughput' }),
    category: defineMessage({ defaultMessage: 'Wi-Fi Experience' })
  }
}

type CodeInfo = {
  category: MessageDescriptor,
  summary: MessageDescriptor,
  partialOptimizedSummary?: MessageDescriptor,
  priority: IconValue,
  intentType: IntentType
}

type RecommendationKPIConfig = {
  key: string;
  label: MessageDescriptor;
  tooltipContent?: MessageDescriptor;
  format: ReturnType<typeof formatter>;
  deltaSign: '+' | '-' | 'none';
  valueAccessor?: (value: number[]) => number;
  valueFormatter?: ReturnType<typeof formatter>;
  showAps?: boolean;
  filter?: CallableFunction
}

type RecommendationConfig = {
  valueFormatter: ReturnType<typeof formatter>
  valueText: MessageDescriptor
  actionText: MessageDescriptor
  reasonText: MessageDescriptor
  tradeoffText: MessageDescriptor
  appliedReasonText?: MessageDescriptor
  kpis: RecommendationKPIConfig[]
  recommendedValueTooltipContent?:
    string |
    ((status: StateType, currentValue: ConfigurationValue, recommendedValue: string) =>
      MessageDescriptor)
  partialOptimizedActionText?: MessageDescriptor
  partialOptimizationAppliedReasonText?: MessageDescriptor
  partialOptimizedTradeoffText?: MessageDescriptor
  appliedActionText?: MessageDescriptor
  continuous: boolean
}

const categories = {
  'Wi-Fi Client Experience': defineMessage({ defaultMessage: 'Wi-Fi Client Experience' }),
  'Security': defineMessage({ defaultMessage: 'Security' }),
  'Infrastructure': defineMessage({ defaultMessage: 'Infrastructure' }),
  'AP Performance': defineMessage({ defaultMessage: 'AP Performance' }),
  'AI-Driven Cloud RRM': defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' }),
  'Insufficient Licenses': crrmStates[CRRMStates.insufficientLicenses].label,
  'Verification Error': crrmStates[CRRMStates.verificationError].label,
  'Verified': crrmStates[CRRMStates.verified].label,
  'Unqualified Zone': crrmStates[CRRMStates.unqualifiedZone].label,
  'No APs': crrmStates[CRRMStates.noAps].label
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
  },
  unqualifiedZone: {
    text: crrmStates[CRRMStates.unqualifiedZone].label,
    tooltip: crrmStates[CRRMStates.unqualifiedZone].label
  },
  noAps: {
    text: crrmStates[CRRMStates.noAps].label,
    tooltip: crrmStates[CRRMStates.noAps].label
  },
  insufficientLicenses: {
    text: crrmStates[CRRMStates.insufficientLicenses].label,
    tooltip: crrmStates[CRRMStates.insufficientLicenses].label
  },
  verificationError: {
    text: crrmStates[CRRMStates.verificationError].label,
    tooltip: crrmStates[CRRMStates.verificationError].label
  },
  verified: {
    text: crrmStates[CRRMStates.verified].label,
    tooltip: crrmStates[CRRMStates.verified].label
  },
  unknown: {
    text: crrmStates[CRRMStates.unknown].label,
    tooltip: crrmStates[CRRMStates.unknown].label
  }
}

export type StateType = keyof typeof states

export const codes = {
  'c-crrm-channel24g-auto': {
    category: categories['AI-Driven Cloud RRM'],
    intentType: intentType.aiDrivenRRM,
    summary: defineMessage({ defaultMessage: 'Optimal Ch/Width and Tx Power found for 2.4 GHz radio' }),
    priority: priorities.high,
    valueFormatter: crrmText,
    valueText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' }),
    actionText: defineMessage({ defaultMessage: '{scope} is experiencing high co-channel interference in 2.4 GHz band due to suboptimal channel planning. The channel plan, and potentially channel bandwidth and AP transmit power can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience.{isDataRetained, select, true {} other { {dataNotRetainedMsg}}}' }),
    appliedActionText: defineMessage({ defaultMessage: '{scope} had experienced high co-channel interference in 2.4 GHz band due to suboptimal channel planning as of {initialTime}.{isDataRetained, select, true { The recommendation had been applied as of {appliedTime} and interfering links have reduced. AI-Driven RRM will continue to monitor and adjust further everyday to continue to minimize co-channel interference.} other {}}{isDataRetained, select, true {} other { {dataNotRetainedMsg}}}' }),
    partialOptimizedActionText: defineMessage({ defaultMessage: '{scope} is experiencing high co-channel interference in 2.4 GHz band due to suboptimal channel planning. The channel plan can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience.{isDataRetained, select, true {} other { {dataNotRetainedMsg}}}' }),
    reasonText: defineMessage({ defaultMessage: 'Based on our AI Analytics, enabling AI-Driven Cloud RRM will decrease the number of interfering links from {before} to {after}.' }),
    appliedReasonText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan, bandwidth and AP transmit power when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    partialOptimizationAppliedReasonText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    tradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten.' }),
    partialOptimizedTradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten.' }),
    kpis: [{
      key: 'number-of-interfering-links',
      label: defineMessage({ defaultMessage: 'Number of Interfering Links' }),
      format: formatter('countFormat'),
      deltaSign: '-'
    }],
    continuous: true
  },
  'c-crrm-channel5g-auto': {
    category: categories['AI-Driven Cloud RRM'],
    intentType: intentType.aiDrivenRRM,
    summary: defineMessage({ defaultMessage: 'Optimal Ch/Width and Tx Power found for 5 GHz radio' }),
    priority: priorities.high,
    valueFormatter: crrmText,
    valueText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' }),
    actionText: defineMessage({ defaultMessage: '{scope} is experiencing high co-channel interference in 5 GHz band due to suboptimal channel planning. The channel plan, and potentially channel bandwidth and AP transmit power can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience.{isDataRetained, select, true {} other { {dataNotRetainedMsg}}}' }),
    appliedActionText: defineMessage({ defaultMessage: '{scope} had experienced high co-channel interference in 5 GHz band due to suboptimal channel planning as of {initialTime}.{isDataRetained, select, true { The recommendation had been applied as of {appliedTime} and interfering links have reduced. AI-Driven RRM will continue to monitor and adjust further everyday to continue to minimize co-channel interference.} other {}}{isDataRetained, select, true {} other { {dataNotRetainedMsg}}}' }),
    partialOptimizedActionText: defineMessage({ defaultMessage: '{scope} is experiencing high co-channel interference in 5 GHz band due to suboptimal channel planning. The channel plan can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience.{isDataRetained, select, true {} other { {dataNotRetainedMsg}}}' }),
    reasonText: defineMessage({ defaultMessage: 'Based on our AI Analytics, enabling AI-Driven Cloud RRM will decrease the number of interfering links from {before} to {after}.' }),
    appliedReasonText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan, bandwidth and AP transmit power when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    partialOptimizationAppliedReasonText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    tradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage.' }),
    partialOptimizedTradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage.' }),
    kpis: [{
      key: 'number-of-interfering-links',
      label: defineMessage({ defaultMessage: 'Number of Interfering Links' }),
      format: formatter('countFormat'),
      deltaSign: '-'
    }],
    continuous: true
  },
  'c-crrm-channel6g-auto': {
    category: categories['AI-Driven Cloud RRM'],
    intentType: intentType.aiDrivenRRM,
    summary: defineMessage({ defaultMessage: 'Optimal Ch/Width and Tx Power found for 6 GHz radio' }),
    priority: priorities.high,
    valueFormatter: crrmText,
    valueText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' }),
    actionText: defineMessage({ defaultMessage: '{scope} is experiencing high co-channel interference in 6 GHz band due to suboptimal channel planning. The channel plan, and potentially channel bandwidth and AP transmit power can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience.{isDataRetained, select, true {} other { {dataNotRetainedMsg}}}' }),
    appliedActionText: defineMessage({ defaultMessage: '{scope} had experienced high co-channel interference in 6 GHz band due to suboptimal channel planning as of {initialTime}.{isDataRetained, select, true { The recommendation had been applied as of {appliedTime} and interfering links have reduced. AI-Driven RRM will continue to monitor and adjust further everyday to continue to minimize co-channel interference.} other {}}{isDataRetained, select, true {} other { {dataNotRetainedMsg}}}' }),
    partialOptimizedActionText: defineMessage({ defaultMessage: '{scope} is experiencing high co-channel interference in 6 GHz band due to suboptimal channel planning. The channel plan can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience.{isDataRetained, select, true {} other { {dataNotRetainedMsg}}}' }),
    reasonText: defineMessage({ defaultMessage: 'Based on our AI Analytics, enabling AI-Driven Cloud RRM will decrease the number of interfering links from {before} to {after}.' }),
    appliedReasonText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan, bandwidth and AP transmit power when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    partialOptimizationAppliedReasonText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    tradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten.' }),
    partialOptimizedTradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten.' }),
    kpis: [{
      key: 'number-of-interfering-links',
      label: defineMessage({ defaultMessage: 'Number of Interfering Links' }),
      format: formatter('countFormat'),
      deltaSign: '-'
    }],
    continuous: true
  }
} as unknown as Record<string, RecommendationConfig & CodeInfo>

export const statusTrailMsgs = Object.entries(states).reduce((acc, [key, val]) => {
  acc[key as StateType] = val.text
  return acc
}, {} as Record<StateType, MessageDescriptor>)

export const steps = {
  title: {
    introduction: defineMessage({ defaultMessage: 'Introduction' }),
    priority: defineMessage({ defaultMessage: 'Intent Priority' }),
    settings: defineMessage({ defaultMessage: 'Settings' }),
    summary: defineMessage({ defaultMessage: 'Summary' })
  },
  link: {
    demoLink: 'https://www.youtube.com/playlist?list=PLySwoo7u9-KJeAI4VY_2ha4r9tjnqE3Zi',
    guideLink: 'https://docs.commscope.com/bundle/ruckusai-userguide/page/GUID-5D18D735-6D9A-4847-9C6F-8F5091F9B171.html'
  },
  sideNotes: {
    title: defineMessage({ defaultMessage: 'Side Notes' }),
    introduction: defineMessage({ defaultMessage: 'Low interference fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.' }),
    tradeoff: defineMessage({ defaultMessage: 'In the quest for minimizing interference between access points (APs), AI algorithms may opt to narrow channel widths. While this can enhance spectral efficiency and alleviate congestion, it also heightens vulnerability to noise, potentially reducing throughput. Narrow channels limit data capacity, making networks more prone to signal degradation and interference, which could compromise overall performance and reliability.' })
  },
  clientThroughput: {
    title: defineMessage({ defaultMessage: 'High client throughput in sparse network' }),
    content: defineMessage({ defaultMessage: 'In sparse networks with high client throughput, moderate interference is manageable due to optimized resource allocation, minimal competition for bandwidth, and strong signal strength. This allows for stable connections and satisfactory performance, outweighing drawbacks of interference.' }),
    introduction: defineMessage({ defaultMessage: '<p><b>High client throughput in sparse network</b>: In sparse networks with high client throughput, moderate interference is manageable due to optimized resource allocation, minimal competition for bandwidth, and strong signal strength. This allows for stable connections and satisfactory performance, outweighing drawbacks of interference.</p>' })
  },
  clientDensity: {
    title: defineMessage({ defaultMessage: 'High number of clients in a dense network' }),
    content: defineMessage({ defaultMessage: 'High client density network requires low interfering channels which fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.' }),
    introduction: defineMessage({ defaultMessage: '<p><b>High number of clients in a dense network: </b>High client density network requires low interfering channels which fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.</p>' })
  },
  calendarText: defineMessage({ defaultMessage: 'This recommendation will be applied at the chosen time whenever there is a need to change the channel plan. Schedule a time during off-hours when the number of WiFi clients is at the minimum.' })
}
