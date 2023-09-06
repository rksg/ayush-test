import { gql }               from 'graphql-request'
import { get, snakeCase }    from 'lodash'
import moment                from 'moment-timezone'
import { MessageDescriptor } from 'react-intl'

import { recommendationApi } from '@acx-ui/store'
import { NetworkPath }       from '@acx-ui/utils'

import { StateType, codes, IconValue, StatusTrail }           from '../config'
import { getCrrmOptimizedState, getCrrmInterferingLinksText } from '../services'


export type BasicRecommendation = {
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
  status: StateType;
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
  priority: IconValue;
  summary: MessageDescriptor;
  category: MessageDescriptor;
  pathTooltip: string;
  appliedOnce: boolean;
  monitoring: null | { until: string };
  tooltipContent: string | MessageDescriptor;
  crrmOptimizedState?: IconValue;
  crrmInterferingLinksText?: React.ReactNode;
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
    code,
    statusTrail,
    status,
    appliedTime,
    currentValue,
    recommendedValue,
    kpi_number_of_interfering_links
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
  const appliedOnce = Boolean(statusTrail.find(t => t.status === 'applied'))
  return {
    ...details,
    monitoring,
    tooltipContent,
    priority,
    category,
    summary,
    appliedOnce,
    ...(code.includes('crrm') && {
      crrmOptimizedState: getCrrmOptimizedState(status),
      crrmInterferingLinksText: getCrrmInterferingLinksText(
        status,
        kpi_number_of_interfering_links!
      )
    })
  } as EnhancedRecommendation
}

export const kpiHelper = (code: string) => {
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
    recommendationCode: build.query<BasicRecommendation, BasicRecommendation>({
      query: ({ id }) => ({
        document: gql`
          query ConfigRecommendationCode($id: String) {
            recommendation(id: $id) { id code }
          }
        `,
        variables: { id }
      }),
      transformResponse: (response: { recommendation: BasicRecommendation }) =>
        response.recommendation,
      providesTags: [{ type: 'Monitoring', id: 'RECOMMENDATION_CODE' }]
    }),
    recommendationDetails: build.query<EnhancedRecommendation, BasicRecommendation>({
      query: ({ id, code }) => ({
        document: gql`
          query ConfigRecommendationDetails($id: String) {
            recommendation(id: $id) {
              id code status appliedTime isMuted
              originalValue currentValue recommendedValue metadata
              sliceType sliceValue
              path { type name }
              statusTrail { status createdAt }
              ${kpiHelper(code!)}
            }
          }
        `,
        variables: { id }
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

export const { useRecommendationCodeQuery, useRecommendationDetailsQuery, useGetApsQuery } = api
