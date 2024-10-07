import { gql }           from 'graphql-request'
import moment            from 'moment-timezone'
import { defineMessage } from 'react-intl'

import {
  cssStr,
  DonutChartData
} from '@acx-ui/components'
import { intentAIApi } from '@acx-ui/store'
import { getIntl }     from '@acx-ui/utils'

// import { mockKpiData } from '../__tests__/mockedEcoFlex'

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
    legendText: defineMessage({ defaultMessage: 'EcoFlex is not supported' }),
    name: defineMessage({ defaultMessage: 'are not supporting EcoFlex.' }),
    color: cssStr('--acx-viz-qualitative-1')
  },
  {
    key: Type.Disabled,
    legendText: defineMessage({ defaultMessage: 'EcoFlex is supported and disabled' }),
    name: defineMessage({ defaultMessage: 'are not supporting and disabling EcoFlex.' }),
    color: cssStr('--acx-accents-orange-50')
  },
  {
    key: Type.Enabled,
    legendText: defineMessage({ defaultMessage: 'EcoFlex is supported and enabled' }),
    name: defineMessage({ defaultMessage: 'are not supporting and enabling EcoFlex.' }),
    color: cssStr('--acx-semantics-green-60')
  }
// eslint-disable-next-line max-len
] as { key: keyof KpiResult, legendText: ReturnType<typeof defineMessage>, name: ReturnType<typeof defineMessage>, color: string }[]

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

interface KpiChartData {
  value: number
  name: ReturnType<typeof defineMessage>
  color: string
}

// eslint-disable-next-line max-len
const parseChartData = (result: KpiResult): KpiChartData[] => categoryStyles.map(({ key, name, color }) => ({
  value: result[key] ?? 0,
  name: name,
  color: color
}))

export const { useIntentAIEcoKpiQuery } = intentAIApi.injectEndpoints({
  endpoints: (build) => ({
    intentAIEcoKpi: build.query<KpiData,
    { root: string, sliceId: string, code: string }>({
      query: (variables) => ({
        document: gql`
          query IntentAIEcoKpi($root: String!, $sliceId: String!, $code: String!) {
            intent(root: $root, sliceId: $sliceId, code: $code) {
              graph: kpi(key: "power-save-aps", timeZone: "${moment.tz.guess()}") {
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
        // eslint-disable-next-line max-len
        if (!kpi) return { data: { timestamp: '', data: [] }, compareData: { timestamp: '', data: [] } }
        const { data, compareData } = kpi

        // const { data, compareData } = mockKpiData.kpi

        const chartData = parseChartData(data.result)
        const compareChartData = parseChartData(compareData.result)

        return {
          data: { ...data,
            data: chartData.map(({ value, name, color }) => ({ value, name: $t(name), color }))
          },
          compareData: { ...compareData,
            // eslint-disable-next-line max-len
            data: compareChartData.map(({ value, name, color }) => ({ value, name: $t(name), color }))
          }
        }
      }
    })
  })
})