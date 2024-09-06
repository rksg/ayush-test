import { gql } from 'graphql-request'

import { Incident } from '@acx-ui/analytics/utils'
import { dataApi }  from '@acx-ui/store'

interface ImpactedSwitchPort {
  portNumber: string
  portMac: string
}

export interface ImpactedSwitch {
  name: string
  mac: string
  serial: string
  ports: ImpactedSwitchPort[]
}

export type ImpactedSwitchPortRow = { portNumbers:string }
  & Pick<ImpactedSwitch, 'name' | 'mac' | 'serial'>
  & { key?: string, index?: number }

interface Response <T> {
  incident: T
}

const document = gql`
  query ImpactedSwitchDDoS($id: String) {
    incident(id: $id) {
      impactedSwitchDDoS: getImpactedSwitches(n: 100, search: "") {
        name
        mac
        serial
        ports {
          portNumber
          portMac
        }
      }
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
            return { name,mac, serial , portNumbers: ports.map(port=>port.portNumber).join(', ') }
          })
      }
    })
  })
})

export const {
  useImpactedSwitchDDoSQuery
} = impactedApi
