import { gql } from 'graphql-request'

import { Incident } from '@acx-ui/analytics/utils'
import { dataApi }  from '@acx-ui/store'

export interface ImpactedSwitch {
  name: string
  mac: string
}
interface Response <T> {
  incident: T
}

const document = gql`
  query ImpactedSwitches($id: String) {
    incident(id: $id) {
      impactedSwitches: getImpactedSwitches(n: 999999999) {
        name
        mac
      }
      switchCount
    }
  }
`

export const impactedApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    impactedSwitchesAndTotalSwitchCount: build.query<{ impactedCount:number,totalCount:number },
     { id: Incident['id'] }>({
       query: (variables) => ({ document, variables }),
       transformResponse: (response: Response<{ impactedSwitches: ImpactedSwitch[],
         switchCount: number }>) => {
         const incident = response.incident
         return {
           impactedCount: incident.impactedSwitches.length,
           totalCount: incident.switchCount
         }
       }
     })
  })
})

export const {
  useImpactedSwitchesAndTotalSwitchCountQuery
} = impactedApi
