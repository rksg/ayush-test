import { gql }                  from 'graphql-request'
import { get, pick, snakeCase } from 'lodash'
import moment, { Moment }       from 'moment-timezone'

import { kpiDelta }                       from '@acx-ui/analytics/utils'
import { intentAIApi, recommendationApi } from '@acx-ui/store'
import { NetworkPath }                    from '@acx-ui/utils'

import { codes }                             from '../config'
import { IntentAIFormDto, IntentAIFormSpec } from '../types'


import { StateType, StatusTrail, IntentKPIConfig } from './config'

export type BasicIntent = {
  id: string;
  code: string;
  status: string;
}

export type IntentWlan = {
  name: string
  ssid: string
}

export type IntentKpi = Record<string, {
  current: number | number[];
  previous: number | null;
  projected: number | null;
}>

export type IntentDetails = {
  id: string;
  code: keyof typeof codes;
  status: StateType;
  metadata: object & { scheduledAt: string, wlans?: IntentWlan[] };
  sliceType: string;
  sliceValue: string;
  path: NetworkPath;
  statusTrail: StatusTrail;
  updatedAt: string;
  dataEndTime: string;
  preferences?: {
    crrmFullOptimization: boolean;
  }
} & Partial<IntentKpi>

export type EnhancedIntent = IntentDetails & {
  appliedOnce: boolean;
}

export function extractBeforeAfter (value: IntentKpi[string]) {
  const { current, previous, projected } = value
  const [before, after] = [previous, current, projected]
    .filter(value => value !== null)
  return [before, after]
}

export const transformDetailsResponse = (details: IntentDetails) => {
  return {
    ...details,
    appliedOnce: Boolean(details.statusTrail.find(t => t.status === 'applied')),
    preferences: details.preferences || undefined // prevent _.merge({ x: {} }, { x: null })
  } as EnhancedIntent
}

export const kpiHelper = (kpis: IntentKPIConfig[]) => {
  return kpis.map(kpi => {
    const name = `kpi_${snakeCase(kpi.key)}`
    return `${name}: kpi(key: "${kpi.key}", timeZone: "${moment.tz.guess()}") {
            current${kpi.deltaSign === 'none' ? '' : ' previous'}
            projected
          }`
  })
    .join('\n')
    .trim()
}

// simplified handling of getKpis from libs/analytics/components/src/Recommendations/RecommendationDetails/Kpis.tsx
export function getGraphKPIs (
  intent: EnhancedIntent,
  kpis: IntentKPIConfig[]
) {
  return kpis.map((kpi) => {
    const [before, after] = extractBeforeAfter(
      get(intent, `kpi_${snakeCase(kpi.key)}`) as IntentKpi[string]
    ) as [number, number]
    const delta = kpiDelta(before, after, kpi.deltaSign, kpi.format)
    return { ...pick(kpi, ['key', 'label']), before, after, delta }
  })
}

type MutationResponse = { success: boolean, errorMsg: string, errorCode: string }

interface UpdatePreferenceScheduleMutationResponse { transition: MutationResponse }

export function roundUpTimeToNearest15Minutes (timeStr: string) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes
  const roundedMinutes = Math.ceil(totalMinutes / 15) * 15
  const roundedHours = Math.floor(roundedMinutes / 60)
  const roundedMinutesInHour = roundedMinutes % 60
  const decimalHour = roundedHours + roundedMinutesInHour / 60
  return decimalHour
}

function decimalToTimeString (decimalHours: number) {
  const hours = Math.floor(decimalHours)
  const fractionalHours = decimalHours - hours
  const minutes = Math.floor(fractionalHours * 60)
  const seconds = Math.round((fractionalHours * 60 - minutes) * 60)
  const time = moment.utc().set({ hour: hours, minute: minutes, second: seconds })
  return time.format('HH:mm:ss')
}

function handleScheduledAt (scheduledAt:string) {
  const originalScheduledAt = moment(scheduledAt)
  const futureThreshold = moment().add(15, 'minutes')
  if (originalScheduledAt.isBefore(futureThreshold)) {
    const newScheduledAt = originalScheduledAt.add(1, 'day')
    return newScheduledAt.toISOString()
  } else {
    return originalScheduledAt.toISOString()
  }
}

export function specToDto (
  rec: IntentAIFormSpec
): IntentAIFormDto | undefined {
  let dto = {
    id: rec.id,
    // status: rec.status,
    status: 'new',
    preferences: rec.preferences,
    sliceValue: rec.sliceValue,
    updatedAt: rec.updatedAt
  } as IntentAIFormDto

  let date: Moment | null = null
  let hour: number | null = null
  if (rec.metadata) {
    if (rec.metadata.scheduledAt) {
      const localScheduledAt =moment.utc(rec.metadata.scheduledAt).local()
      date=localScheduledAt
      hour=roundUpTimeToNearest15Minutes(
        localScheduledAt.format('HH:mm:ss')
      )
    }
  }


  // let date: Moment | null = moment()
  // let hour: number | null = 7.5

  dto = {
    ...dto,
    settings: {
      date: date,
      hour: hour
    }
  } as IntentAIFormDto
  return dto
}

export function processDtoToPayload (dto: IntentAIFormDto) {
  const newDate = dto!.settings!.date!.format('YYYY-MM-DD')
  const newHour = decimalToTimeString(dto.settings!.hour!)
  const offset = moment().format('Z')
  const scheduledAt = moment.parseZone(
    `${newDate}T${newHour}.000${offset}`).utc().toISOString()
  const newScheduledAt = handleScheduledAt(scheduledAt)
  console.log(newScheduledAt)
  return {
    id: dto.id,
    status: dto.status,
    metadata: {
      scheduledAt: newScheduledAt,
      preferences: dto.preferences
    }
  }
}

export const recApi = recommendationApi.injectEndpoints({
  endpoints: (build) => ({
    intentCode: build.query<BasicIntent, Pick<BasicIntent, 'id'>>({
      query: (variables) => ({
        variables,
        document: gql`query IntentCode($id: String) {
          intent: recommendation(id: $id) { id code status }
        }`
      }),
      transformResponse: (response: { intent: BasicIntent }) => response.intent,
      providesTags: [{ type: 'Intent', id: 'INTENT_CODE' }]
    }),
    intentDetails: build.query<EnhancedIntent, { id: string; kpis: IntentKPIConfig[] }>({
      query: ({ id, kpis }) => ({
        document: gql`
          query IntentDetails($id: String) {
            intent: recommendation(id: $id) {
              id code status metadata
              sliceType sliceValue updatedAt dataEndTime
              preferences path { type name }
              statusTrail { status createdAt }
              ${kpiHelper(kpis)}
            }
          }
        `,
        variables: { id }
      }),
      transformResponse: (response: { intent: IntentDetails }) =>
        transformDetailsResponse(response.intent),
      providesTags: [{ type: 'Intent', id: 'INTENT_DETAILS' }]
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
  useIntentCodeQuery,
  useIntentDetailsQuery
} = recApi

export const {
  useUpdatePreferenceScheduleMutation
} = intentApi
