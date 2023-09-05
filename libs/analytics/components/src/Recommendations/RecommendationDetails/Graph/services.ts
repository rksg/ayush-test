import { gql }     from 'graphql-request'
import { flow }    from 'lodash'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import {
  CloudRRMGraph,
  deriveInterferingGraphs,
  deriveTxPowerHighlight,
  getCrrmCsvData,
  pairGraphs,
  trimPairedGraphs
} from '@acx-ui/components'
import type { BandEnum }     from '@acx-ui/components'
import { recommendationApi } from '@acx-ui/store'

import { EnhancedRecommendation } from '../services'


const { useCloudRRMGraphQuery } = recommendationApi.injectEndpoints({
  endpoints: (build) => ({
    cloudRRMGraph: build.query<Record<string, CloudRRMGraph | null>, { id: string }>({
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
        response: { recommendation: { graph: Record<string, CloudRRMGraph | null> } }
      ) => response.recommendation.graph
    })
  })
})

export function useCRRMQuery (details: EnhancedRecommendation, band: BandEnum) {
  const { $t } = useIntl()
  const queryResult = useCloudRRMGraphQuery(
    { id: String(details.id) }, {
      skip: !Boolean(details.id),
      selectFromResult: result => {
        const processedGraphs = result.data &&
          flow(
            [ deriveInterferingGraphs, pairGraphs, deriveTxPowerHighlight]
          )(Object.values(result.data!).filter(Boolean), band)
        return { ...result,
          data: processedGraphs && trimPairedGraphs(processedGraphs),
          csv: processedGraphs && getCrrmCsvData(processedGraphs, $t)
        }
      }
    })
  return queryResult
}
