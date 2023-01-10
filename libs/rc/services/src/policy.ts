import {
  createApi,
  fetchBaseQuery
} from '@reduxjs/toolkit/query/react'


import {
  createHttpRequest,
  MacRegistration,
  MacRegistrationPool,
  MacRegListUrlsInfo,
  CommonUrlsInfo,
  RequestPayload,
  Policy,
  RogueApUrls,
  RogueAPDetectionContextType,
  RogueAPDetectionTempType,
  VenueRoguePolicyType,
  TableResult, onSocketActivityChanged, showActivityMessage, CommonResult,
  NewTableResult, transferTableResult,
  RadiusAttributeGroupUrlsInfo, RadiusAttributeGroup, RadiusAttribute
} from '@acx-ui/rc/utils'

export const basePolicyApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'policyApi',
  // eslint-disable-next-line max-len
  tagTypes: ['Policy', 'MacRegistrationPool', 'MacRegistration', 'RadiusAttributeGroup', 'RadiusAttribute'],
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
    }),
    macRegLists: build.query<TableResult<MacRegistrationPool>, RequestPayload>({
      query: ({ params }) => {
        const poolsReq = createHttpRequest(MacRegListUrlsInfo.getMacRegistrationPools, params)
        return {
          ...poolsReq,
          params
        }
      },
      transformResponse (result: NewTableResult<MacRegistrationPool>) {
        return transferToTableResult<MacRegistrationPool>(result)
      },
      providesTags: [{ type: 'MacRegistrationPool', id: 'LIST' }]
    }),
    macRegistrations: build.query<TableResult<MacRegistration>, RequestPayload>({
      query: ({ params }) => {
        const poolsReq = createHttpRequest(MacRegListUrlsInfo.getMacRegistrations, params)
        return {
          ...poolsReq,
          params
        }
      },
      transformResponse (result: NewTableResult<MacRegistration>) {
        return transferToTableResult<MacRegistration>(result)
      },
      providesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    }),
    addMacRegList: build.mutation<MacRegistrationPool, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MacRegListUrlsInfo.createMacRegistrationPool, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'MacRegistrationPool', id: 'LIST' }]
    }),
    updateMacRegList: build.mutation<MacRegistrationPool, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MacRegListUrlsInfo.updateMacRegistrationPool, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'MacRegistrationPool', id: 'LIST' }]
    }),
    deleteMacRegList: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MacRegListUrlsInfo.deleteMacRegistrationPool, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'MacRegistrationPool', id: 'LIST' }]
    }),
    deleteMacRegistration: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MacRegListUrlsInfo.deleteMacRegistration, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    }),
    getMacRegList: build.query<MacRegistrationPool, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MacRegListUrlsInfo.getMacRegistrationPool, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'MacRegistrationPool', id: 'DETAIL' }]
    }),
    addMacRegistration: build.mutation<MacRegistration, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MacRegListUrlsInfo.addMacRegistration, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    }),
    updateMacRegistration: build.mutation<MacRegistration, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MacRegListUrlsInfo.updateMacRegistration, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    }),
    radiusAttributeGroupList: build.query<TableResult<RadiusAttributeGroup>, RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const groupReq = createHttpRequest(RadiusAttributeGroupUrlsInfo.getAttributeGroups, params, RKS_NEW_UI)
        return {
          ...groupReq
        }
      },
      transformResponse (result: NewTableResult<RadiusAttributeGroup>) {
        return transferTableResult<RadiusAttributeGroup>(result)
      },
      providesTags: [{ type: 'RadiusAttributeGroup', id: 'LIST' }]
    }),
    radiusAttributeList: build.query<TableResult<RadiusAttribute>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const groupReq = createHttpRequest(RadiusAttributeGroupUrlsInfo.getAttributesWithQuery, params, RKS_NEW_UI)
        return {
          ...groupReq,
          body: payload
        }
      },
      providesTags: [{ type: 'RadiusAttribute', id: 'LIST' }]
    }),
    deleteRadiusAttributeGroup: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RadiusAttributeGroupUrlsInfo.deleteAttributeGroup, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'RadiusAttributeGroup', id: 'LIST' }]
    }),
    addRadiusAttributeGroup: build.mutation<RadiusAttributeGroup, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RadiusAttributeGroupUrlsInfo.createAttributeGroup, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'RadiusAttributeGroup', id: 'LIST' }]
    }),
    updateRadiusAttributeGroup: build.mutation<RadiusAttributeGroup, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RadiusAttributeGroupUrlsInfo.updateAttributeGroup, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'RadiusAttributeGroup', id: 'LIST' }]
    }),
    getRadiusAttributeGroup: build.query<RadiusAttributeGroup, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RadiusAttributeGroupUrlsInfo.getAttributeGroup, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'RadiusAttributeGroup', id: 'DETAIL' }]
    })
  })
})


export const {
  usePolicyListQuery,
  useMacRegListsQuery,
  useDeleteMacRegListMutation,
  useGetMacRegListQuery,
  useMacRegistrationsQuery,
  useDeleteMacRegistrationMutation,
  useAddMacRegistrationMutation,
  useUpdateMacRegistrationMutation,
  useAddMacRegListMutation,
  useUpdateMacRegListMutation,
  useAddRoguePolicyMutation,
  useDelRoguePolicyMutation,
  useDelRoguePoliciesMutation,
  useGetRoguePolicyListQuery,
  useUpdateRoguePolicyMutation,
  useRoguePolicyQuery,
  useVenueRoguePolicyQuery,
  useLazyMacRegListsQuery,
  useLazyMacRegistrationsQuery,
  useRadiusAttributeGroupListQuery,
  useGetRadiusAttributeGroupQuery,
  useRadiusAttributeListQuery,
  useLazyRadiusAttributeListQuery,
  useDeleteRadiusAttributeGroupMutation,
  useLazyRadiusAttributeGroupListQuery,
  useUpdateRadiusAttributeGroupMutation,
  useAddRadiusAttributeGroupMutation
} = policyApi
