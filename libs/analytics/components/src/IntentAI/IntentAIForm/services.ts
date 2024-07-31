import { gql }                 from 'graphql-request'
import { snakeCase, findLast } from 'lodash'
import moment                  from 'moment-timezone'
import { MessageDescriptor }   from 'react-intl'

import { recommendationApi } from '@acx-ui/store'
import { NetworkPath }       from '@acx-ui/utils'

import { codes }                                                 from './AIDrivenRRM'
import { StateType, IconValue, StatusTrail, ConfigurationValue } from './config'

export type BasicIntent = {
  id: string;
  code?: string;
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
  isMuted: boolean;
  appliedTime: string;
  originalValue: ConfigurationValue;
  currentValue: ConfigurationValue;
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
  },
  trigger: string
  idPath: NetworkPath;
} & Partial<IntentKpi>

export type EnhancedIntent = IntentDetails & {
  priority: IconValue;
  summary: MessageDescriptor;
  category: MessageDescriptor;
  pathTooltip: string;
  appliedOnce: boolean;
  firstAppliedAt: string;
  monitoring: null | { until: string };
  tooltipContent: string | MessageDescriptor;
  crrmOptimizedState?: IconValue;
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
  crrmOptimizedState?: IconValue
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
    status,
    appliedTime,
    kpi_number_of_interfering_links
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
    firstAppliedAt,
    crrmInterferingLinks: getCrrmInterferingLinks(kpi_number_of_interfering_links!)
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
    recommendationCode: build.query<BasicIntent, Pick<BasicIntent, 'id'>>({
      query: ({ id }) => ({
        document: gql`
          query ConfigRecommendationCode($id: String) {
            recommendation(id: $id) { id code status }
          }
        `,
        variables: { id }
      }),
      transformResponse: (response: { recommendation: BasicIntent }) =>
        response.recommendation,
      providesTags: [{ type: 'Monitoring', id: 'RECOMMENDATION_CODE' }]
    }),
    configRecommendationDetails: build.query<
      EnhancedIntent,
      BasicIntent & { isCrrmPartialEnabled: boolean }
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
      transformResponse: (response: { recommendation: IntentDetails }) =>
        transformDetailsResponse(response.recommendation),
      providesTags: [{ type: 'Monitoring', id: 'RECOMMENDATION_DETAILS' }]
    })
  })
})

export const {
  useRecommendationCodeQuery,
  useConfigRecommendationDetailsQuery
} = api
