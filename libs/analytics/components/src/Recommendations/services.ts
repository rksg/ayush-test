import { gql }           from 'graphql-request'
import _, { uniqueId }   from 'lodash'
import moment            from 'moment'
import { defineMessage } from 'react-intl'

import {
  nodeTypes,
  formattedPath,
  productNames
} from '@acx-ui/analytics/utils'
import { DateFormatEnum, formatter }      from '@acx-ui/formatter'
import { recommendationApi }              from '@acx-ui/store'
import { NodeType, getIntl, NetworkPath } from '@acx-ui/utils'
import type { PathFilter }                from '@acx-ui/utils'

import {
  states,
  codes,
  StatusTrail,
  IconValue,
  StateType,
  crrmStates
} from './config'
import { kpiHelper, RecommendationKpi } from './RecommendationDetails/services'
import { CRRMStates }                   from './states'

export type CrrmListItem = {
  id: string
  code: string
  status: StateType
  sliceValue: string
  statusTrail: StatusTrail
  crrmOptimizedState?: IconValue
  summary?: string
  updatedAt: string
  metadata: {}
} & Partial<RecommendationKpi>

export type CrrmList = {
  crrmCount: number
  zoneCount: number
  optimizedZoneCount: number
  crrmScenarios: number
  recommendations: CrrmListItem[]
}

export type CrrmKpi = {
  recommendation: {
    status: StateType
    kpi_number_of_interfering_links: RecommendationKpi['']
  }
}

export type AiOpsListItem = {
  id: string
  code: string
  updatedAt: string
  sliceValue: string
  priority?: IconValue
  category?: string
  summary?: string
  status: string
  metadata: {}
}

export type AiOpsList = {
  aiOpsCount: number
  recommendations: AiOpsListItem[]
}

export type Recommendation = {
  id: string
  code: string
  status: string | StateType
  createdAt: string
  updatedAt: string
  sliceType: string
  sliceValue: string
  metadata: object & { scheduledAt: string }
  isMuted: boolean
  mutedBy: string
  mutedAt: string | null
  path: NetworkPath
  idPath: NetworkPath
  preferences?: {
    crrmFullOptimization: boolean
  }
  statusTrail: StatusTrail
  toggles?: { crrmFullOptimization: boolean }
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
  type: string
  scheduledAt: string
}
interface ScheduleResponse {
  schedule: {
    errorCode: string;
    errorMsg: string;
    success: boolean;
  }
}

interface PreferencePayload {
  path: NetworkPath
  preferences: {
    crrmFullOptimization: boolean
  }
}

interface PreferenceResponse {
  setPreference: {
    errorCode: string
    errorMsg: string
    success: boolean
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
  if (state.includes('failed') && metadata.error?.details) {
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

const optimizedStates = [ 'applied', 'applyscheduleinprogress', 'applyscheduled']
export const unknownStates = [
  CRRMStates.insufficientLicenses,
  CRRMStates.verificationError,
  CRRMStates.verified,
  CRRMStates.unqualifiedZone,
  CRRMStates.noAps,
  CRRMStates.unknown
]

export const getCrrmOptimizedState = (state: StateType) => {
  return optimizedStates.includes(state)
    ? crrmStates.optimized
    : unknownStates.includes(state as CRRMStates)
      ? crrmStates[state as CRRMStates]
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

  if (status === 'new') return $t({
    // eslint-disable-next-line max-len
    defaultMessage: '{before} interfering {before, plural, one {link} other {links}} can be optimized to {after}',
    description: 'Translation string - interfering, link, links, can be optimized to'
  }, { before, after }) as string

  return $t({
    // eslint-disable-next-line max-len
    defaultMessage: 'From {before} to {after} interfering {after, plural, one {link} other {links}}',
    description: 'Translation string - From, to, interfering, link, links'
  }, { before, after }) as string
}

export const api = recommendationApi.injectEndpoints({
  endpoints: (build) => ({
    crrmList: build.query<
      CrrmList,
      PathFilter & { n: number }
    >({
      query: (payload) => ({
        // kpiHelper hard-coded to c-crrm-channel24g-auto as it's the same for all crrm
        document: gql`
        query CrrmList(
          $startDate: DateTime, $endDate: DateTime,
          $path: [HierarchyNodeInput], $n: Int, $status: [String]
        ) {
          crrmCount: recommendationCount(start: $startDate, end: $endDate, path: $path, crrm: true)
          zoneCount: recommendationCount(
            start: $startDate,
            end: $endDate,
            path: $path,
            crrm: true,
            uniqueBy: "sliceValue"
          )
          optimizedZoneCount: recommendationCount(
            start: $startDate,
            end: $endDate,
            path: $path,
            crrm: true,
            status: $status,
            uniqueBy: "sliceValue"
          )
          crrmScenarios(start: $startDate, end: $endDate, path: $path)
          recommendations(start: $startDate, end: $endDate, path: $path, n: $n, crrm: true) {
            id code status sliceValue updatedAt metadata
          }
        }
        `,
        variables: {
          ..._.pick(payload, ['path', 'startDate', 'endDate', 'n']),
          status: optimizedStates
        }
      }),
      transformResponse: (response: CrrmList) => {
        const { $t } = getIntl()
        return {
          crrmCount: response.crrmCount,
          zoneCount: response.zoneCount,
          optimizedZoneCount: response.optimizedZoneCount,
          crrmScenarios: response.crrmScenarios,
          recommendations: response.recommendations.map(recommendation => {
            const { id, code, status } = recommendation
            const newId = id === 'unknown' ? uniqueId() : id
            const getCode = code === 'unknown'
              ? status as keyof typeof codes
              : code as keyof typeof codes
            return {
              ...recommendation,
              id: newId,
              crrmOptimizedState: getCrrmOptimizedState(status),
              summary: $t(codes[getCode].summary)
            } as unknown as CrrmListItem
          })
        }
      },
      providesTags: [{ type: 'Monitoring', id: 'RECOMMENDATION_LIST' }]
    }),
    aiOpsList: build.query<
      AiOpsList,
      PathFilter & { n: number }
    >({
      query: (payload) => ({
        document: gql`
        query AiOpsList(
          $startDate: DateTime, $endDate: DateTime, $path: [HierarchyNodeInput], $n: Int
        ) {
          aiOpsCount: recommendationCount(
            start: $startDate, end: $endDate, path: $path, crrm: false
          )
          recommendations(start: $startDate, end: $endDate, path: $path, n: $n, crrm: false) {
            id code updatedAt sliceValue status metadata
          }
        }
        `,
        variables: _.pick(payload, ['path', 'startDate', 'endDate', 'n'])
      }),
      transformResponse: (response: AiOpsList) => {
        const { $t } = getIntl()
        return {
          aiOpsCount: response.aiOpsCount,
          recommendations: response.recommendations.map(recommendation => {
            const { code, status } = recommendation
            const getCode = code === 'unknown'
              ? status as keyof typeof codes
              : code as keyof typeof codes
            return {
              ...recommendation,
              priority: codes[getCode].priority,
              category: $t(codes[getCode].category),
              summary: $t(codes[getCode].summary)
            } as unknown as AiOpsListItem
          })
        }
      },
      providesTags: [{ type: 'Monitoring', id: 'RECOMMENDATION_LIST' }]
    }),
    recommendationList: build.query<
      RecommendationListItem[],
      PathFilter & { crrm?: boolean, isCrrmPartialEnabled: boolean }
    >({
      query: (payload) => ({
        document: gql`
        query RecommendationList(
          $startDate: DateTime, $endDate: DateTime, $path: [HierarchyNodeInput], $crrm: Boolean
        ) {
          recommendations(start: $startDate, end: $endDate, path: $path, crrm: $crrm) {
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
            ${payload.isCrrmPartialEnabled ? 'preferences' : ''}
            path {
              type
              name
            }
            idPath {
              type
              name
            }
            statusTrail { status }
          }
        }
        `,
        variables: _.pick(payload, ['path', 'startDate', 'endDate', 'crrm'])
      }),
      transformResponse: (response: Response<Recommendation>) => {
        const { $t } = getIntl()
        const items = response.recommendations.map(recommendation => {
          const {
            id, path, sliceValue, sliceType, code, status, metadata, updatedAt
          } = recommendation
          const isFullOptimization = !!_.get(metadata, 'algorithmData.isCrrmFullOptimization', true)
          const newId = id === 'unknown' ? uniqueId() : id
          const statusEnum = status as StateType
          const getCode = code === 'unknown'
            ? status as keyof typeof codes
            : code as keyof typeof codes
          return {
            ...recommendation,
            id: newId,
            pathKey: JSON.stringify(recommendation.idPath),
            scope: formattedPath(path, sliceValue),
            type: nodeTypes(sliceType as NodeType),
            priority: {
              ...codes[getCode].priority,
              text: $t(codes[getCode].priority.label)
            },
            category: $t(codes[getCode].category),
            summary: isFullOptimization || code === 'unknown'
              ? $t(codes[getCode].summary)
              : $t(codes[getCode].partialOptimizedSummary!),
            status: $t(states[statusEnum].text),
            statusTooltip: getStatusTooltip(code, statusEnum, { ...metadata, updatedAt }),
            statusEnum,
            ...((code.includes('crrm') || code === 'unknown') && {
              crrmOptimizedState: {
                ...getCrrmOptimizedState(statusEnum),
                text: $t(getCrrmOptimizedState(statusEnum).label)
              }
            })
          }
        })

        // eslint-disable-next-line max-len
        const appliedStates = ['applyscheduled', 'applyscheduleinprogress', 'applied', 'revertscheduled', 'revertscheduleinprogress', 'revertfailed', 'applywarning']
        const grouped = _.groupBy(items, 'pathKey')

        return items.map(({ pathKey, ...item }) => {
          if (item.code === 'unknown') return { ...item, toggles: { crrmFullOptimization: true } }
          if (!item.code.startsWith('c-crrm')) return item
          return {
            ...item,
            toggles: {
              crrmFullOptimization: grouped[pathKey]
                .every(v => !appliedStates.includes(v.statusEnum))
            }
          }
        })
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
          actionType: payload.type,
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
    }),
    crrmKpi: build.query<{ text: string }, Pick<CrrmListItem, 'id' | 'code'>>({
      query: ({ id, code }) => ({
        document: gql`
          query CrrmKpi($id: String) {
            recommendation(id: $id) {
              id status ${kpiHelper(code!)}
            }
          }
        `,
        variables: { id }
      }),
      transformResponse: (response: CrrmKpi) => {
        const { status, kpi_number_of_interfering_links } = response.recommendation
        return {
          text: getCrrmInterferingLinksText(
            status,
            kpi_number_of_interfering_links!
          )
        }
      },
      providesTags: [{ type: 'Monitoring', id: 'RECOMMENDATION_DETAILS' }]
    }),
    setPreference: build.mutation<PreferenceResponse, PreferencePayload>({
      query: (variables) => ({
        variables,
        document: gql`
          mutation SetPreference($path: [HierarchyNodeInput], $preferences: JSON) {
            setPreference(path: $path, preferences: $preferences) { success errorMsg errorCode }
          }
        `
      }),
      invalidatesTags: [
        { type: 'Monitoring', id: 'RECOMMENDATION_LIST' },
        { type: 'Monitoring', id: 'RECOMMENDATION_CODE' },
        { type: 'Monitoring', id: 'RECOMMENDATION_DETAILS' }
      ]
    })
  })
})


export interface Response<Recommendation> {
  recommendations: Recommendation[]
}

export const {
  useCrrmListQuery,
  useAiOpsListQuery,
  useRecommendationListQuery,
  useMuteRecommendationMutation,
  useScheduleRecommendationMutation,
  useCancelRecommendationMutation,
  useCrrmKpiQuery,
  useSetPreferenceMutation
} = api
