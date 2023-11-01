import { gql }  from 'graphql-request'
import { flow } from 'lodash'
import moment   from 'moment-timezone'

import {
  CloudRRMGraph,
  deriveInterferingGraphs,
  deriveTxPowerHighlight,
  getCrrmCsvData,
  pairGraphs,
  trimPairedGraphs
} from '@acx-ui/components'
import { BandEnum }          from '@acx-ui/components'
import { recommendationApi } from '@acx-ui/store'
import { getIntl }           from '@acx-ui/utils'

import { EnhancedRecommendation } from '../services'


const { useCloudRRMGraphQuery } = recommendationApi.injectEndpoints({
  endpoints: (build) => ({
    cloudRRMGraph: build.query<{
      data: ReturnType<typeof trimPairedGraphs>
      csv: ReturnType<typeof getCrrmCsvData>
    }, { id: string, band: BandEnum }>({
      query: (variables) => ({
        document: gql`
          query CloudRRMGraph($id: String) {
            recommendation(id: $id) {
              graph: kpi(key: "graph", timeZone: "${moment.tz.guess()}") {
                current projected previous
              }
            }
          }
        `,
        variables
      }),
      transformResponse: (
        response: { recommendation: { graph: Record<string, CloudRRMGraph | null> } },
        _,
        { band }
      ) => {
        const data = response.recommendation.graph
        const sortedData = {
          previous: data.previous,
          current: data.current,
          projected: data.projected
        }
        const processedGraphs: ReturnType<typeof deriveTxPowerHighlight> = flow(
          [ deriveInterferingGraphs, pairGraphs, deriveTxPowerHighlight]
        )(Object.values(sortedData!).filter(v => v !== null), band)
        return {
          data: trimPairedGraphs(processedGraphs),
          csv: getCrrmCsvData(processedGraphs, getIntl().$t)
        }
      }
    })
  })
})

export function useCRRMQuery (details: EnhancedRecommendation, band: BandEnum) {
  const queryResult = useCloudRRMGraphQuery(
    { id: String(details.id), band }, {
      skip: !Boolean(details.id),
      selectFromResult: result => {
        const { data = [], csv = '' } = result.data ?? {}
        return { ...result, data, csv }
      }
    })
  return queryResult
}
