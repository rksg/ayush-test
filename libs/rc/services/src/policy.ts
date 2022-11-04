import {
  createApi,
  fetchBaseQuery
} from '@reduxjs/toolkit/query/react'


import {
  createHttpRequest,
  RequestPayload,
  RogueAPDetectionUrls,
  RogueAPDetectionContextType, RogueAPDetectionTempType, VenueRoguePolicyType, TableResult
} from '@acx-ui/rc/utils'

export const basePolicyApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'policyApi',
  tagTypes: ['Policy'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

const RKS_NEW_UI = {
  'x-rks-new-ui': true
}

export const policyApi = basePolicyApi.injectEndpoints({
  endpoints: (build) => ({
    addRoguePolicy: build.mutation<RogueAPDetectionContextType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RogueAPDetectionUrls.addRoguePolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    getRoguePolicyList: build.query<RogueAPDetectionTempType[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RogueAPDetectionUrls.getRoguePolicyList, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    roguePolicy: build.query<RogueAPDetectionContextType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RogueAPDetectionUrls.getRoguePolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    updateRoguePolicy: build.mutation<RogueAPDetectionTempType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RogueAPDetectionUrls.updateRoguePolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    venueRoguePolicy: build.query<TableResult<VenueRoguePolicyType>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RogueAPDetectionUrls.getVenueRoguePolicy, params)
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
  useAddRoguePolicyMutation,
  useGetRoguePolicyListQuery,
  useUpdateRoguePolicyMutation,
  useRoguePolicyQuery,
  useVenueRoguePolicyQuery
} = policyApi
