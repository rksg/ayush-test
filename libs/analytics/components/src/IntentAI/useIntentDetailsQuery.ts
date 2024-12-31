import { gql }               from 'graphql-request'
import _                     from 'lodash'
import moment                from 'moment-timezone'
import { MessageDescriptor } from 'react-intl'

import { kpiDelta, TrendTypeEnum } from '@acx-ui/analytics/utils'
import { formatter }               from '@acx-ui/formatter'
import { useParams }               from '@acx-ui/react-router-dom'
import { intentAIApi }             from '@acx-ui/store'
import { getIntl, noDataDisplay }  from '@acx-ui/utils'

import { Intent }                            from './config'
import { Statuses }                          from './states'
import { dataRetentionText, isDataRetained } from './utils'

export type IntentKPIConfig = {
  key: string;
  label: MessageDescriptor;
  format: ReturnType<typeof formatter>;
  deltaSign: '+' | '-' | 'none';
  valueAccessor?: (value: number[]) => number;
  valueFormatter?: ReturnType<typeof formatter>;
}

export type IntentKPI = Record<`kpi_${string}`, {
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

export type IntentDetail = Intent & Partial<IntentKPI> & {
  currentValue: IntentConfigurationValue
  recommendedValue: IntentConfigurationValue
}

export const useIntentParams = () => {
  const { tenantId, root, ...params } = useParams() as {
    tenantId?: string
    root?: IntentDetail['root']
    sliceId: IntentDetail['sliceId']
    code: string
  }

  return { ...params, root: (root || tenantId)! } as {
    root: IntentDetail['root']
    sliceId: IntentDetail['sliceId']
    code: string
  }
}

export function intentState (intent: IntentDetail) {
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
  return kpis?.map(kpi => {
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

export function getKPIData (intent: IntentDetail, config: IntentKPIConfig) {
  const key = `kpi_${_.snakeCase(config.key)}` as `kpi_${string}`
  const kpi = intent[key] as IntentKPI[`kpi_${string}`]
  // avoid druid error will receive null
  return {
    data: kpi?.data,
    compareData: kpi?.compareData
  }
}

export function getGraphKPIs (
  intent: IntentDetail,
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
  kpis?: Pick<IntentKPIConfig, 'key' | 'deltaSign'>[]
}

export const api = intentAIApi.injectEndpoints({
  endpoints: (build) => ({
    intentDetails: build.query<IntentDetail | undefined, IntentDetailsQueryPayload>({
      query: ({ root, sliceId, code }: IntentDetailsQueryPayload) => ({
        document: gql`
          query IntentDetails($root: String!, $sliceId: String!, $code: String!) {
            intent(root: $root, sliceId: $sliceId, code: $code) {
              root sliceId code
              id metadata preferences
              status statusReason displayStatus
              sliceType sliceValue updatedAt
              path { type name }
              statusTrail { status statusReason displayStatus createdAt retries }
              ${!code.includes('ecoflex') ? 'currentValue recommendedValue' : ''}
            }
          }
        `,
        variables: { root, sliceId, code }
      }),
      transformResponse: (response: { intent?: IntentDetail }) => response.intent,
      transformErrorResponse: (error, meta) =>
        ({ ...error, data: meta?.response?.data?.intent }),
      providesTags: [{ type: 'Intent', id: 'INTENT_DETAILS' }]
    }),
    intentKPIs: build.query<IntentKPI | undefined, IntentDetailsQueryPayload>({
      query: ({ root, sliceId, code, kpis }) => ({
        document: gql`
        query IntentKPIs($root: String!, $sliceId: String!, $code: String!) {
          intent(root: $root, sliceId: $sliceId, code: $code) {
            ${kpiHelper(kpis)}
          }
        }
      `,
        variables: { root, sliceId, code }
      }),
      transformResponse: (response: { intent?: Intent }) => response.intent as IntentKPI,
      transformErrorResponse: (error, meta) =>
        ({ ...error, data: meta?.response?.data?.intent }),
      providesTags: [{ type: 'Intent', id: 'INTENT_KPIS' }]
    }),
    intentStatusTrail: build.query<Intent['statusTrail'], IntentDetailsQueryPayload>({
      query: ({ root, sliceId, code }) => ({
        document: gql`
        query IntentStatusTrail($root: String!, $sliceId: String!, $code: String!) {
          intent(root: $root, sliceId: $sliceId, code: $code) {
            statusTrail { status statusReason displayStatus retries createdAt }
          }
        }
      `,
        variables: { root, sliceId, code }
      }),
      transformResponse: (response: { intent: { statusTrail: Intent['statusTrail'] } })=>
        response.intent.statusTrail,
      transformErrorResponse: (error, meta) =>
        ({ ...error, data: meta?.response?.data?.intent }),
      providesTags: [{ type: 'Intent', id: 'INTENT_STATUS_TRAIL' }]
    })
  })
})

export const {
  useIntentDetailsQuery,
  useIntentKPIsQuery,
  useIntentStatusTrailQuery
} = api
