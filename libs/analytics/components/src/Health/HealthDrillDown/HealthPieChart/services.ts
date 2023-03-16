import { gql } from 'graphql-request'
import _       from 'lodash'

import { dataApi }     from '@acx-ui/analytics/services'
import { NetworkPath } from '@acx-ui/utils'


export type RequestPayload = {
  path: NetworkPath
  start: string
  end: string
  queryType: string
  queryFilter: string
}

export type ImpactedNodesAndWlans = {
  network: {
    hierarchyNode: {
      nodes: Array<{ key: string, value: number, name: string | null }>,
      wlans: Array<{ key: string, value: number }>
    }
  }
}

export const pieChartQuery = (
  path: NetworkPath,
  type: string,
  filter: string
) => {
  const apNode = _.find(path, { type: 'AP' })
  switch (type) {
    case 'connectionFailure': {
      return apNode
        ? `wlans: topNSSIDbyConnFailure(n: 6, stage: "${filter}") { key value }`
        : `nodes: topNNodebyConnFailure(n: 6, stage: "${filter}") { key value name }
      wlans: topNSSIDbyConnFailure(n: 6, stage: "${filter}") { key value }`
    }
    case 'timeToConnect': {
      return apNode
        ? `wlans: topNSSIDbyAvgTTC(n: 6, stage: "${filter}") { key value }`
        : `nodes: topNNodebyAvgTTC(n: 6, stage: "${filter}") { key value name }
        wlans: topNSSIDbyAvgTTC(n: 6, stage: "${filter}") { key value }`
    }
    default: {
      return ''
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    pieChart: build.query<ImpactedNodesAndWlans, RequestPayload>({
      query: payload => {
        const { path, queryType, queryFilter } = payload
        const innerQuery = pieChartQuery(path, queryType, queryFilter.toLowerCase())
        return ({
          document: gql`
            query Network($path: [HierarchyNodeInput], $start: DateTime, $end: DateTime) {
              network(start: $start, end: $end) {
                hierarchyNode(path: $path) {
                  ${innerQuery}
                    }
                  }
                }
          `,
          variables: {
            start: payload.start,
            end: payload.end,
            path: payload.path
          }
        })
      }
    })
  })
})

export const { usePieChartQuery } = api
