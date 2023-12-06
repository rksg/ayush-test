
import { dataApi } from '@acx-ui/store'

import { fetchBrandProperties } from './__tests__/fixtures'
export interface Response {
  lsp: string
  p1Incidents: number
  ssidCompliance: [number, number]
  deviceCount: number
  avgConnSuccess: [number, number]
  avgTTC: [number, number]
  avgClientThroughput: [number, number]
  property: string
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    fetchBrandProperties: build.query({
      queryFn: () => {
        return {
          data: fetchBrandProperties() as Response[]
        }
      }
    })
  })
})

export const { useFetchBrandPropertiesQuery } = api

