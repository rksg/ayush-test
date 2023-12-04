import { dataApi } from '@acx-ui/store'

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
export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    fetchBrandProperties: build.query({
      queryFn: () => {
        return {
          data: fetchBrandProperties() as Property[]
        }
      }
    })
  })
})

export const { useFetchBrandPropertiesQuery } = api

