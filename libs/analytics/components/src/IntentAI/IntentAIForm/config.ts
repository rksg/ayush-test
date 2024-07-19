/* eslint-disable max-len */
import { defineMessage, MessageDescriptor } from 'react-intl'

import { formatter } from '@acx-ui/formatter'

import { CRRMStates } from './states'

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

export type CodeInfo = {
  category: MessageDescriptor,
  summary: MessageDescriptor,
  partialOptimizedSummary?: MessageDescriptor,
  priority: IconValue
}

type IntentKPIConfig = {
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

export type RecommendationConfig = {
  valueFormatter: ReturnType<typeof formatter>
  valueText: MessageDescriptor
  actionText: MessageDescriptor
  reasonText: MessageDescriptor
  tradeoffText: MessageDescriptor
  appliedReasonText?: MessageDescriptor
  kpis: IntentKPIConfig[]
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

export const categories = {
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
