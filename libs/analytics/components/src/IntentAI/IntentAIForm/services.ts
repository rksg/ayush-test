import { gql }                 from 'graphql-request'
import { snakeCase, findLast } from 'lodash'
import moment                  from 'moment-timezone'
import { MessageDescriptor }   from 'react-intl'

import { intentAIApi, recommendationApi } from '@acx-ui/store'
import { NetworkPath }                    from '@acx-ui/utils'

import { IntentAIFormDto } from '../types'

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

type MutationResponse = { success: boolean, errorMsg: string, errorCode: string }

interface UpdatePreferenceScheduleMutationResponse { transition: MutationResponse }

function roundUpTimeToNearest15Minutes (timeStr: string) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes
  const roundedMinutes = Math.ceil(totalMinutes / 15) * 15
  const roundedHours = Math.floor(roundedMinutes / 60)
  const roundedMinutesInHour = roundedMinutes % 60
  const decimalHour = roundedHours + roundedMinutesInHour / 60
  return String(decimalHour)
}

export function specToDto (
  rec: EnhancedRecommendation
): IntentAIFormDto | undefined {
  let dto = {
    id: rec.id,
    status: rec.status,
    preferences: rec.preferences,
    sliceValue: rec.sliceValue,
    updatedAt: rec.updatedAt
  } as IntentAIFormDto
  if (rec.metadata) {
    const scheduledAt = rec.metadata.scheduledAt ?? new Date().toISOString()
    const dateTime = moment(scheduledAt)
    // const date = dateTime.format('YYYY-MM-DD')
    const date = '2024-08-19' // to be removed
    // const time = roundUpTimeToNearest15Minutes(dateTime.format('HH:mm:ss'))
    const time = 5.5 // to be removed
    dto = {
      ...dto,
      settings: {
        date: date,
        hour: time
      }
    } as IntentAIFormDto
  }

  console.log('this is specToDtoo')
  console.log(dto)
  return dto
}

export function processDtoToPayload (dto: IntentAIFormDto) {
  const newScheduledAt = `${dto.settings!.date}T${dto.settings!.hour}`
  console.log('this is dto to payload')
  console.log(dto)
  return {
    id: dto.id,
    status: dto.status,
    scheduledAt: newScheduledAt,
    preferences: dto.preferences
  }
}

export const recApi = recommendationApi.injectEndpoints({
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
    })
  })
})

export const intentApi = intentAIApi.injectEndpoints({
  endpoints: (build) => ({
    updatePreferenceSchedule: build.mutation<
      UpdatePreferenceScheduleMutationResponse,
      IntentAIFormDto
    >({
      query: (variables) => ({
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
        variables: processDtoToPayload(variables),
        invalidatesTags: [{ type: 'Monitoring', id: 'RECOMMENDATION_DETAILS' }]
      })
    })
  })
})

export const {
  useRecommendationCodeQuery,
  useConfigRecommendationDetailsQuery
} = recApi

export const {
  useUpdatePreferenceScheduleMutation
} = intentApi


