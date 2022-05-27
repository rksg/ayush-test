import { createApi }               from '@reduxjs/toolkit/query/react'
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'
import { gql }                     from 'graphql-request'

import { Path, dataApiURL } from '@acx-ui/analytics/utils'

interface Response {
  network: {
    hierarchyNode: {
      timeSeries: {
        time: [string];
        traffic: [number];
      };
    };
  };
}

export const trafficByVolumeWidgetApi = createApi({
  baseQuery: graphqlRequestBaseQuery({
    url: dataApiURL
  }),
  reducerPath: 'widget-trafficByVolumeApi',
  tagTypes: ['Monitoring'],
  endpoints: (build) => ({
    trafficByVolume: build.query({
      // todo: change to the schema of real api
      query: (
        payload: {
          startDate: string
          endDate: string
          path: Path
        }) => ({
        document: gql`
          query widget_trafficByVolume(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
            $granularity: String
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                timeSeries(granularity: $granularity) {
                  time
                  traffic_all: traffic
                  traffic_6: traffic(radio: "6")
                  traffic_5: traffic(radio: "5")
                  traffic_24: traffic(radio: "2.4")
                }
              }
            }
          }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          granularity: 'PT15M'
        }
      }),
      providesTags: ['Monitoring'],
      transformResponse: (response: Response) =>
        response.network.hierarchyNode.timeSeries
    })
  })
})

export const { useTrafficByVolumeQuery } = trafficByVolumeWidgetApi
