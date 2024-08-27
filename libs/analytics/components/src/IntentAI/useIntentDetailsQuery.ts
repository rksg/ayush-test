// TODO: move into root when switch to use intent resolver
import { gql }               from 'graphql-request'
import _                     from 'lodash'
import moment                from 'moment-timezone'
import { MessageDescriptor } from 'react-intl'

import { kpiDelta, TrendTypeEnum } from '@acx-ui/analytics/utils'
import { formatter }               from '@acx-ui/formatter'
import { recommendationApi }       from '@acx-ui/store'
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
  sliceType: NodeType;
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

const kpiHelper = (kpis: IntentDetailsQueryPayload['kpis']) => {
  return kpis.map(kpi => {
    const name = `kpi_${_.snakeCase(kpi.key)}`
    return `${name}: kpi(key: "${kpi.key}", timeZone: "${moment.tz.guess()}") {
            current${kpi.deltaSign === 'none' ? '' : ' previous'}
            projected
          }`
  })
    .join('\n')
    .trim()
}

export function getKpiData (intent: Intent, config: IntentKPIConfig) {
  const key = `kpi_${_.snakeCase(config.key)}` as `kpi_${string}`
  const kpi = intent[key] as IntentKpi[`kpi_${string}`]
  const [before, after] = [kpi.previous, kpi.current, kpi.projected]
    .filter(value => value !== null)

  return {
    data: after ?? before,
    compareData: after !== undefined ? before : undefined
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
        valueAccessor(_.castArray(compareData as number | number[])),
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
      transformResponse: (response: { intent?: Intent }) => response.intent,
      providesTags: [{ type: 'Intent', id: 'INTENT_DETAILS' }]
    })
  })
})

export const {
  useIntentDetailsQuery
} = api
