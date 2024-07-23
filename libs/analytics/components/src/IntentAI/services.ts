import { gql } from 'graphql-request'
import _       from 'lodash'

import { formattedPath }                            from '@acx-ui/analytics/utils'
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
  statusEnum: StateType
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
            statusReason
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
            id, path, sliceValue, code, displayStatus
          } = intent
          const detail = codes[code]
          detail && intents.push({
            ...intent,
            id: id,
            aiFeature: $t(aiFeaturesLabel[detail.aiFeature]),
            intent: $t(detail.intent),
            scope: formattedPath(path, sliceValue),
            category: $t(detail.category),
            status: $t(states[displayStatus].text)
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
