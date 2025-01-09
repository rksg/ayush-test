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
import { BandEnum }    from '@acx-ui/components'
import { intentAIApi } from '@acx-ui/store'
import { getIntl }     from '@acx-ui/utils'

import { useIntentContext } from '../../IntentContext'
import { useIntentParams }  from '../../useIntentDetailsQuery'

export const intentBandMapping = {
  'c-crrm-channel24g-auto': BandEnum._2_4_GHz,
  'c-crrm-channel5g-auto': BandEnum._5_GHz,
  'c-crrm-channel6g-auto': BandEnum._6_GHz
}

const { useIntentAIRRMGraphQuery } = intentAIApi.injectEndpoints({
  endpoints: (build) => ({
    intentAIRRMGraph: build.query<{
      data: ReturnType<typeof trimPairedGraphs>
      csv: ReturnType<typeof getCrrmCsvData>
    }, { root: string, sliceId: string, code: string, band: BandEnum }>({
      query: (variables) => ({
        document: gql`
          query IntentAIRRMGraph($root: String!, $sliceId: String!, $code: String!) {
            intent(root: $root, sliceId: $sliceId, code: $code) {
              graph: kpi(key: "graph", timeZone: "${moment.tz.guess()}") {
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
        response: { intent: { graph: {
          data: {
            timestamp: string
            result: CloudRRMGraph
          },
          compareData: {
            timestamp: string
            result: CloudRRMGraph
          }
        } } },
        _,
        { band }
      ) => {
        const data = response.intent.graph
        const sortedData = {
          current: data.compareData.result,
          projected: data.data.result
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
  const params = useIntentParams()
  const band = intentBandMapping[params.code as keyof typeof intentBandMapping]
  const { isHotTierData, isDataRetained } = useIntentContext()
  const queryResult = useIntentAIRRMGraphQuery({ ...params, band }, {
    refetchOnMountOrArgChange: false,
    selectFromResult: result => {
      const { data = [], csv = '' } = result.data ?? {}
      return { ...result, data, csv }
    },
    skip: !isHotTierData || !isDataRetained
  })
  return queryResult
}
