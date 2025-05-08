import { stringify } from 'csv-stringify/browser/esm/sync'
import { gql }       from 'graphql-request'
import moment        from 'moment-timezone'

import { intentAIApi } from '@acx-ui/store'
import { getIntl }     from '@acx-ui/utils'

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


type ApPowerSaveDistributionResponse = {
  date: string
  name: string
  mac: string
  model: string
  powerSave: string
  wakeupTime: string
  status: string
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

const { useIntentAIEcoKpiQuery, useApPowerSaveDistributionQuery } = intentAIApi.injectEndpoints({
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
    }),
    apPowerSaveDistribution: build.query<{
      data: ApPowerSaveDistributionResponse[]
      csv: string
    }, {
      root: string, sliceId: string, code: string }>({
        query: ({ root, sliceId, code }) => ({
          document: gql`
            query ApPowerSaveDistribution(
              $root: String!, $sliceId: String!, $code: String!
            ) {
              intent(root: $root, sliceId: $sliceId, code: $code) {
                apPowerSaveDistribution {
                  date
                  name
                  mac
                  model
                  powerSave
                  wakeupTime
                  status
                }
              }
            }
          `,
          variables: { root, sliceId, code }
        }),
        transformResponse: (response: { intent: {
          apPowerSaveDistribution: ApPowerSaveDistributionResponse[] } }
        ) => {
          return {
            data: response.intent.apPowerSaveDistribution,
            csv: stringify(response.intent.apPowerSaveDistribution, {
              header: true,
              columns: [
                { key: 'date', header: getIntl().$t({ defaultMessage: 'Date' }) },
                { key: 'name', header: getIntl().$t({ defaultMessage: 'AP Name' }) },
                { key: 'mac', header: getIntl().$t({ defaultMessage: 'AP MAC' }) },
                { key: 'model', header: getIntl().$t({ defaultMessage: 'AP Model' }) },
                { key: 'powerSave', header: getIntl().$t({ defaultMessage: 'Power Save' }) },
                { key: 'wakeupTime', header: getIntl().$t({ defaultMessage: 'Wakeup Time' }) },
                { key: 'status', header: getIntl().$t({ defaultMessage: 'Status' }) }
              ]
            })
          }
        }
      })
  })
})

export function useIntentAIEcoFlexQuery () {
  const params = useIntentParams()
  return useIntentAIEcoKpiQuery(params)
}

export function useIntentAIPowerSavePlanQuery () {
  const params = useIntentParams()
  return useApPowerSaveDistributionQuery(params)
}