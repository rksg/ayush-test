/* eslint-disable @typescript-eslint/no-explicit-any */
import { gql } from 'graphql-request'
import _       from 'lodash'

import { Incident } from '@acx-ui/analytics/utils'
import { dataApi }  from '@acx-ui/store'

export interface ImpactedSwitch {
  name: string
  model: string
  firmware: string
  mac: string
}
export type CountByType = {
  [index:string]:number
}
interface Response <T> {
  incident: T
}

const document = gql`
  query ImpactedSwitches($id: String) {
    incident(id: $id) {
      impactedSwitches: getImpactedSwitches(n: 999999999) {
        name
        model
        firmware
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
           impactedCount: _.uniqBy(incident.impactedSwitches, 'mac').length,
           totalCount: incident.switchCount
         }
       }
     }),
    impactedSwitchesDetail: build.query<{ impactedModelCount:CountByType,
      impactedFirmwareCount:CountByType },
     { id: Incident['id'] }>({
       query: (variables) => ({ document, variables }),
       transformResponse: (response: Response<{ impactedSwitches: ImpactedSwitch[],
         switchCount: number }>) => {
         const incident = response.incident
         const uniqueSwitches = _.uniqBy(incident.impactedSwitches, 'mac')
         return {
           impactedModelCount: _.countBy(uniqueSwitches,
             (item)=>item.model.split('-')[0]),
           impactedFirmwareCount: _.countBy(uniqueSwitches, 'firmware')
         }
       }
     })
  })
})

export const {
  useImpactedSwitchesAndTotalSwitchCountQuery,
  useImpactedSwitchesDetailQuery
} = impactedApi
