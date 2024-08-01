import { gql }               from 'graphql-request'
import { snakeCase }         from 'lodash'
import moment                from 'moment-timezone'
import { MessageDescriptor } from 'react-intl'

import { recommendationApi } from '@acx-ui/store'
import { NetworkPath }       from '@acx-ui/utils'

import { codes }                             from './AIDrivenRRM'
import { StateType, IconValue, StatusTrail } from './config'

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
  recommendedValue: string;
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
  priority: IconValue;
  summary: MessageDescriptor;
  category: MessageDescriptor;
  appliedOnce: boolean;
  tooltipContent: string | MessageDescriptor;
  crrmInterferingLinks?: {
    before: number;
    after: number;
  }
  intentType?: string;
}

export type CrrmListItem = {
  id: string
  code: string
  status: StateType
  sliceValue: string
  statusTrail: StatusTrail
  summary?: string
  updatedAt: string
  metadata: {}
} & Partial<IntentKpi>

export function extractBeforeAfter (value: IntentKpi[string]) {
  const { current, previous, projected } = value
  const [before, after] = [previous, current, projected]
    .filter(value => value !== null)
  return [before, after]
}

export const getCrrmInterferingLinks = (
  kpi_number_of_interfering_links: IntentKpi[string]
) => {
  const [before, after] = extractBeforeAfter(kpi_number_of_interfering_links)
  return { before, after }
}

export const transformDetailsResponse = (details: IntentDetails) => {
  const {
    code,
    statusTrail,
    kpi_number_of_interfering_links
  } = details
  const { priority, category, summary } = codes[code]

  return {
    ...details,
    priority,
    category,
    summary,
    appliedOnce: Boolean(statusTrail.find(t => t.status === 'applied')),
    crrmInterferingLinks: getCrrmInterferingLinks(kpi_number_of_interfering_links!),
    preferences: details.preferences || undefined // prevent _.merge({ x: {} }, { x: null })
  } as EnhancedIntent
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
    intentDetails: build.query<EnhancedIntent, Pick<BasicIntent, 'id' | 'code'>>({
      query: ({ id, code }) => ({
        document: gql`
          query IntentDetails($id: String) {
            intent: recommendation(id: $id) {
              id code status metadata
              sliceType sliceValue updatedAt dataEndTime
              preferences path { type name }
              statusTrail { status createdAt }
              ${kpiHelper(code)}
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
