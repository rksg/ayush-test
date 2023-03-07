import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  createHttpRequest, Property, PropertyManagementUrlsInfo, RequestPayload
} from '@acx-ui/rc/utils'

export const basePropertyManagementApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'propertyManagementApi',
  tagTypes: ['PropertyManagement'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const propertyManagementApi = basePropertyManagementApi.injectEndpoints({
  endpoints: (build) => ({
    getProperty: build.query<Property, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(PropertyManagementUrlsInfo.getProperty, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'PropertyManagement', id: 'DETAIL' }]
    })
  })
})

export const {
  useGetPropertyQuery
} = propertyManagementApi
