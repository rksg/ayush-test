import { gql }                  from 'graphql-request'
import { get, pick, snakeCase } from 'lodash'
import moment, { Moment }       from 'moment-timezone'

import { kpiDelta }                       from '@acx-ui/analytics/utils'
import { intentAIApi, recommendationApi } from '@acx-ui/store'
import { NetworkPath }                    from '@acx-ui/utils'

import { codes } from '../config'

import { StateType, StatusTrail, IntentKPIConfig } from './config'
import { handleScheduledAt }                       from './utils'

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
  settings: SettingsType
}

export type SettingsType = {
  date: Moment | null,
  hour: number | null
}

export function extractBeforeAfter (value: IntentKpi[string]) {
  const { current, previous, projected } = value
  const [before, after] = [previous, current, projected]
    .filter(value => value !== null)
  return [before, after]
}

export const transformDetailsResponse = (details: IntentDetails) => {
  let date: Moment | null = null
  let hour: number | null = null

  // date= moment('2024-08-13')
  // hour= 1.75
  if (details.metadata) {
    if (details.metadata.scheduledAt) {
      const localScheduledAt =moment.utc(details.metadata.scheduledAt).local()
      date=localScheduledAt
      hour=roundUpTimeToNearest15Minutes(
        localScheduledAt.format('HH:mm:ss')
      )
    }
  }
  return {
    ...details,
    // status: 'new',
    appliedOnce: Boolean(details.statusTrail.find(t => t.status === 'applied')),
    preferences: details.preferences || undefined, // prevent _.merge({ x: {} }, { x: null })
    settings: {
      date: date,
      hour: hour
    }
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

export function getLocalScheduledAt (date: Moment, hour: number) {
  const newDate = date.format('YYYY-MM-DD')
  const newHour = decimalToTimeString(hour)
  const offset = moment().format('Z').replace(':00', '')
  return `${newDate}T${newHour}${offset}`
}

export function processDtoToPayload (dto: EnhancedIntent) { // this function handle tz diff, checking of etl buffer done in summary
  console.log(dto)
  const localScheduledAt = getLocalScheduledAt(dto!.settings!.date!, dto.settings!.hour!)
  const newScheduledAt = handleScheduledAt(localScheduledAt)
  const utcScheduledAt = moment.parseZone(newScheduledAt).utc().toISOString()
  // const newScheduledAt = handleScheduledAt(scheduledAt)
  return {
    id: dto.id,
    status: dto.status,
    metadata: {
      scheduledAt: utcScheduledAt,
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
      EnhancedIntent
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
