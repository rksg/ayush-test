// TODO: move into root when switch to use intent resolver
import { gql }                  from 'graphql-request'
import { get, snakeCase, pick } from 'lodash'
import moment                   from 'moment-timezone'
import { MessageDescriptor }    from 'react-intl'

import { kpiDelta }          from '@acx-ui/analytics/utils'
import { formatter }         from '@acx-ui/formatter'
import { recommendationApi } from '@acx-ui/store'
import { NetworkPath }       from '@acx-ui/utils'

import { codes }      from './config'
import { IntentWlan } from './services'

export type IntentKPIConfig = {
  key: string;
  label: MessageDescriptor;
  format: ReturnType<typeof formatter>;
  deltaSign: '+' | '-' | 'none';
  valueAccessor?: (value: number[]) => number;
  valueFormatter?: ReturnType<typeof formatter>;
  showAps?: boolean;
  filter?: CallableFunction
}

export type IntentKpi = Record<`kpi_${string}`, {
  current: number | number[];
  previous: number | null;
  projected: number | null;
}>

export type Intent = {
  id: string;
  code: keyof typeof codes;
  // TODO: fix change to StateType
  status: string
  metadata: object & {
    scheduledAt: string
    wlans?: IntentWlan[]
  };
  sliceType: string;
  sliceValue: string;
  path: NetworkPath;
  statusTrail: Array<{
    status: string
    createdAt?: string
  }>;
  updatedAt: string;
  // TODO: remove and move into metadata
  dataEndTime: string;
  preferences?: {
    crrmFullOptimization: boolean;
  }
} & Partial<IntentKpi>

export function extractBeforeAfter (value: IntentKpi[`kpi_${string}`]) {
  const { current, previous, projected } = value
  const [before, after] = [previous, current, projected]
    .filter(value => value !== null)
  return [before, after]
}

export const transformDetailsResponse = (details: Intent) => {
  return {
    ...details,
    preferences: details.preferences || undefined // prevent _.merge({ x: {} }, { x: null })
  }
}

const kpiHelper = (kpis: IntentDetailsQueryPayload['kpis']) => {
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
  intent: Intent,
  kpis: IntentKPIConfig[]
) {
  return kpis.map((kpi) => {
    const [before, after] = extractBeforeAfter(
      get(intent, `kpi_${snakeCase(kpi.key)}`) as IntentKpi[`kpi_${string}`]
    ) as [number, number]
    const delta = kpiDelta(before, after, kpi.deltaSign, kpi.format)
    return { ...pick(kpi, ['key', 'label']), before, after, delta }
  })
}

type IntentDetailsQueryPayload = {
  id: string
  kpis: Pick<IntentKPIConfig, 'key' | 'deltaSign'>[]
}
export const api = recommendationApi.injectEndpoints({
  endpoints: (build) => ({
    intentDetails: build.query<Intent | undefined, IntentDetailsQueryPayload>({
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
      transformResponse: (response: { intent?: Intent }) => {
        if (!response.intent) return undefined
        return transformDetailsResponse(response.intent)
      },
      providesTags: [{ type: 'Intent', id: 'INTENT_DETAILS' }]
    })
  })
})

export const {
  useIntentDetailsQuery
} = api
