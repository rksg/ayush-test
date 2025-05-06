import { gql } from 'graphql-request'
import moment  from 'moment-timezone'

import { intentAIApi } from '@acx-ui/store'

import { KpiResultExtend, useIntentParams } from '../useIntentDetailsQuery'

export interface KpiData {
  data: {
    timestamp: string
    data: KpiResultExtend
  }
  compareData: {
    timestamp: string
    data: KpiResultExtend
  }
}

const parseKpiData = (result?: KpiResultExtend|null): Partial<KpiResultExtend> =>
{
  const { enabled=0, disabled=0, unsupported=0 } = result ?? { }
  const apTotalCount = enabled + disabled + unsupported
  return { ...result, apTotalCount }
}

const emptyKpiResult: KpiData = {
  data: { timestamp: '', data: {} }, compareData: { timestamp: '', data: {} }
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
            result: KpiResultExtend
          },
          compareData: {
            timestamp: string
            result: KpiResultExtend
          }
        }
      } }
      ) => {
        const kpi = response.intent?.kpi
        if (!kpi) return emptyKpiResult
        const { data, compareData } = kpi
        return {
          data: {
            timestamp: data.timestamp,
            data: parseKpiData(data?.result)
          },
          compareData: {
            timestamp: compareData.timestamp,
            data: parseKpiData(compareData?.result)
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
