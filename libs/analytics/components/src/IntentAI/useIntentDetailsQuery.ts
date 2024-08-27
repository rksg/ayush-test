// TODO: move into root when switch to use intent resolver
import { gql }               from 'graphql-request'
import _                     from 'lodash'
import moment                from 'moment-timezone'
import { MessageDescriptor } from 'react-intl'

import { kpiDelta, TrendTypeEnum } from '@acx-ui/analytics/utils'
import { formatter }               from '@acx-ui/formatter'
import { intentAIApi }             from '@acx-ui/store'
import { NetworkPath, NodeType }   from '@acx-ui/utils'

import { codes }      from './config'
import { IntentWlan } from './utils'

export type IntentKPIConfig = {
  key: string;
  label: MessageDescriptor;
  format: ReturnType<typeof formatter>;
  deltaSign: '+' | '-' | 'none';
  valueAccessor?: (value: number[]) => number;
  valueFormatter?: ReturnType<typeof formatter>;
}

export type IntentKpi = Record<`kpi_${string}`, {
data: {
  timestamp: string | null
  result: number | [number, number]
}
compareData: {
  timestamp: string | null
  result: number | [number, number]
}
}>

export type Intent = {
  id: string;
  code: keyof typeof codes;
  // TODO: fix change to StateType
  status: string
  metadata: object & {
    scheduledAt: string
    wlans?: IntentWlan[]
    dataEndTime: string
  };
  sliceType: NodeType;
  sliceValue: string;
  path: NetworkPath;
  statusTrail: Array<{
    status: string
    createdAt?: string
  }>;
  updatedAt: string;
  preferences?: {
    crrmFullOptimization: boolean;
  }
} & Partial<IntentKpi>

export const transformDetailsResponse = (details: Intent) => {
  return {
    ...details,
    preferences: details.preferences || undefined // prevent _.merge({ x: {} }, { x: null })
  }
}

const kpiHelper = (kpis: IntentDetailsQueryPayload['kpis']) => {
  return kpis.map(kpi => {
    const name = `kpi_${_.snakeCase(kpi.key)}`
    return `${name}: kpi(key: "${kpi.key}", timeZone: "${moment.tz.guess()}") {
           data {
            timestamp
            result
          }
          compareData {
            timestamp
            result
          }
        }`
  })
    .join('\n')
    .trim()
}

export function getKpiData (intent: Intent, config: IntentKPIConfig) {
  const key = `kpi_${_.snakeCase(config.key)}` as `kpi_${string}`
  const kpi = intent[key] as IntentKpi[`kpi_${string}`]
  const [before, after] = [kpi.compareData.result, kpi.data.result]
    .filter(value => value !== null)

  return {
    data: after,
    compareData: before
  }
}

export function getGraphKPIs (
  intent: Intent,
  kpis: IntentKPIConfig[]
) {
  return kpis.map((kpi) => {
    const { data, compareData } = getKpiData(intent, kpi)
    const valueAccessor = kpi.valueAccessor || ((value) => value[0])
    const delta: { value: string; trend: TrendTypeEnum } | undefined = compareData
      ? kpiDelta(
        valueAccessor(_.castArray(compareData)),
        valueAccessor(_.castArray(data as number | number[])),
        kpi.deltaSign,
        kpi.valueFormatter || kpi.format
      ) as { value: string; trend: TrendTypeEnum }
      : undefined

    return {
      ..._.pick(kpi, ['key', 'label']),
      value: kpi.format(data),
      delta
    }
  })
}

type IntentDetailsQueryPayload = {
  root: string
  sliceId: string
  code: string
  kpis: Pick<IntentKPIConfig, 'key' | 'deltaSign'>[]
}

export const api = intentAIApi.injectEndpoints({
  endpoints: (build) => ({
    intentDetails: build.query<Intent | undefined, IntentDetailsQueryPayload>({
      query: ({ root, sliceId, code, kpis }) => ({
        document: gql`
          query IntentDetails($root: String!, $sliceId: String!, $code: String!) {
            intent(root: $root, sliceId: $sliceId, code: $code) {
              id code status metadata
              sliceType sliceValue updatedAt
              preferences path { type name }
              statusTrail { status createdAt }
              ${kpiHelper(kpis)}
            }
          }
        `,
        variables: { root, sliceId, code }
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
