import { gql }           from 'graphql-request'
import moment            from 'moment'
import { defineMessage } from 'react-intl'

import {
  nodeTypes,
  getFilterPayload,
  formattedPath,
  productNames
} from '@acx-ui/analytics/utils'
import { DateFormatEnum, formatter }      from '@acx-ui/formatter'
import { recommendationApi }              from '@acx-ui/store'
import { NodeType, getIntl, NetworkPath } from '@acx-ui/utils'
import type { AnalyticsFilter }           from '@acx-ui/utils'

import { states,
  codes,
  StatusTrail,
  IconValue,
  StateType,
  crrmStates
} from './config'
import { kpiHelper, RecommendationKpi } from './RecommendationDetails/services'


export type CrrmListItem = {
  id: string
  status: StateType
  sliceValue: string
  statusTrail: StatusTrail
  crrmOptimizedState?: IconValue
  crrmInterferingLinksText?: React.ReactNode
} & Partial<RecommendationKpi>

export type Recommendation = {
  id: string
  code: string
  status: string | StateType
  createdAt: string
  updatedAt: string
  sliceType: string
  sliceValue: string
  metadata: {}
  isMuted: boolean
  mutedBy: string
  mutedAt: string | null
  path: NetworkPath
}

export type CrrmData = {
  recommendations: CrrmListItem[]
  crrmScenario: {
    total: number
  }
  crrmCount: {
    total: number
    optimized: number
  }
}

export type RecommendationListItem = Recommendation & {
  scope: string
  type: string
  priority: IconValue
  category: string
  summary: string
  status: string
  statusTooltip: string
  statusEnum: StateType
  crrmOptimizedState?: IconValue
}

export interface MutationPayload {
  id: string
  mute: boolean
}
export interface MutationResponse {
  toggleMute: {
    success: boolean
    errorMsg: string
    errorCode: string
  }
}

interface SchedulePayload {
  id: string
  scheduledAt: string
}
interface ScheduleResponse {
  schedule: {
    errorCode: string;
    errorMsg: string;
    success: boolean;
  }
}

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

const radioConfigMap = {
  radio24g: '2.4 GHz',
  radio5g: '5 GHz',
  radio6g: '6 GHz',
  radio5gLower: 'Lower 5 GHz',
  radio5gUpper: 'Upper 5 GHz'
}

const getStatusTooltip = (code: string, state: StateType, metadata: Metadata) => {
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
  const stateConfig = states[state]
  return $t(stateConfig[tooltipKey as keyof typeof stateConfig], {
    ...productNames,
    count: metadata.error?.details?.length || 1,
    errorMessage: errorMessage,
    updatedAt: formatter(DateFormatEnum.DateTimeFormat)(metadata.updatedAt),
    scheduledAt: formatter(DateFormatEnum.DateTimeFormat)(metadata.scheduledAt),
    updatedAtPlus7Days: formatter(DateFormatEnum.DateTimeFormat)(
      moment(metadata.updatedAt).add(7, 'd')
    )
  })
}

export const getCrrmOptimizedState = (state: StateType) => {
  const optimizedStates = ['applied', 'applyscheduleinprogress', 'applyscheduled']
  return optimizedStates.includes(state)
    ? crrmStates.optimized
    : crrmStates.nonOptimized
}

export function extractBeforeAfter (value: CrrmListItem['kpis']) {
  const { current, previous, projected } = value!
  const [before, after] = [previous, current, projected]
    .filter(value => value !== null)
  return [before, after]
}

export const getCrrmInterferingLinksText = (
  status: StateType,
  kpi_number_of_interfering_links: RecommendationKpi['']
) => {
  const { $t } = getIntl()
  if (status === 'reverted') return $t(states.reverted.text)
  if (status === 'applyfailed') return $t(states.applyfailed.text)
  if (status === 'revertfailed') return $t(states.revertfailed.text)
  const [before, after] = extractBeforeAfter(kpi_number_of_interfering_links)
  if (kpi_number_of_interfering_links!.previous) return $t({
    // eslint-disable-next-line max-len
    defaultMessage: 'From {before} to {after} interfering {after, plural, one {link} other {links}}',
    description: 'Translation string - From, to, interfering, link, links'
  }, { before, after })
  if (status === 'new') return $t({
    // eslint-disable-next-line max-len
    defaultMessage: '{before} interfering {before, plural, one {link} other {links}} can be optimized to {after}',
    description: 'Translation string - interfering, link, links, can be optimized to'
  }, { before, after })
  return $t({
    // eslint-disable-next-line max-len
    defaultMessage: '{before} interfering {before, plural, one {link} other {links}} will be optimized to {after}',
    description: 'Translation string - interfering, link, links, will be optimized to'
  }, { before, after })
}

export function transformCrrmList (recommendations: CrrmListItem[]): CrrmListItem[] {
  return recommendations.map(recommendation => {
    const { status, kpi_number_of_interfering_links } = recommendation
    return {
      ...recommendation,
      crrmOptimizedState: getCrrmOptimizedState(recommendation.status),
      crrmInterferingLinksText: getCrrmInterferingLinksText(
        status,
        kpi_number_of_interfering_links!
      )
    } as unknown as CrrmListItem
  })
}

function transformRecommendationList (recommendations: Recommendation[]): RecommendationListItem[] {
  const { $t } = getIntl()
  return recommendations.map(recommendation => {
    const { path, sliceValue, sliceType, code, status, metadata, updatedAt } = recommendation
    const statusEnum = status as StateType
    return {
      ...recommendation,
      scope: formattedPath(path, sliceValue),
      type: nodeTypes(sliceType as NodeType),
      priority: codes[code as keyof typeof codes].priority,
      category: $t(codes[code as keyof typeof codes].category),
      summary: $t(codes[code as keyof typeof codes].summary),
      status: $t(states[statusEnum].text),
      statusTooltip: getStatusTooltip(code, statusEnum, { ...metadata, updatedAt }),
      statusEnum,
      ...(code.includes('crrm') && {
        crrmOptimizedState: getCrrmOptimizedState(statusEnum)
      })
    }
  })
}

export const api = recommendationApi.injectEndpoints({
  endpoints: (build) => ({
    crrmList: build.query<
      CrrmData,
      AnalyticsFilter & { n: number, m: number }
    >({
      query: (payload) => ({
        // kpiHelper hard-coded to c-crrm-channel24g-auto as it's the same for all crrm
        document: gql`
        query CrrmList(
          $start: DateTime, $end: DateTime, $path: [HierarchyNodeInput], $n: Int, $m: Int
        ) {
          crrmCount(start: $start, end: $end, path: $path, n: $m, crrm: true) {
            status
          }
          crrmScenario(start: $start, end: $end, path: $path, n: $m, crrm: true) {
            total
          }
          recommendations(start: $start, end: $end, path: $path, n: $n, crrm: true) {
            id
            status
            sliceValue
            ${kpiHelper('c-crrm-channel24g-auto')}
          }
        }
        `,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          n: payload.n,
          m: payload.m,
          ...getFilterPayload(payload)
        }
      }),
      transformResponse: (response: CrrmResponse) => {
        return {
          recommendations: transformCrrmList(response.recommendations),
          crrmCount: {
            total: response.crrmCount?.length,
            optimized: response.crrmCount
              ?.filter(i => getCrrmOptimizedState(i.status as StateType).order === 0).length
          },
          crrmScenario: response.crrmScenario
        }
      },
      providesTags: [{ type: 'Monitoring', id: 'RECOMMENDATION_LIST' }]
    }),
    recommendationList: build.query<
      RecommendationListItem[],
      AnalyticsFilter & { crrm?: boolean }
    >({
      query: (payload) => ({
        document: gql`
        query RecommendationList(
          $start: DateTime, $end: DateTime, $path: [HierarchyNodeInput], $crrm: Boolean
        ) {
          recommendations(start: $start, end: $end, path: $path, crrm: $crrm) {
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
          crrm: payload.crrm,
          ...getFilterPayload(payload)
        }
      }),
      transformResponse: (response: Response<Recommendation>) => {
        return transformRecommendationList(response.recommendations)
      },
      providesTags: [{ type: 'Monitoring', id: 'RECOMMENDATION_LIST' }]
    }),
    muteRecommendation: build.mutation<MutationResponse, MutationPayload>({
      query: (payload) => ({
        document: gql`
          mutation MuteRecommendation($id: String, $mute: Boolean) {
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
      invalidatesTags: [
        { type: 'Monitoring', id: 'RECOMMENDATION_LIST' },
        { type: 'Monitoring', id: 'RECOMMENDATION_CODE' },
        { type: 'Monitoring', id: 'RECOMMENDATION_DETAILS' }
      ]
    }),
    scheduleRecommendation: build.mutation<ScheduleResponse, SchedulePayload>({
      query: (payload) => ({
        document: gql`
          mutation ScheduleRecommendation(
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
          scheduledAt: payload.scheduledAt
        }
      }),
      invalidatesTags: [
        { type: 'Monitoring', id: 'RECOMMENDATION_LIST' },
        { type: 'Monitoring', id: 'RECOMMENDATION_CODE' },
        { type: 'Monitoring', id: 'RECOMMENDATION_DETAILS' }
      ]
    }),
    cancelRecommendation: build.mutation<ScheduleResponse, { id: string }>({
      query: (payload) => ({
        document: gql`
        mutation CancelRecommendation(
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
      invalidatesTags: [
        { type: 'Monitoring', id: 'RECOMMENDATION_LIST' },
        { type: 'Monitoring', id: 'RECOMMENDATION_CODE' },
        { type: 'Monitoring', id: 'RECOMMENDATION_DETAILS' }
      ]
    })
  })
})

export interface CrrmResponse {
  recommendations: CrrmListItem[],
  crrmScenario: {
    total: number
  },
  crrmCount: Recommendation[]
}

export interface Response<Recommendation> {
  recommendations: Recommendation[]
}

export const {
  useCrrmListQuery,
  useRecommendationListQuery,
  useMuteRecommendationMutation,
  useScheduleRecommendationMutation,
  useCancelRecommendationMutation
} = api
