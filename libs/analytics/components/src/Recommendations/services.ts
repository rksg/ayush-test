import { gql }           from 'graphql-request'
import moment            from 'moment'
import { defineMessage } from 'react-intl'

import {
  nodeTypes,
  getFilterPayload,
  formattedPath,
  AnalyticsFilter
} from '@acx-ui/analytics/utils'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { recommendationApi }         from '@acx-ui/store'
import { NodeType, getIntl }         from '@acx-ui/utils'

import { states, codes, disabledRecommendations } from './config'

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
  statusEnum: keyof typeof states
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
export interface MutationPayload {
  id: string
  mute: boolean
}

export interface MutationResponse {
  data: {
    toggleMute: {
      success: boolean
      errorMsg: string
      errorCode: string
    }
  }
}

interface SchedulePayload {
  id: string
  scheduledAt: string
  filters: AnalyticsFilter
}

interface ScheduleResponse {
  schedule: {
    errorCode: string;
    errorMsg: string;
    success: boolean;
  }
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
    updatedAtPlus7Days: formatter(DateFormatEnum.DateTimeFormat)(
      moment(metadata.updatedAt).add(7, 'd')
    )
  })
}
function transformResponse (recommendations: Recommendation[]) {
  const { $t } = getIntl()
  const filteredRecommendations = recommendations.filter(({ code }) =>
    !Object.keys(disabledRecommendations).includes(code))
  return filteredRecommendations.map(recommendation => {
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
      statusTooltip: getStatusTooltip(code, status, { ...metadata, updatedAt }),
      statusEnum: status as keyof typeof states
    }
  })
}
export const api = recommendationApi.injectEndpoints({
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
          start: payload.startDate,
          end: payload.endDate,
          ...getFilterPayload(payload)
        }
      }),
      transformResponse: (response: Response<Recommendation>) => {
        return transformResponse(response.recommendations)
      },
      providesTags: [{ type: 'Monitoring', id: 'RECOMMENDATION_LIST' }]
    }),
    muteRecommendation: build.mutation<MutationResponse, MutationPayload>({
      query: (payload) => ({
        document: gql`
          mutation MutateRecommendation($id: String, $mute: Boolean) {
            toggleMute(id: $id, mute: $mute) {
              success
              errorMsg
              errorCode
            }
          }
        `,
        variables: {
          id: payload.id,
          mute: payload.mute
        }
      }),
      transformResponse: (response: MutationResponse) => response,
      invalidatesTags: [{ type: 'Monitoring', id: 'RECOMMENDATION_LIST' }]
    }),
    scheduleRecommendation: build.mutation<ScheduleResponse, SchedulePayload>({
      query: (payload) => ({
        document: gql`
          mutation MutateRecommendation(
            $id: String,
            $scheduledAt: DateTime
          ) {
            schedule(id: $id, scheduledAt: $scheduledAt) {
              success
              errorMsg
              errorCode
            }
          }
        `,
        variables: {
          id: payload.id,
          scheduledAt: payload.scheduledAt,
          path: getFilterPayload(payload.filters)
        }
      }),
      invalidatesTags: [{ type: 'Monitoring', id: 'RECOMMENDATION_LIST' }]
    }),
    cancelRecommendation: build
      .mutation<ScheduleResponse, { id: string }>({
        query: (payload) => ({
          document: gql`
          mutation MutateRecommendation(
            $id: String
          ) {
            cancel(id: $id) {
              success
              errorMsg
              errorCode
            }
          }
        `,
          variables: {
            id: payload.id
          }
        }),
        invalidatesTags: [{ type: 'Monitoring', id: 'RECOMMENDATION_LIST' }]
      })
  })
})

export interface Response<Recommendation> {
  recommendations: Recommendation[]
}

export const {
  useRecommendationListQuery,
  useMuteRecommendationMutation,
  useScheduleRecommendationMutation,
  useCancelRecommendationMutation
} = api
