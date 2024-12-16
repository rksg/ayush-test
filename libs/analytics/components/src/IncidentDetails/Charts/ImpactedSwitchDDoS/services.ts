import { gql } from 'graphql-request'
import _       from 'lodash'

import { Incident } from '@acx-ui/analytics/utils'
import { dataApi }  from '@acx-ui/store'

interface ImpactedSwitchPort {
  portNumber: string
}

export interface ImpactedSwitch {
  name: string
  mac: string
  serial: string
  ports: ImpactedSwitchPort[]
}

export type ImpactedSwitchPortRow = { portNumbers:string, portCount:number }
  & Pick<ImpactedSwitch, 'name' | 'mac' | 'serial'>
  & { key?: string, index?: number }

interface Response <T> {
  incident: T
}

const document = gql`
  query ImpactedSwitchDDoS($id: String) {
    incident(id: $id) {
      impactedSwitchDDoS: getImpactedSwitches(n: 999999999, search: "") {
        name
        mac
        serial
        ports {
          portNumber
        }
      }
      switchCount
    }
  }
`

export const impactedApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    impactedSwitchDDoS: build.query<ImpactedSwitchPortRow[], { id: Incident['id'] }>({
      query: (variables) => ({ document, variables }),
      transformResponse: (response: Response<{ impactedSwitchDDoS: ImpactedSwitch[] }>) => {
        return response.incident.impactedSwitchDDoS
          .map(({ name, mac, serial, ports }) => {
            return { name,mac, serial ,
              portNumbers: _.uniq(ports.map(port=>port.portNumber))
                .sort((a,b)=>a.localeCompare(b)).join(', '),
              portCount: ports.length
            }
          })
      }
    })
  })
})

export const {
  useImpactedSwitchDDoSQuery
} = impactedApi
