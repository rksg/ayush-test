import { gql }                 from 'graphql-request'
import { snakeCase, findLast } from 'lodash'
import moment                  from 'moment-timezone'
import { MessageDescriptor }   from 'react-intl'

import { recommendationApi }    from '@acx-ui/store'
import { NetworkPath, getIntl } from '@acx-ui/utils'

import { StateType, codes, IconValue, StatusTrail, ConfigurationValue, crrmStates, states } from './config'
import { CRRMStates }                                                                       from './states'
import { isDataRetained }                                                                   from './utils'

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
} & Partial<RecommendationKpi>

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

const getCrrmInterferingLinksText = (
  status: StateType,
  dataEndTime: string,
  kpi_number_of_interfering_links: RecommendationKpi['']
) => {
  const { $t } = getIntl()
  if (!isDataRetained(dataEndTime))
    return $t({ defaultMessage: 'Beyond data retention period' })
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

export const transformDetailsResponse = (details: RecommendationDetails) => {
  const {
    code,
    statusTrail,
    status,
    appliedTime,
    dataEndTime,
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
    !code.startsWith('c-probeflex-') &&
    appliedTime &&
    Date.now() < appliedPlus24h.valueOf()
  )
    ? { until: appliedPlus24h.toISOString() }
    : null
  const tooltipContent = typeof recommendedValueTooltipContent === 'function'
    ? recommendedValueTooltipContent(status, currentValue, recommendedValue)
    : recommendedValueTooltipContent
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
    ...(code.includes('crrm') && {
      crrmOptimizedState: getCrrmOptimizedState(status),
      crrmInterferingLinksText: getCrrmInterferingLinksText(
        status,
        dataEndTime,
        kpi_number_of_interfering_links!
      )
    })
  } as EnhancedRecommendation
}

export const kpiHelper = (code: string) => {
  if (!code) return ''
  return codes[code].kpis
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
    recommendationDetails: build.query<
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
