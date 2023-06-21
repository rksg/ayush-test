import { gql }               from 'graphql-request'
import { createApi }               from '@reduxjs/toolkit/query/react'
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'
import { defineMessage } from 'react-intl'

import {
  nodeTypes,
  formattedPath,
  impactedArea,
  calculateSeverity
} from '@acx-ui/analytics/utils'
import { recommendationApi }                 from '@acx-ui/store'
import { NodeType, getIntl } from '@acx-ui/utils'
import { DateFormatEnum, formatter }                   from '@acx-ui/formatter'
import moment from 'moment'


type Metadata = {
  error?: {
    message?: string
    details?: {
      apName: string
      apMac: string
      message: string
      configKey: string
    }[]
  },
  scheduledAt?: string
  updatedAt?: string
}
export type Recommendation = {
  id: string
  code: string
  status: string
  createdAt: string
  updatedAt: string
  sliceType: string
  sliceValue: string
  metadata: {}
  isMuted: boolean
  mutedBy: string
  mutedAt: string
  path: []
}
const radioConfigMap = {
  radio24g: '2.4 GHz',
  radio5g: '5 GHz',
  radio6g: '6 GHz',
  radio5gLower: 'Lower 5 GHz',
  radio5gUpper: 'Upper 5 GHz'
}
const getStatusTooltip = (code: string, state: string, metadata: Metadata) => {
  const { $t } = getIntl()
  let errorMessage = metadata.error?.message
  let tooltipKey = 'tooltip'
  if (metadata.error?.details) {
    tooltipKey = 'tooltipPartial'
    errorMessage = metadata.error?.details
      .map(item => $t(defineMessage({
        defaultMessage: '{apName} ({apMac}) on {radio}: {message}'
      }), {
        ...item,
        radio: radioConfigMap[item.configKey as keyof typeof radioConfigMap]
      }))
      .join('\n')
  }

  if (code.startsWith('c-crrm') && state === 'applied') {
    tooltipKey = 'tooltipCCR'
  }
  const stateConfig = states[state as keyof typeof states]
  return $t(stateConfig[tooltipKey as keyof typeof stateConfig], {
    count: metadata.error?.details?.length || 1,
    errorMessage: errorMessage,
    updatedAt: formatter(DateFormatEnum.DateTimeFormat)(metadata.updatedAt),
    scheduledAt: formatter(DateFormatEnum.DateTimeFormat)(metadata.scheduledAt),
    updatedAtPlus7Days: formatter(DateFormatEnum.DateTimeFormat)(moment(metadata.updatedAt).add(7, 'd'))
  })
}
function transformResponse (recommendations: Recommendation[]) {
  const { $t } = getIntl()
  return recommendations.map(recommendation => {
    const { path, sliceValue, sliceType, code, status, metadata, updatedAt } = recommendation
    const { order, label } = codes[code as keyof typeof codes].priority
    return {
      ...recommendation,
      scope: formattedPath(path, sliceValue),
      type: nodeTypes(sliceType as NodeType),
      priority: order,
      priorityLabel: $t(label),
      category: $t(codes[code as keyof typeof codes].category),
      summary: $t(codes[code as keyof typeof codes].summary),
      status: $t(states[status as keyof typeof states].text),
      statusTooltip: getStatusTooltip(code, status, { ...metadata, updatedAt })
    }
  })
}
const api = recommendationApi.injectEndpoints({
  endpoints: (build) => ({
    recommendationList: build.query({
      query: (payload) => ({
        document: gql`
        query ConfigRecommendation(
          $start: DateTime, $end: DateTime, $path: [HierarchyNodeInput]
        ) {
          recommendations(start: $start, end: $end, path: $path) {
            id
            code
            status
            createdAt
            updatedAt
            sliceType
            sliceValue
            metadata
            isMuted
            mutedBy
            mutedAt
            path {
              type
              name
            }
          }
        }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          filter: payload?.filter
        }
      }),
      transformResponse: (response: Response<Recommendation>) => {
        return transformResponse(response.recommendations)
      },
      providesTags: [{ type: 'Monitoring', id: 'RECOMMENDATION_LIST' }]
    })
  })
})

export interface Response<Recommendation> {
  recommendations: Recommendation[]
}

export const { useRecommendationListQuery } = api

const Priorities = {
  low: { order: 1, label: defineMessage({ defaultMessage: 'Low' }) },
  medium: { order: 2, label: defineMessage({ defaultMessage: 'Medium' }) },
  high: { order: 3, label: defineMessage({ defaultMessage: 'High' }) }
}
const Categories = {
  'Wi-Fi Client Experience': defineMessage({ defaultMessage: 'Wi-Fi Client Experience' }),
  Security : defineMessage({ defaultMessage: 'Security' }),
  Infrastructure: defineMessage({ defaultMessage: 'Infrastructure' }),
  'AP Performance': defineMessage({ defaultMessage:  'AP Performance' }),
  'AI-Driven Cloud RRM': defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' })
}
const { states, codes } = {
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
      'category': Categories['Wi-Fi Client Experience'],
      'summary': defineMessage({ defaultMessage: 'Auto channel selection mode and background scan on 2.4 GHz radio' }),
      'priority': Priorities.medium
    },
    'c-bgscan5g-enable': {
      'category': Categories['Wi-Fi Client Experience'],
      'summary': defineMessage({ defaultMessage: 'Auto channel selection mode and background scan on 5 GHz radio' }),
      'priority': Priorities.medium
    },
    'c-bgscan24g-timer': {
      'category': Categories['Wi-Fi Client Experience'],
      'summary': defineMessage({ defaultMessage: 'Background scan timer on 2.4 GHz radio' }),
      'priority': Priorities.low
    },
    'c-bgscan5g-timer': {
      'category': Categories['Wi-Fi Client Experience'],
      'summary': defineMessage({ defaultMessage: 'Background scan timer on 5 GHz radio' }),
      'priority': Priorities.low
    },
    'c-dfschannels-enable': {
      'category': Categories['Wi-Fi Client Experience'],
      'summary': defineMessage({ defaultMessage: 'Enable DFS channels' }),
      'priority': Priorities.medium
    },
    'c-dfschannels-disable': {
      'category': Categories['Wi-Fi Client Experience'],
      'summary': defineMessage({ defaultMessage: 'Disable DFS channels' }),
      'priority': Priorities.low
    },
    'c-bandbalancing-enable': {
      'category': Categories['Wi-Fi Client Experience'],
      'summary': defineMessage({ defaultMessage: 'Enable band balancing' }),
      'priority': Priorities.low
    },
    'c-bandbalancing-enable-below-61': {
      'category': Categories['Wi-Fi Client Experience'],
      'summary': defineMessage({ defaultMessage: 'Enable band balancing' }),
      'priority': Priorities.low
    },
    'c-bandbalancing-proactive': {
      'category': Categories['Wi-Fi Client Experience'],
      'summary': defineMessage({ defaultMessage: 'Change band balancing mode' }),
      'priority': Priorities.low
    },
    'c-aclb-enable': {
      'category': Categories['Wi-Fi Client Experience'],
      'summary': defineMessage({ defaultMessage: 'Enable load balancing based on client count' }),
      'priority': Priorities.low
    },
    'i-zonefirmware-upgrade': {
      'category': Categories.Infrastructure,
      'summary': defineMessage({ defaultMessage: 'Zone firmware upgrade' }),
      'priority': Priorities.medium
    },
    'c-txpower-same': {
      'category': Categories['Wi-Fi Client Experience'],
      'summary': defineMessage({ defaultMessage: 'Tx power setting for 2.4 GHz and 5 GHz radio' }),
      'priority': Priorities.medium
    },
    'c-txpower5g-low': {
      'category': Categories['Wi-Fi Client Experience'],
      'summary': defineMessage({ defaultMessage: 'Tx power is low for 5 GHz' }),
      'priority': Priorities.medium
    },
    's-wlanauth-open': {
      'category': Categories.Security,
      'summary': defineMessage({ defaultMessage: 'WLAN with Open Security' }),
      'priority': Priorities.medium
    },
    's-wlanauth-weak': {
      'category': Categories.Security,
      'summary': defineMessage({ defaultMessage: 'Weak WLAN authentication method' }),
      'priority': Priorities.medium
    },
    'p-multicasttraffic-limit': {
      'category': Categories['AP Performance'],
      'summary': defineMessage({ defaultMessage: 'Multicast/Broadcast traffic flood' }),
      'priority': Priorities.medium
    },
    'c-crrm-channel24g-auto': {
      'category': Categories['AI-Driven Cloud RRM'],
      'summary': defineMessage({ defaultMessage: 'More optimal channel plan and channel bandwidth selection on 2.4 GHz radio' }),
      'priority': Priorities.high
    },
    'c-crrm-channel5g-auto': {
      'category': Categories['AI-Driven Cloud RRM'],
      'summary': defineMessage({ defaultMessage: 'More optimal channel plan and channel bandwidth selection on 5 GHz radio' }),
      'priority': Priorities.high
    },
    'c-crrm-channel6g-auto': {
      'category': Categories['AI-Driven Cloud RRM'],
      'summary': defineMessage({ defaultMessage: 'More optimal channel plan and channel bandwidth selection on 6 GHz radio' }),
      'priority': Priorities.high
    }
  }
}
