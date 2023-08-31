import { gql }               from 'graphql-request'
import { get, snakeCase }    from 'lodash'
import moment                from 'moment-timezone'
import { MessageDescriptor } from 'react-intl'

import { recommendationApi } from '@acx-ui/store'
import { NetworkPath }       from '@acx-ui/utils'

import { states, codes, Priorities, StatusTrail } from '../config'


type RecommendationsDetailsPayload = {
  id: string;
  code?: string;
}

export type RecommendationKpi = Record<string, {
  current: number | number[];
  previous: number | null;
  projected: number | null;
}>

export type RecommendationDetails = {
  id: string;
  code: keyof typeof codes;
  status: keyof typeof states;
  isMuted: boolean;
  appliedTime: string;
  originalValue: string | Array<{ channelMode: string, channelWidth: string, radio: string }>;
  currentValue: string;
  recommendedValue: string;
  metadata: object;
  sliceType: string;
  sliceValue: string;
  path: NetworkPath;
  statusTrail: StatusTrail;
} & Partial<RecommendationKpi>

export type EnhancedRecommendation = RecommendationDetails & {
  priority: Priorities;
  summary: MessageDescriptor;
  category: MessageDescriptor;
  pathTooltip: string;
  appliedOnce: boolean;
  monitoring: null | { until: string };
  tooltipContent: string | MessageDescriptor;
}

type RecommendationApPayload = {
  id: string;
  search: string;
}

export type RecommendationAp = {
  name: string;
  mac: string;
  model: string;
  version: string;
}

export const transformDetailsResponse = (details: RecommendationDetails) => {
  const {
    code, statusTrail, status, appliedTime, currentValue, recommendedValue
  } = details
  const {
    priority, category, summary, recommendedValueTooltipContent
  } = codes[code]
  const appliedPlus24h = moment(appliedTime).add(24, 'hours')
  const monitoring = (
    status === 'applied' &&
    appliedTime &&
    Date.now() < appliedPlus24h.valueOf()
  )
    ? { until: appliedPlus24h.toISOString() }
    : null
  const tooltipContent = typeof recommendedValueTooltipContent === 'function'
    ? recommendedValueTooltipContent(status, currentValue, recommendedValue)
    : recommendedValueTooltipContent
  return {
    ...details,
    monitoring,
    tooltipContent,
    priority,
    category,
    summary,
    appliedOnce: Boolean(statusTrail.find(t => t.status === 'applied'))
  } as EnhancedRecommendation
}

export const kpiHelper = ({ code }: { code?: string }) => {
  if (!code) return ''
  const data = codes[code]
  return get(data, ['kpis'])
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
    recommendationDetails: build.query<EnhancedRecommendation, RecommendationsDetailsPayload>({
      query: (payload) => ({
        document: gql`
          query ConfigRecommendationDetails($id: String) {
            recommendation(id: $id) {
              id code status appliedTime isMuted
              originalValue currentValue recommendedValue metadata
              sliceType sliceValue
              path { type name }
              statusTrail { status createdAt }
              ${kpiHelper(payload)}
            }
          }
        `,
        variables: {
          id: payload.id
        }
      }),
      transformResponse: (response: { recommendation: RecommendationDetails }) =>
        transformDetailsResponse(response.recommendation),
      providesTags: [{ type: 'Monitoring', id: 'RECOMMENDATION_DETAILS' }]
    }),
    getAps: build.query<RecommendationAp[], RecommendationApPayload>({
      query: (payload) => ({
        document: gql`
          query GetAps($id: String, $n: Int, $search: String, $key: String) {
            recommendation(id: $id) {
              APs: APs(n: $n, search: $search, key: $key) {
                name
                mac
                model
                version
              }
            }
          }
        `,
        variables: {
          id: payload.id,
          n: 100,
          search: payload.search,
          key: 'aps-on-latest-fw-version'
        }
      }),
      transformResponse: (response: { recommendation: { APs: RecommendationAp[] } }) =>
        response.recommendation.APs
    })
  })
})

export const { useRecommendationDetailsQuery, useGetApsQuery } = api
