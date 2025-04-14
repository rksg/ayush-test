import { gql }           from 'graphql-request'
import moment            from 'moment-timezone'
import { defineMessage } from 'react-intl'

import {
  cssStr,
  DonutChartData
} from '@acx-ui/components'
import { intentAIApi } from '@acx-ui/store'
import { getIntl }     from '@acx-ui/utils'

import { useIntentParams } from '../../useIntentDetailsQuery'

const Type = {
  Unsupported: 'unsupported',
  Enabled: 'enabled',
  Disabled: 'disabled'
}

interface KpiResult {
  unsupported: number
  enabled: number
  disabled: number
}

export const categoryStyles = [
  {
    key: Type.Unsupported,
    legendText: defineMessage({ defaultMessage: 'Energy Saving is not supported' }),
    name: defineMessage({ defaultMessage: 'not supporting Energy Saving.' }),
    color: cssStr('--acx-viz-qualitative-1')
  },
  {
    key: Type.Disabled,
    legendText: defineMessage({ defaultMessage: 'Energy Saving is supported and disabled' }),
    name: defineMessage({ defaultMessage: 'supporting and disabling Energy Saving.' }),
    color: cssStr('--acx-accents-orange-50')
  },
  {
    key: Type.Enabled,
    legendText: defineMessage({ defaultMessage: 'Energy Saving is supported and enabled' }),
    name: defineMessage({ defaultMessage: 'supporting and enabling Energy Saving.' }),
    color: cssStr('--acx-semantics-green-30')
  }
] as {
  key: keyof KpiResult,
  legendText: ReturnType<typeof defineMessage>,
  name: ReturnType<typeof defineMessage>,
  color: string
}[]

export interface KpiData {
  data: {
    timestamp: string
    data: DonutChartData[]
  }
  compareData: {
    timestamp: string
    data: DonutChartData[]
  }
}

export interface KpiDonutChartData {
  timestamp: string
  data: DonutChartData[]
}

interface KpiChartData {
  value: number
  name: ReturnType<typeof defineMessage>
  color: string
}

const parseChartData = (result?: KpiResult|null): KpiChartData[] =>
  result ? categoryStyles.map(({ key, name, color }) => ({
    value: result[key] ?? 0,
    name: name,
    color: color
  })) : []

const emptyKpiResult: KpiData = {
  data: { timestamp: '', data: [] }, compareData: { timestamp: '', data: [] }
}

const { useIntentAIEcoKpiQuery } = intentAIApi.injectEndpoints({
  endpoints: (build) => ({
    intentAIEcoKpi: build.query<KpiData,
    { root: string, sliceId: string, code: string }>({
      query: (variables) => ({
        document: gql`
          query IntentAIEcoKpi($root: String!, $sliceId: String!, $code: String!) {
            intent(root: $root, sliceId: $sliceId, code: $code) {
              kpi: kpi(key: "power-save-aps", timeZone: "${moment.tz.guess()}") {
                data {
                  timestamp
                  result
                }
                compareData {
                  timestamp
                  result
                }
              }
            }
          }
        `,
        variables
      }),
      transformResponse: (
        response: { intent: { kpi:
          {
          data: {
            timestamp: string
            result: KpiResult
          },
          compareData: {
            timestamp: string
            result: KpiResult
          }
        }
      } }
      ) => {
        const { $t } = getIntl()
        const kpi = response.intent?.kpi
        if (!kpi) return emptyKpiResult
        const { data, compareData } = kpi

        const chartData = parseChartData(data?.result)
        const compareChartData = parseChartData(compareData?.result)

        return {
          data: {
            timestamp: data.timestamp,
            data: chartData.map(({ value, name, color }) => ({ value, name: $t(name), color }))
          },
          compareData: {
            timestamp: compareData.timestamp,
            data: compareChartData.map(({ value, name, color }) =>
              ({ value, name: $t(name), color }))
          }
        }
      }
    })
  })
})

export function useIntentAIEcoFlexQuery () {
  const params = useIntentParams()
  return useIntentAIEcoKpiQuery(params)
}
