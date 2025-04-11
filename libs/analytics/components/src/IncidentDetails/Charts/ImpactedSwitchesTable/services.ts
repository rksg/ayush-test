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
  reasonCodes?: string
  ports: ImpactedSwitchPort[]
}

export type ImpactedSwitchPortRow = { portNumbers:string, portCount:number }
  & Pick<ImpactedSwitch, 'name' | 'mac' | 'serial' | 'reasonCodes'>
  & { key?: string, index?: number }

interface Response <T> {
  incident: T
}

const document = gql`
  query ImpactedSwitches($id: String) {
    incident(id: $id) {
      impactedSwitches: getImpactedSwitches(n: 999999999, search: "") {
        name
        mac
        serial
        reasonCodes
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
    impactedSwitches: build.query<ImpactedSwitchPortRow[], { id: Incident['id'] }>({
      query: (variables) => ({ document, variables }),
      transformResponse: (response: Response<{ impactedSwitches: ImpactedSwitch[] }>) => {
        return response.incident.impactedSwitches
          .map(({ name, mac, serial, reasonCodes, ports }) => {
            return { name,mac, serial , reasonCodes,
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
  useImpactedSwitchesQuery
} = impactedApi
