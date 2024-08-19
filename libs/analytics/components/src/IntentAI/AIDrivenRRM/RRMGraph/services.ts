import { gql }       from 'graphql-request'
import { flow }      from 'lodash'
import moment        from 'moment-timezone'
import { useParams } from 'react-router-dom'

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

export const intentBandMapping = {
  'c-crrm-channel24g-auto': BandEnum._2_4_GHz,
  'c-crrm-channel5g-auto': BandEnum._5_GHz,
  'c-crrm-channel6g-auto': BandEnum._6_GHz
}

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

export function useIntentAICRRMQuery () {
  const { recommendationId: id, code } = useParams() as {
    recommendationId: string
    code: keyof typeof intentBandMapping
  }
  const band = intentBandMapping[code]
  const queryResult = useIntentAIRRMGraphQuery({ id, band }, {
    selectFromResult: result => {
      const { data = [], csv = '' } = result.data ?? {}
      return { ...result, data, csv }
    }
  })
  return queryResult
}
