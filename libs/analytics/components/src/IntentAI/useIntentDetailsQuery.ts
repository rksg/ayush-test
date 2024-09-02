// TODO: move into root when switch to use intent resolver
import { gql }               from 'graphql-request'
import _                     from 'lodash'
import moment                from 'moment-timezone'
import { MessageDescriptor } from 'react-intl'

import { kpiDelta, TrendTypeEnum } from '@acx-ui/analytics/utils'
import { formatter }               from '@acx-ui/formatter'
import { intentAIApi }             from '@acx-ui/store'
import { NetworkPath, NodeType }   from '@acx-ui/utils'

import { DisplayStates, Statuses, StatusReasons } from './states'
import { IntentWlan }                             from './utils'

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
  id: string
  root: string
  code: string
  sliceId: string
  status: Statuses
  statusReason: StatusReasons
  displayStatus: DisplayStates
  metadata: object & {
    scheduledAt: string
    wlans?: IntentWlan[]
    dataEndTime: string
  }
  sliceType: NodeType
  sliceValue: string
  path: NetworkPath
  statusTrail: Array<{
    status: Statuses
    statusReason: StatusReasons
    displayStatus: DisplayStates
    createdAt?: string
  }>
  updatedAt: string
  preferences?: {
    crrmFullOptimization: boolean
  }
} & Partial<IntentKpi>

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
      query: ({ root, sliceId, code, kpis }: IntentDetailsQueryPayload) => ({
        document: gql`
          query IntentDetails($root: String!, $sliceId: String!, $code: String!) {
            intent(root: $root, sliceId: $sliceId, code: $code) {
              root sliceId code
              id metadata preferences
              status statusReason displayStatus
              sliceType sliceValue updatedAt
              path { type name }
              statusTrail { status statusReason displayStatus createdAt }
              ${kpiHelper(kpis)}
            }
          }
        `,
        variables: { root, sliceId, code }
      }),
      transformResponse: (response: { intent?: Intent }) => response.intent,
      providesTags: [{ type: 'Intent', id: 'INTENT_DETAILS' }]
    })
  })
})

export const {
  useIntentDetailsQuery
} = api
