import {
  createApi,
  fetchBaseQuery
} from '@reduxjs/toolkit/query/react'


import {
  createHttpRequest,
  RequestPayload,
  RougeAPDetectionUrls,
  RougeAPDetectionContextType, RougeAPDetectionTempType, VenueRougePolicyType, TableResult
} from '@acx-ui/rc/utils';

export const basePolicyApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'policyApi',
  tagTypes: ['Policy'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const policyApi = basePolicyApi.injectEndpoints({
  endpoints: (build) => ({
    addRougePolicy: build.mutation<RougeAPDetectionContextType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RougeAPDetectionUrls.addRougePolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    getRougePolicyList: build.query<RougeAPDetectionTempType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RougeAPDetectionUrls.getRougePolicyList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    rougePolicy: build.query<RougeAPDetectionTempType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RougeAPDetectionUrls.getRougePolicy, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    venueRougePolicy: build.query<TableResult<VenueRougePolicyType>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RougeAPDetectionUrls.getVenueRougePolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    })
  })
})


export const {
  useAddRougePolicyMutation,
  useGetRougePolicyListQuery,
  useRougePolicyQuery,
  useVenueRougePolicyQuery
} = policyApi
