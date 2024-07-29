import { gql }                 from 'graphql-request'
import { snakeCase, findLast } from 'lodash'
import moment                  from 'moment-timezone'
import { MessageDescriptor }   from 'react-intl'

import { recommendationApi } from '@acx-ui/store'
import { NetworkPath }       from '@acx-ui/utils'

import { codes }                                                 from './AIDrivenRRM'
import { StateType, IconValue, StatusTrail, ConfigurationValue } from './config'

export type BasicRecommendation = {
  id: string;
  code?: string;
}

export type RecommendationWlan = {
  name: string
  ssid: string
}

export type RecommendationKpi = Record<string, {
  current: number | number[];
  previous: number | null;
  projected: number | null;
}>

export type RecommendationDetails = {
  id: string;
  code: keyof typeof codes;
  status: StateType;
  isMuted: boolean;
  appliedTime: string;
  originalValue: ConfigurationValue;
  currentValue: ConfigurationValue;
  recommendedValue: string;
  metadata: object & { scheduledAt: string, wlans?: RecommendationWlan[] };
  sliceType: string;
  sliceValue: string;
  path: NetworkPath;
  statusTrail: StatusTrail;
  updatedAt: string;
  dataEndTime: string;
  preferences?: {
    crrmFullOptimization: boolean;
  },
  trigger: string
  idPath: NetworkPath;
} & Partial<RecommendationKpi>

export type EnhancedRecommendation = RecommendationDetails & {
  priority: IconValue;
  summary: MessageDescriptor;
  category: MessageDescriptor;
  pathTooltip: string;
  appliedOnce: boolean;
  firstAppliedAt: string;
  monitoring: null | { until: string };
  tooltipContent: string | MessageDescriptor;
  crrmOptimizedState?: IconValue;
  crrmInterferingLinksText?: React.ReactNode;
  intentType?: string;
}

export const transformDetailsResponse = (details: RecommendationDetails) => {
  const {
    code,
    statusTrail,
    status,
    appliedTime
  } = details
  const {
    priority, category, summary, recommendedValueTooltipContent
  } = codes[code]
  const appliedPlus24h = moment(appliedTime).add(24, 'hours')
  const monitoring = (
    status === 'applied' &&
    !code.startsWith('c-probeflex-') &&
    appliedTime &&
    Date.now() < appliedPlus24h.valueOf()
  )
    ? { until: appliedPlus24h.toISOString() }
    : null
  const tooltipContent = recommendedValueTooltipContent
  const appliedOnce = Boolean(statusTrail.find(t => t.status === 'applied'))
  const firstAppliedAt = findLast(statusTrail, t => t.status === 'applied')?.createdAt
  return {
    ...details,
    monitoring,
    tooltipContent,
    priority,
    category,
    summary,
    appliedOnce,
    firstAppliedAt
  } as EnhancedRecommendation
}

export const kpiHelper = (code: string) => {
  if (!code) return ''
  return codes[code].kpis!
    .map(kpi => {
      const name = `kpi_${snakeCase(kpi.key)}`
      return `${name}: kpi(key: "${kpi.key}", timeZone: "${moment.tz.guess()}") {
              current${kpi.deltaSign === 'none' ? '' : ' previous'}
              projected
            }`
    })
    .join('\n')
    .trim()
}

type BasicRecommendationWithStatus = BasicRecommendation & {
  status: string
}
type MutationPayload = { id: string }
type MutationResponse = { success: boolean, errorMsg: string, errorCode: string }

interface UpdatePreferenceScheduleMutationPayload extends MutationPayload {
  status: string
  scheduledAt: string
  preferences: {
    crrmFullOptimization: boolean
  }
}
interface UpdatePreferenceScheduleMutationResponse { transition: MutationResponse }

export const api = recommendationApi.injectEndpoints({
  endpoints: (build) => ({
    recommendationCode: build.query<BasicRecommendationWithStatus, BasicRecommendation>({
      query: ({ id }) => ({
        document: gql`
          query ConfigRecommendationCode($id: String) {
            recommendation(id: $id) { id code status }
          }
        `,
        variables: { id }
      }),
      transformResponse: (response: { recommendation: BasicRecommendationWithStatus }) =>
        response.recommendation,
      providesTags: [{ type: 'Monitoring', id: 'RECOMMENDATION_CODE' }]
    }),
    configRecommendationDetails: build.query<
      EnhancedRecommendation,
      BasicRecommendation & { isCrrmPartialEnabled: boolean, status: string }
    >({
      query: ({ id, code, isCrrmPartialEnabled }) => ({
        document: gql`
          query ConfigRecommendationDetails($id: String) {
            recommendation(id: $id) {
              id code status appliedTime isMuted
              originalValue currentValue recommendedValue metadata
              sliceType sliceValue updatedAt dataEndTime
              ${isCrrmPartialEnabled ? 'preferences' : ''}
              path { type name }
              statusTrail { status createdAt }
              ${kpiHelper(code!)}
              trigger
            }
          }
        `,
        variables: { id }
      }),
      transformResponse: (response: { recommendation: RecommendationDetails }) =>
        transformDetailsResponse(response.recommendation),
      providesTags: [{ type: 'Monitoring', id: 'RECOMMENDATION_DETAILS' }]
    }),
    updatePreferenceSchedule: build.mutation<
      UpdatePreferenceScheduleMutationResponse,
      UpdatePreferenceScheduleMutationPayload
    >({
      query: ({ ...payload }) => ({
        document: gql`
          mutation TransitionMutation(
            $id: String!
            $status: String!
            $scheduledAt: DateTime
            $preferences: JSON
          ) {
            transition(
              id: $id
              status: $status
              scheduledAt: $scheduledAt
              preferences: $preferences
            ) {
              success
              errorMsg
              errorCode
            }
          }
            `,
        variables: {
          id: payload.id,
          status: payload.status,
          scheduledAt: payload.scheduledAt,
          preferences: payload.preferences
        },
        invalidatesTags: [{ type: 'Monitoring', id: 'RECOMMENDATION_DETAILS' }]
      })
    })
  })
})

export const {
  useRecommendationCodeQuery,
  useConfigRecommendationDetailsQuery,
  useUpdatePreferenceScheduleMutation
} = api
