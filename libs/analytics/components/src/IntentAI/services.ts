import { gql }         from 'graphql-request'
import _, { uniqueId } from 'lodash'

import {
  nodeTypes,
  formattedPath } from '@acx-ui/analytics/utils'
import { recommendationApi }                                  from '@acx-ui/store'
import { NodeType, getIntl, NetworkPath, computeRangeFilter } from '@acx-ui/utils'
import type { PathFilter }                                    from '@acx-ui/utils'

import {
  states,
  codes,
  StatusTrail,
  StateType } from './config'

type Recommendation = {
  id: string
  code: string
  status: string | StateType
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

export type IntentAIRecommendationListItem = Recommendation & {
  aiFeature: string
  intent: string
  scope: string
  type: string
  category: string
  status: string
  statusEnum: StateType
}

export const api = recommendationApi.injectEndpoints({
  endpoints: (build) => ({
    intentAIRecommendationList: build.query<
      IntentAIRecommendationListItem[],
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
            createdAt
            updatedAt
            sliceType
            sliceValue
            metadata
            preferences
            path {
              type
              name
            }
            idPath {
              type
              name
            }
            statusTrail { status }
            trigger
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
      transformResponse: (response: Response<Recommendation>) => {
        const { $t } = getIntl()
        const items = response.intents.reduce((intents, intent) => {
          const {
            id, path, sliceValue, sliceType, code, status
          } = intent
          const newId = id === 'unknown' ? uniqueId() : id
          const statusEnum = status as StateType
          const getCode = code === 'unknown'
            ? status as keyof typeof codes
            : code as keyof typeof codes
          const detail = codes[getCode]
          detail && intents.push({
            ...intent,
            id: newId,
            aiFeature: $t(detail.aiFeature),
            intent: $t(detail.intent),
            scope: formattedPath(path, sliceValue),
            type: nodeTypes(sliceType as NodeType),
            category: $t(detail.category),
            status: $t(states[statusEnum].text)
          } as unknown as (IntentAIRecommendationListItem))
          return intents
        }, [] as Array<IntentAIRecommendationListItem>)

        return items
      },
      providesTags: [{ type: 'Monitoring', id: 'INTENT_AI_LIST' }]
    })
  })
})

export interface Response<Recommendation> {
  intents: Recommendation[]
}

export const {
  useIntentAIRecommendationListQuery
} = api
