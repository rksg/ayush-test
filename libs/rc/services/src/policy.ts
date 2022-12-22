import {
  createApi,
  fetchBaseQuery
} from '@reduxjs/toolkit/query/react'


import {
  createHttpRequest,
  CommonUrlsInfo,
  RequestPayload,
  Policy,
  RogueApUrls,
  RogueAPDetectionContextType,
  RogueAPDetectionTempType,
  VenueRoguePolicyType,
  TableResult, onSocketActivityChanged, showActivityMessage, CommonResult
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
        const req = createHttpRequest(RogueApUrls.addRoguePolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    delRoguePolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RogueApUrls.deleteRogueApPolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    getRoguePolicyList: build.query<RogueAPDetectionTempType[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RogueApUrls.getRoguePolicyList, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          showActivityMessage(msg, [
            'Add Rogue AP Policy Profile',
            'Update Rogue AP Policy Profile'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'Policy', id: 'LIST' }]))
          })
        })
      }
    }),
    delRoguePolicies: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RogueApUrls.deleteRogueApPolicies, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    roguePolicy: build.query<RogueAPDetectionContextType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RogueApUrls.getRoguePolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    updateRoguePolicy: build.mutation<RogueAPDetectionTempType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RogueApUrls.updateRoguePolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    venueRoguePolicy: build.query<TableResult<VenueRoguePolicyType>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RogueApUrls.getVenueRoguePolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    policyList: build.query<TableResult<Policy>, RequestPayload>({
      query: ({ params, payload }) => {
        const policyListReq = createHttpRequest(CommonUrlsInfo.getPoliciesList, params, RKS_NEW_UI)
        return {
          ...policyListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Policy', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          showActivityMessage(msg, [
            'Add Rogue AP Policy Profile',
            'Update Rogue AP Policy Profile',
            'Delete Rogue AP Policy Profile'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'Policy', id: 'LIST' }]))
          })
        })
      }
    })
  })
})


export const {
  useAddRoguePolicyMutation,
  useDelRoguePolicyMutation,
  useDelRoguePoliciesMutation,
  useGetRoguePolicyListQuery,
  useUpdateRoguePolicyMutation,
  useRoguePolicyQuery,
  useVenueRoguePolicyQuery,
  usePolicyListQuery
} = policyApi
