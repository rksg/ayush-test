import { dataApi }              from '@acx-ui/store'
import type { AnalyticsFilter } from '@acx-ui/utils'

import { fetchBrandProperties } from './__tests__/fixtures'

export interface Common {
  lsp: string
  p1Incidents: number
  guestExp: number
  ssidComplaince: number
  deviceCount: number
  avgConnSuccess: number,
  avgTTC: number,
  avgClientThroughput: number
}
export interface Property extends Common {
  property: string
}
export interface Lsp extends Common {
  propertyCount: number
}
type Data = Property[] | Lsp[]
export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    fetchBrandProperties: build.query<
      Data,
      AnalyticsFilter & { sliceType: string }
    >({
      queryFn: (payload) => {
        return {
          data: fetchBrandProperties(payload.sliceType) as Property[] | Lsp[]
        }
      }
    })
  })
})

export const { useFetchBrandPropertiesQuery } = api

