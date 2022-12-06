import {
  createApi,
  fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  RequestPayload,
  CommonResult,
  RadiusUrlsInfo,
  MacRegistration,
  MacRegistrationPool,
  createHttpRequest, NewTableResult
} from '@acx-ui/rc/utils'

export const baseMacRegPoolApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'macRegPoolApi',
  tagTypes: ['MacRegistrationPool', 'MacRegistration'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const macRegPoolApi = baseMacRegPoolApi.injectEndpoints({
  endpoints: (build) => ({
    macRegLists: build.query<NewTableResult<MacRegistrationPool>, RequestPayload>({
      query: ({ params }) => {
        const poolsReq = createHttpRequest(RadiusUrlsInfo.getMacRegistrationPools, params)
        return {
          ...poolsReq,
          params
        }
      },
      providesTags: [{ type: 'MacRegistrationPool', id: 'LIST' }]
    }),
    macRegistrations: build.query<NewTableResult<MacRegistration>, RequestPayload>({
      query: ({ params }) => {
        const poolsReq = createHttpRequest(RadiusUrlsInfo.getMacRegistrations, params)
        return {
          ...poolsReq,
          params
        }
      },
      providesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    }),
    addMacRegList: build.mutation<MacRegistrationPool, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RadiusUrlsInfo.createMacRegistrationPool, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'MacRegistrationPool', id: 'LIST' }]
    }),
    updateMacRegList: build.mutation<MacRegistrationPool, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RadiusUrlsInfo.updateMacRegistrationPool, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    }),
    deleteMacRegList: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RadiusUrlsInfo.deleteMacRegistrationPool, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'MacRegistrationPool', id: 'LIST' }]
    }),
    deleteMacRegistration: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RadiusUrlsInfo.deleteMacRegistration, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    }),
    getMacRegList: build.query<MacRegistrationPool, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RadiusUrlsInfo.getMacRegistrationPool, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'MacRegistrationPool', id: 'DETAIL' }]
    }),
    addMacRegistration: build.mutation<MacRegistration, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RadiusUrlsInfo.addMacRegistration, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    }),
    updateMacRegistration: build.mutation<MacRegistration, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RadiusUrlsInfo.updateMacRegistration, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    })
  })
})

export const {
  useMacRegListsQuery,
  useDeleteMacRegListMutation,
  useGetMacRegListQuery,
  useLazyGetMacRegListQuery,
  useMacRegistrationsQuery,
  useDeleteMacRegistrationMutation,
  useAddMacRegistrationMutation,
  useUpdateMacRegistrationMutation,
  useAddMacRegListMutation,
  useUpdateMacRegListMutation
} = macRegPoolApi
