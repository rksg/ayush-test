import { gql } from 'graphql-request'
import _       from 'lodash'

import { formattedPath }                            from '@acx-ui/analytics/utils'
import { DateFormatEnum, formatter }                from '@acx-ui/formatter'
import { intentAIApi }                              from '@acx-ui/store'
import { getIntl, NetworkPath, computeRangeFilter } from '@acx-ui/utils'
import type { PathFilter }                          from '@acx-ui/utils'

import { states, codes, StatusTrail, aiFeaturesLabel } from './config'
import { statuses, statusReasons }                     from './states'

type Intent = {
  id: string
  code: string
  status: statuses
  displayStatus: statusReasons
  createdAt: string
  updatedAt: string
  sliceType: string
  sliceValue: string
  metadata: object
  path: NetworkPath
  idPath: NetworkPath
  statusTrail: StatusTrail
  trigger: string
}

export type IntentListItem = Intent & {
  aiFeature: string
  intent: string
  scope: string
  type: string
  category: string
  status: string
  statusTooltip: string
}

type Metadata = {
  error?: {
    message?: string
  }
  scheduledAt?: string
  updatedAt?: string
  oneClickOptimize?: boolean
  scheduledBy?: string
}

export type HighlightItem = {
  new: number
  applied: number
}

export type IntentHighlight = {
  rrm?: HighlightItem
  airflex?: HighlightItem
  ops?: HighlightItem
}

const getStatusTooltip = (state: statusReasons, sliceValue: string, metadata: Metadata) => {
  const { $t } = getIntl()

  const stateConfig = states[state]
  return $t(stateConfig.tooltip, {
    errorMessage: metadata.error?.message,  //TODO: need to update error message logics after ETL finalizes metadata.failures
    scheduledAt: formatter(DateFormatEnum.DateTimeFormat)(metadata.scheduledAt),
    zoneName: sliceValue
    // userName: metadata.scheduledBy //TODO: scheduledBy is ID, how to get userName for R1 case?
    // newConfig: metadata.newConfig //TODO: how to display newConfig?
  })
}

export const api = intentAIApi.injectEndpoints({
  endpoints: (build) => ({
    intentAIList: build.query<
      IntentListItem[],
      PathFilter
    >({
      query: (payload) => ({
        document: gql`
        query IntentAIList(
          $startDate: DateTime, $endDate: DateTime, $path: [HierarchyNodeInput]
        ) {
          intents(start: $startDate, end: $endDate, path: $path) {
            id
            code
            status
            status_reason
            displayStatus
            createdAt
            updatedAt
            sliceType
            sliceValue
            metadata
            path {
              type
              name
            }
            idPath {
              type
              name
            }
          }
        }
        `,
        variables: {
          ...(_.pick(payload,['path'])),
          ...computeRangeFilter({
            dateFilter: _.pick(payload, ['startDate', 'endDate', 'range'])
          })
        }
      }),
      transformResponse: (response: Response<Intent>) => {
        const { $t } = getIntl()
        const items = response.intents.reduce((intents, intent) => {
          const {
            id, path, sliceValue, code, displayStatus, metadata, updatedAt
          } = intent
          const detail = codes[code]
          detail && states[displayStatus] && intents.push({
            ...intent,
            id: id,
            aiFeature: $t(aiFeaturesLabel[detail.aiFeature]),
            intent: $t(detail.intent),
            scope: formattedPath(path, sliceValue),
            category: $t(detail.category),
            status: $t(states[displayStatus].text),
            statusTooltip: getStatusTooltip(displayStatus, sliceValue, { ...metadata, updatedAt })
          } as (IntentListItem))
          return intents
        }, [] as Array<IntentListItem>)
        return items
      },
      providesTags: [{ type: 'Monitoring', id: 'INTENT_AI_LIST' }]
    }),
    intentHighlight: build.query<
      IntentHighlight,
      // TODO: do we need n?
      PathFilter & { n: number } & { selectedTenants?: string | null }
    >({
      query: (payload) => ({
        document: gql`
        query IntentHighlight(
          $start: DateTime, $end: DateTime, $path: [HierarchyNodeInput]
        ) {
          highlights(start: $start, end: $end, path: $path) {
            rrm {
              new
              applied
            }
            airflex {
              new
              applied
            }
            ops {
              new
              applied
            }
          }
        }
        `,
        variables: {
          ...(_.pick(payload,['path'])),
          ...computeRangeFilter({
            dateFilter: _.pick(payload, ['startDate', 'endDate', 'range'])
          })
        }
      }),
      transformResponse: (response: { highlights: IntentHighlight }) =>
        response.highlights,
      providesTags: [{ type: 'Monitoring', id: 'INTENT_HIGHLIGHTS' }]
    })
  })
})

export interface Response<Intent> {
  intents: Intent[]
}

export const {
  useIntentAIListQuery,
  useIntentHighlightQuery
} = api
