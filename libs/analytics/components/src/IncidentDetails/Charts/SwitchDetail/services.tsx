
import { gql } from 'graphql-request'

import { Incident } from '@acx-ui/analytics/utils'
import { dataApi }  from '@acx-ui/store'

interface ImpactedSwitch {
  name: string
  mac: string
  model: string
  firmware: string
}

interface MemoryUtilization {
  memoryTime: string
  memoryValue: number
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    impactedSwitches: build.query<
      ImpactedSwitch, { id: Incident['id'], n: number,search: String }
    >({
      query: (variables) => ({
        variables,
        document: gql`
          query ImpactedSwitches($id: String, $n: Int, $search: String) {
            incident(id: $id) {
              impactedSwitches: getImpactedSwitches(n: $n, search: $search) {
                name mac model firmware
              }
            }
          }`
      }),
      providesTags: [{ type: 'Monitoring', id: 'INCIDENT_CODE' }],
      transformResponse: (response: { incident: { impactedSwitches: ImpactedSwitch[] } } ) =>
        response.incident.impactedSwitches[0]
    }),
    memoryUtilization: build.query<
      MemoryUtilization, { path: Incident['path'], start: string, end: string }
    >({
      query: (variables) => ({
        variables,
        document: gql`
          query MemoryUtilization($path: [HierarchyNodeInput], $start: DateTime, $end: DateTime) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                memoryUtilization: timeSeries(granularity: "PT15M") {
                  time
                  utilization: switchMemoryUtilization(filter: {code: "p-switch-memory-high"})
                }
              }
            }
          }`
      }),
      providesTags: [{ type: 'Monitoring', id: 'INCIDENT_CODE' }],
      transformResponse: (response: { network: { hierarchyNode: {
         memoryUtilization: { utilization: number[], time: string[] }
        } } }) => {
        const { network: { hierarchyNode: { memoryUtilization: {
          time: [memoryTime], utilization } } } } = response
        return { memoryTime, memoryValue: Math.max(...utilization) }
      }
    })
  })
})

export const {
  useImpactedSwitchesQuery,
  useMemoryUtilizationQuery
} = api
