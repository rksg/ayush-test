import { gql } from 'graphql-request'
import _       from 'lodash'

import {
  nodeTypes,
  formattedPath } from '@acx-ui/analytics/utils'
import { intentAIApi }                                        from '@acx-ui/store'
import { NodeType, getIntl, NetworkPath, computeRangeFilter } from '@acx-ui/utils'
import type { PathFilter }                                    from '@acx-ui/utils'

import {
  states,
  codes,
  StatusTrail,
  StateType } from './config'

type Intent = {
  id: string
  code: string
  status: string | StateType
  status_reason?: string
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
  preferences: object
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
            excludedPaths {
              name
            }
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
            id, path, sliceValue, sliceType, code, status, displayStatus
          } = intent
          const statusEnum = displayStatus.startsWith('na-')
            ? displayStatus as StateType
            : status as StateType
          const detail = codes[code]
          detail && intents.push({
            ...intent,
            id: id,
            aiFeature: $t(detail.aiFeature),
            intent: $t(detail.intent),
            scope: formattedPath(path, sliceValue),
            type: nodeTypes(sliceType as NodeType),
            category: $t(detail.category),
            status: $t(states[statusEnum].text)
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
