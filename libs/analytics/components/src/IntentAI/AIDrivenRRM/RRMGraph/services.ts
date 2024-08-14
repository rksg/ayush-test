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

const { useIntentAIRRMGraphQuery } = recommendationApi.injectEndpoints({
  endpoints: (build) => ({
    intentAIRRMGraph: build.query<{
      data: ReturnType<typeof trimPairedGraphs>
      csv: ReturnType<typeof getCrrmCsvData>
    }, { id: string, band: BandEnum }>({
      query: (variables) => ({
        document: gql`
          query IntentAIRRMGraph($id: String) {
            intent: recommendation(id: $id) {
              graph: kpi(key: "graph", timeZone: "${moment.tz.guess()}") {
                current projected previous
              }
            }
          }
        `,
        variables
      }),
      transformResponse: (
        response: { intent: { graph: Record<string, CloudRRMGraph | null> } },
        _,
        { band }
      ) => {
        const data = response.intent.graph
        const sortedData = {
          previous: data.previous,
          current: data.current,
          projected: data.projected
        }
        const processedGraphs: ReturnType<typeof deriveTxPowerHighlight> = flow(
          [ deriveInterferingGraphs, pairGraphs, deriveTxPowerHighlight]
        )(Object.values(sortedData!).filter(v => v !== null), band)

        const kpiGraph = processedGraphs.map(graph => {
          const affectedAPs = new Set()
          const interferingLinks = graph.links.filter(link => link.category === 'highlight')

          interferingLinks.forEach(link => {
            affectedAPs.add(link.source)
            affectedAPs.add(link.target)
          })

          graph.affectedAPs = affectedAPs.size
          graph.interferingLinks = interferingLinks.length * 2
          return graph
        })

        return {
          data: trimPairedGraphs(kpiGraph),
          csv: getCrrmCsvData(kpiGraph, getIntl().$t)
        }
      }
    })
  })
})

export function useIntentAICRRMQuery (id: string, band: BandEnum) {
  const queryResult = useIntentAIRRMGraphQuery(
    { id: String(id), band }, {
      skip: !id,
      selectFromResult: result => {
        const { data = [], csv = '' } = result.data ?? {}
        return { ...result, data, csv }
      }
    })
  return queryResult
}
