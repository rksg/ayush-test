import { gql } from 'graphql-request'

import { Incident } from '@acx-ui/analytics/utils'
import { dataApi }  from '@acx-ui/store'
import { getIntl }  from '@acx-ui/utils'

import { poeApPwrModeEnumMap } from './poeApPwrModeEnumMap'
import { poeCurPwrSrcEnumMap } from './poeCurPwrSrcEnumMap'

export interface Response {
  incident: {
    impactedEntities: {
      name: string
      mac: string
      poeMode: {
        configured: string
        operating: string
        eventTime: number
        apGroup: string
      }
    }[]
  }
}

export interface ImpactedAP {
  name: string
  mac: string
  configured: string
  operating: string
  eventTime: string
  apGroup: string
  key: string
}

export const impactedApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    poeLowTable: build.query<
      ImpactedAP[],
      { id: Incident['id'] }
    >({
      query: (payload) => ({
        document: gql`
          query ImpactedEntities($id: String) {
            incident(id: $id) {
              impactedEntities: getImpactedAPs {
                name
                mac
                poeMode {
                  configured
                  operating
                  eventTime
                  apGroup
                }
              }
            }
          }
        `,
        variables: payload
      }),
      transformResponse: (response: Response) => {
        const { $t } = getIntl()
        return response.incident.impactedEntities.map((datum, index) => {
          const configured = datum.poeMode.configured
          const operating = datum.poeMode.operating
          return {
            name: datum.name,
            mac: datum.mac,
            configured: $t(poeApPwrModeEnumMap[configured as keyof typeof poeApPwrModeEnumMap]),
            operating: $t(poeCurPwrSrcEnumMap[operating as keyof typeof poeCurPwrSrcEnumMap]),
            eventTime: (new Date(datum.poeMode.eventTime)).toISOString(),
            apGroup: datum.poeMode.apGroup,
            key: datum.name + index
          }
        })
      }
    })
  })
})
export const {
  usePoeLowTableQuery
} = impactedApi
