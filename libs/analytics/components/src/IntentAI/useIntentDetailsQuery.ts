// TODO: move into root when switch to use intent resolver
import { gql }               from 'graphql-request'
import _                     from 'lodash'
import moment                from 'moment-timezone'
import { MessageDescriptor } from 'react-intl'

import { kpiDelta, TrendTypeEnum }                       from '@acx-ui/analytics/utils'
import { formatter }                                     from '@acx-ui/formatter'
import { useParams }                                     from '@acx-ui/react-router-dom'
import { intentAIApi }                                   from '@acx-ui/store'
import { getIntl, NetworkPath, noDataDisplay, NodeType } from '@acx-ui/utils'

import { NetworkNode } from '../NetworkFilter/services'

import { Metadata }                                      from './services'
import { DisplayStates, Statuses, StatusReasons }        from './states'
import { dataRetentionText, IntentWlan, isDataRetained } from './utils'

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
  } | null
  compareData: {
    timestamp: string | null
    result: number | [number, number]
  } | null
}>

export type IntentConfigurationValue =
  string |
  Array<{ channelMode: string, channelWidth: string, radio: string }> |
  boolean |
  null

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
    preferences?: {
      crrmFullOptimization: boolean;
      excludedHours?: Record<string, number[]>
      averagePowerPrice?: {
        currency: string
        value: number
      }
      excludedAPs?: [NetworkNode[]]
    },
    unsupportedAPs?: string[]
  }
  sliceType: NodeType
  sliceValue: string
  path: NetworkPath
  statusTrail: Array<{
    status: Statuses
    statusReason: StatusReasons
    displayStatus: DisplayStates
    createdAt?: string
    metadata: Metadata
  }>
  updatedAt: string
  currentValue: IntentConfigurationValue
  recommendedValue: IntentConfigurationValue
} & Partial<IntentKpi>

export const useIntentParams = () => {
  const { tenantId, root, ...params } = useParams() as {
    tenantId?: string
    root?: Intent['root']
    sliceId: Intent['sliceId']
    code: string
  }

  return { ...params, root: (root || tenantId)! } as {
    root: Intent['root']
    sliceId: Intent['sliceId']
    code: string
  }
}

export function intentState (intent: Intent) {
  switch (intent.status) {
    case Statuses.paused:
    case Statuses.na:
      return 'no-data'
    case Statuses.new:
    case Statuses.scheduled:
      return 'inactive'
    default:
      return 'active'
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

export function getKPIData (intent: Intent, config: IntentKPIConfig) {
  const key = `kpi_${_.snakeCase(config.key)}` as `kpi_${string}`
  const kpi = intent[key] as IntentKpi[`kpi_${string}`]
  // avoid druid error will receive null
  return {
    data: kpi?.data,
    compareData: kpi?.compareData
  }
}

export function getGraphKPIs (
  intent: Intent,
  kpis: IntentKPIConfig[]
) {
  const { $t } = getIntl()
  const state = intentState(intent)

  return kpis.map((kpi) => {
    const ret = {
      ..._.pick(kpi, ['key', 'label']),
      value: noDataDisplay,
      delta: undefined,
      footer: ''
    } as {
      key: string
      label: MessageDescriptor
      value: string
      footer: string
      delta: { value: string; trend: TrendTypeEnum } | undefined
    }

    if (!isDataRetained(intent.metadata.dataEndTime)) {
      ret.footer = $t(dataRetentionText)
    } else if (state !== 'no-data') {
      const result = getKPIData(intent, kpi)
      ret.value = kpi.format(_.get(result, ['data', 'result'], null))

      const valueAccessor = kpi.valueAccessor || ((value) => value[0])
      const values = [
        valueAccessor(_.castArray(result.compareData?.result)),
        valueAccessor(_.castArray(result.data?.result))
      ]
      if (values.every(Number.isFinite)) {
        const format = kpi.valueFormatter || kpi.format
        ret.delta = kpiDelta(values[0], values[1], kpi.deltaSign, format) as {
          value: string
          trend: TrendTypeEnum
        }
      }
    }
    return ret
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
              statusTrail {
                status statusReason displayStatus createdAt
                metadata {
                  scheduledAt
                  failures
                }
              }
              ${kpiHelper(kpis)}
              ${!code.includes('ecoflex') ? 'currentValue recommendedValue' : ''}
            }
          }
        `,
        variables: { root, sliceId, code }
      }),

      transformResponse: (response: { intent?: Intent }) => response.intent,
      transformErrorResponse: (error, meta) =>
        ({ ...error, data: meta?.response?.data?.intent }),
      providesTags: [{ type: 'Intent', id: 'INTENT_DETAILS' }]
    })
  })
})

export const {
  useIntentDetailsQuery
} = api
