import { gql }       from 'graphql-request'
import { flow }      from 'lodash'
import moment        from 'moment-timezone'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  CloudRRMGraph,
  deriveInterferingGraphs,
  deriveTxPowerHighlight,
  getCrrmCsvData,
  pairGraphs,
  recommendationBandMapping,
  trimPairedGraphs
} from '@acx-ui/components'
import { recommendationApi } from '@acx-ui/store'

import { useRecommendationDetailsQuery } from '../services'

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

export function useCRRMQuery () {
  const { $t } = useIntl()
  const params = useParams()
  const recommendation = useRecommendationDetailsQuery(
    { id: String(params.id) },
    { skip: !Boolean(params.id), selectFromResult: result => ({ ...result,
      data: {
        ...result.data,
        band: recommendationBandMapping[
          result.data?.code as keyof typeof recommendationBandMapping],
        monitoring: (
          result.data?.status === 'applied' &&
          result.data?.appliedTime &&
          Date.now() < moment(result.data?.appliedTime).add(24, 'hours').valueOf()
        )
          ? { until: moment(result.data?.appliedTime).add(24, 'hours').toISOString() }
          : null
      }
    }) })
  const queryResult = useCloudRRMGraphQuery(
    { id: String(params.id) }, {
      skip: !Boolean(params.id && recommendation.data),
      selectFromResult: result => {
        const processedGraphs = result.data &&
          flow(
            [ deriveInterferingGraphs, pairGraphs, deriveTxPowerHighlight]
          )(Object.values(result.data!).filter(Boolean), recommendation.data?.band)
        return { ...result,
          data: processedGraphs && trimPairedGraphs(processedGraphs),
          csv: processedGraphs && getCrrmCsvData(processedGraphs, $t)
        }
      }
    })
  return {
    recommendation,
    queryResult
  }
}

