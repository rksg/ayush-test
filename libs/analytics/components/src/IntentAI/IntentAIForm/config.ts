/* eslint-disable max-len */
import { defineMessage, MessageDescriptor } from 'react-intl'

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

type CodeInfo = {
  category: MessageDescriptor,
  summary: MessageDescriptor,
  partialOptimizedSummary?: MessageDescriptor,
  priority: IconValue
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
    summary: defineMessage({ defaultMessage: 'Optimal Ch/Width and Tx Power found for 2.4 GHz radio' }),
    priority: priorities.high,
    valueFormatter: crrmText,
    valueText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' }),
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
    summary: defineMessage({ defaultMessage: 'Optimal Ch/Width and Tx Power found for 5 GHz radio' }),
    priority: priorities.high,
    valueFormatter: crrmText,
    valueText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' }),
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
    summary: defineMessage({ defaultMessage: 'Optimal Ch/Width and Tx Power found for 6 GHz radio' }),
    priority: priorities.high,
    valueFormatter: crrmText,
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
    value: defineMessage({ defaultMessage: 'Client Throughput' }),
    title: defineMessage({ defaultMessage: 'High client throughput in sparse network' }),
    content: defineMessage({ defaultMessage: 'In sparse networks with high client throughput, moderate interference is manageable due to optimized resource allocation, minimal competition for bandwidth, and strong signal strength. This allows for stable connections and satisfactory performance, outweighing drawbacks of interference.' }),
    introduction: defineMessage({ defaultMessage: '<p><b>High client throughput in sparse network</b>: In sparse networks with high client throughput, moderate interference is manageable due to optimized resource allocation, minimal competition for bandwidth, and strong signal strength. This allows for stable connections and satisfactory performance, outweighing drawbacks of interference.</p>' }),
    intent: defineMessage({ defaultMessage: 'Client density vs Client throughput' }),
    category: defineMessage({ defaultMessage: 'Wi-Fi Client Experience' })
  },
  clientDensity: {
    value: defineMessage({ defaultMessage: 'Client Density' }),
    title: defineMessage({ defaultMessage: 'High number of clients in a dense network' }),
    content: defineMessage({ defaultMessage: 'High client density network requires low interfering channels which fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.' }),
    introduction: defineMessage({ defaultMessage: '<p><b>High number of clients in a dense network: </b>High client density network requires low interfering channels which fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.</p>' })
  },
  calendarText: defineMessage({ defaultMessage: 'This recommendation will be applied at the chosen time whenever there is a need to change the channel plan. Schedule a time during off-hours when the number of WiFi clients is at the minimum.' })
}

export const intentTypeMap = {
  aiDrivenRRM: {
    intent: defineMessage({ defaultMessage: 'Client density vs Client throughput' }),
    category: defineMessage({ defaultMessage: 'Wi-Fi Client Experience' }),
    clientDensity: defineMessage({ defaultMessage: 'Client Density' }),
    clientThroughput: defineMessage({ defaultMessage: 'Client Throughput' })
  }
}
