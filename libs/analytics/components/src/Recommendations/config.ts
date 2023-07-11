/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

const priorities = {
  low: { order: 1, label: defineMessage({ defaultMessage: 'Low' }) },
  medium: { order: 2, label: defineMessage({ defaultMessage: 'Medium' }) },
  high: { order: 3, label: defineMessage({ defaultMessage: 'High' }) }
}
const categories = {
  'Wi-Fi Client Experience': defineMessage({ defaultMessage: 'Wi-Fi Client Experience' }),
  'Security': defineMessage({ defaultMessage: 'Security' }),
  'Infrastructure': defineMessage({ defaultMessage: 'Infrastructure' }),
  'AP Performance': defineMessage({ defaultMessage: 'AP Performance' }),
  'AI-Driven Cloud RRM': defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' })
}
export const { states, codes } = {
  states: {
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
      tooltip: defineMessage({ defaultMessage: 'RUCKUS Analytics has detected a manual configuration change in the SmartZone on {updatedAt} that may interfere with this recommendation. As such, the recommendation scheduled for {scheduledAt} has been canceled. Manually check whether this recommendation is still valid.' })
    },
    afterapplyinterrupted: {
      text: defineMessage({ defaultMessage: 'Interrupted (Recommendation applied)' }),
      tooltip: defineMessage({ defaultMessage: 'RUCKUS Analytics has detected a manual configuration change in the SmartZone on {updatedAt} that may interfere with this recommendation. As such, the results from the monitoring of this configuration change may not be relevant anymore. Manually check whether this recommendation is still valid.' })
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
  },
  codes: {
    'c-bgscan24g-enable': {
      category: categories['Wi-Fi Client Experience'],
      summary: defineMessage({ defaultMessage: 'Auto channel selection mode and background scan on 2.4 GHz radio' }),
      priority: priorities.medium
    },
    'c-bgscan5g-enable': {
      category: categories['Wi-Fi Client Experience'],
      summary: defineMessage({ defaultMessage: 'Auto channel selection mode and background scan on 5 GHz radio' }),
      priority: priorities.medium
    },
    'c-bgscan24g-timer': {
      category: categories['Wi-Fi Client Experience'],
      summary: defineMessage({ defaultMessage: 'Background scan timer on 2.4 GHz radio' }),
      priority: priorities.low
    },
    'c-bgscan5g-timer': {
      category: categories['Wi-Fi Client Experience'],
      summary: defineMessage({ defaultMessage: 'Background scan timer on 5 GHz radio' }),
      priority: priorities.low
    },
    'c-dfschannels-enable': {
      category: categories['Wi-Fi Client Experience'],
      summary: defineMessage({ defaultMessage: 'Enable DFS channels' }),
      priority: priorities.medium
    },
    'c-dfschannels-disable': {
      category: categories['Wi-Fi Client Experience'],
      summary: defineMessage({ defaultMessage: 'Disable DFS channels' }),
      priority: priorities.low
    },
    'c-bandbalancing-enable': {
      category: categories['Wi-Fi Client Experience'],
      summary: defineMessage({ defaultMessage: 'Enable band balancing' }),
      priority: priorities.low
    },
    'c-bandbalancing-enable-below-61': {
      category: categories['Wi-Fi Client Experience'],
      summary: defineMessage({ defaultMessage: 'Enable band balancing' }),
      priority: priorities.low
    },
    'c-bandbalancing-proactive': {
      category: categories['Wi-Fi Client Experience'],
      summary: defineMessage({ defaultMessage: 'Change band balancing mode' }),
      priority: priorities.low
    },
    'c-aclb-enable': {
      category: categories['Wi-Fi Client Experience'],
      summary: defineMessage({ defaultMessage: 'Enable load balancing based on client count' }),
      priority: priorities.low
    },
    'i-zonefirmware-upgrade': {
      category: categories.Infrastructure,
      summary: defineMessage({ defaultMessage: 'Zone firmware upgrade' }),
      priority: priorities.medium
    },
    'c-txpower-same': {
      category: categories['Wi-Fi Client Experience'],
      summary: defineMessage({ defaultMessage: 'Tx power setting for 2.4 GHz and 5 GHz radio' }),
      priority: priorities.medium
    },
    'c-txpower5g-low': {
      category: categories['Wi-Fi Client Experience'],
      summary: defineMessage({ defaultMessage: 'Tx power is low for 5 GHz' }),
      priority: priorities.medium
    },
    's-wlanauth-open': {
      category: categories.Security,
      summary: defineMessage({ defaultMessage: 'WLAN with Open Security' }),
      priority: priorities.medium
    },
    's-wlanauth-weak': {
      category: categories.Security,
      summary: defineMessage({ defaultMessage: 'Weak WLAN authentication method' }),
      priority: priorities.medium
    },
    'p-multicasttraffic-limit': {
      category: categories['AP Performance'],
      summary: defineMessage({ defaultMessage: 'Multicast/Broadcast traffic flood' }),
      priority: priorities.medium
    },
    'c-crrm-channel24g-auto': {
      category: categories['AI-Driven Cloud RRM'],
      summary: defineMessage({ defaultMessage: 'More optimal channel plan and channel bandwidth selection on 2.4 GHz radio' }),
      priority: priorities.high
    },
    'c-crrm-channel5g-auto': {
      category: categories['AI-Driven Cloud RRM'],
      summary: defineMessage({ defaultMessage: 'More optimal channel plan and channel bandwidth selection on 5 GHz radio' }),
      priority: priorities.high
    },
    'c-crrm-channel6g-auto': {
      category: categories['AI-Driven Cloud RRM'],
      summary: defineMessage({ defaultMessage: 'More optimal channel plan and channel bandwidth selection on 6 GHz radio' }),
      priority: priorities.high
    }
  }
}