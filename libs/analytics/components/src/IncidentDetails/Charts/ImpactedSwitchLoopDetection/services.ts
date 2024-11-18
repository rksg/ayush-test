import { gql } from 'graphql-request'

import { Incident } from '@acx-ui/analytics/utils'
import { dataApi }  from '@acx-ui/store'

export interface ImpactedSwitch {
  name: string
  mac: string
  serial: string
}

export interface ImpactedVlan {
  vlanId: string
  name?: string
  switches: ImpactedSwitch[]
}

interface Response <T> {
  incident: T
}

const document = gql`
  query ImpactedVLANs($id: String) {
    incident(id: $id) {
      impactedVLANs: getImpactedVLANs(n: 999999999) {
        vlanId: id
        switches {
          name
          mac
          serial
        }
      }
    }
  }
`

export const impactedApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    impactedVlans: build.query<[ImpactedVlan], { id: Incident['id'] }>({
      query: (variables) => ({ document, variables }),
      transformResponse: (response: Response<{ impactedVLANs: [ImpactedVlan] }>) => {
        return response.incident.impactedVLANs
      }
      // transformResponse: () => { return [
      //   { vlanId: '101',name: 'VLan 1', switches: [
      //     { name: 'Switch 1', mac: 'mac1', serial: 'serial1' }
      //     //{ name: 'Switch 2', mac: 'mac2', serial: 'serial2' }
      //   ]
      //   },
      //   { vlanId: '102',name: 'VLan 2', switches: [
      //     { name: 'Switch 3', mac: 'mac3', serial: 'serial3' },
      //     { name: 'Switch 4', mac: 'mac4', serial: 'serial4' },
      //     { name: 'Switch 5', mac: 'mac5', serial: 'serial5' },
      //     { name: 'Switch 6', mac: 'mac6', serial: 'serial6' },
      //     { name: 'Switch 7', mac: 'mac7', serial: 'serial7' },
      //     { name: 'Switch 8', mac: 'mac8', serial: 'serial8' },
      //     { name: 'Switch 9', mac: 'mac9', serial: 'serial9' },
      //     { name: 'Switch 10', mac: 'mac10', serial: 'serial10' }

      //   ]
      //   }]
      // }
    })
  }
  )
})

export const {
  useImpactedVlansQuery
} = impactedApi
