import { gql }                  from 'graphql-request'
import { get, snakeCase, pick } from 'lodash'
import moment                   from 'moment-timezone'

import { kpiDelta }          from '@acx-ui/analytics/utils'
import { recommendationApi } from '@acx-ui/store'
import { NetworkPath }       from '@acx-ui/utils'

import { codes } from '../config'

import { StatusTrail, IntentKPIConfig } from './config'

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
  status: string // StateType;
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


export const api = recommendationApi.injectEndpoints({
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

export const {
  useIntentCodeQuery,
  useIntentDetailsQuery
} = api
