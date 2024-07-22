import { gql } from 'graphql-request'
import _       from 'lodash'

import { formattedPath }                            from '@acx-ui/analytics/utils'
import { DateFormatEnum, formatter }                from '@acx-ui/formatter'
import { intentAIApi }                              from '@acx-ui/store'
import { getIntl, NetworkPath, computeRangeFilter } from '@acx-ui/utils'
import type { PathFilter }                          from '@acx-ui/utils'

import {
  states,
  codes,
  StatusTrail,
  StateType,
  aiFeaturesLabel
} from './config'

type Intent = {
  id: string
  code: string
  status: string | StateType
  displayStatus: string
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

const getStatusTooltip = (state: StateType, sliceValue: string, metadata: Metadata) => {
  const { $t } = getIntl()
  let tooltipKey = 'tooltip'

  if (state.includes('applyscheduled-by-user') && metadata.oneClickOptimize) {
    tooltipKey = 'tooltipOneClickOptimize'
  }

  const stateConfig = states[state]
  return $t(stateConfig[tooltipKey as keyof typeof stateConfig], {
    errorMessage: metadata.error?.message,
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
          //Avoid UI showing errors when displayStatus is not defined in the UI code
          const statusEnum = (states[displayStatus]?.text)
            ? displayStatus as StateType
            : 'status-not-defined-in-ui'
          detail && intents.push({
            ...intent,
            id: id,
            aiFeature: $t(aiFeaturesLabel[detail.aiFeature]),
            intent: $t(detail.intent),
            scope: formattedPath(path, sliceValue),
            category: $t(detail.category),
            status: $t(states[statusEnum].text),
            statusTooltip: getStatusTooltip(statusEnum, sliceValue, { ...metadata, updatedAt })
          } as (IntentListItem))
          return intents
        }, [] as Array<IntentListItem>)
        return items
      },
      providesTags: [{ type: 'Monitoring', id: 'INTENT_AI_LIST' }]
    })
  })
})

export interface Response<Intent> {
  intents: Intent[]
}

export const {
  useIntentAIListQuery
} = api
