import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
  FloorPlanDto,
  onSocketActivityChanged,
  RequestPayload,
  showActivityMessage,
  TableResult,
  Venue,
  VenueDetailHeader,
  VenueCapabilities,
  VenueLed,
  VenueApModels,
  VenueSettings,
  VenueDosProtection,
  VenueRogueAp,
  RogueClassificationPolicy
} from '@acx-ui/rc/utils'

export const baseVenueApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'venueApi',
  tagTypes: ['Venue'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
})

export const venueApi = baseVenueApi.injectEndpoints({
  endpoints: (build) => ({
    venuesList: build.query<TableResult<Venue>, RequestPayload>({
      query: ({ params, payload }) => {
        const venueListReq = createHttpRequest(CommonUrlsInfo.getVenuesList, params)
        return {
          ...venueListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Venue', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          showActivityMessage(msg, [
            'AddVenue',
            'DeleteVenue',
            'UpdateVenueRogueAp',
            'AddRoguePolicy',
            'UpdateRoguePolicy',
            'UpdateDenialOfServiceProtection'
          ], () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }]))
          })
        })
      }
    }),
    addVenue: build.mutation<Venue, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.addVenue, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }]
    }),
    getVenue: build.query<Venue, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenue, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'DETAIL' }]
    }),
    venueDetailsHeader: build.query<VenueDetailHeader, RequestPayload>({
      query: ({ params }) => {
        const venueDetailReq = createHttpRequest(CommonUrlsInfo.getVenueDetailsHeader, params)
        return {
          ...venueDetailReq
        }
      },
      providesTags: [{ type: 'Venue', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          showActivityMessage(msg,
            ['AddNetworkVenue', 'DeleteNetworkVenue'], () => {
              api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'DETAIL' }]))
            })
        })
      }
    }),
    floorPlanList: build.query<FloorPlanDto[], RequestPayload>({
      query: ({ params }) => {
        const floorPlansReq = createHttpRequest(CommonUrlsInfo.getVenueFloorplans, params)
        return {
          ...floorPlansReq
        }
      }
    }),
    getVenueSettings: build.query<VenueSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenueSettings, params)
        return{
          ...req
        }
      }
    }),
    updateVenueMesh: build.mutation<VenueLed[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateVenueMesh, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getVenueCapabilities: build.query<VenueCapabilities, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenueCapabilities, params)
        return{
          ...req
        }
      }
    }),
    getVenueApModels: build.query<VenueApModels, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenueApModels, params)
        return{
          ...req
        }
      }
    }),
    getVenueLedOn: build.query<VenueLed[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenueLedOn, params)
        return{
          ...req
        }
      }
    }),
    updateVenueLedOn: build.mutation<VenueLed[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateVenueLedOn, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getDenialOfServiceProtection: build.query<VenueDosProtection, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getDenialOfServiceProtection, params)
        return{
          ...req
        }
      }
    }),
    updateDenialOfServiceProtection: build.mutation<VenueDosProtection, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateDenialOfServiceProtection, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }]
    }),
    getVenueRogueAp: build.query<VenueRogueAp, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenueRogueAp, params)
        return{
          ...req
        }
      }
    }),
    updateVenueRogueAp: build.mutation<VenueRogueAp, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateVenueRogueAp, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }]
    }),
    getRoguePolicies: build.query<RogueClassificationPolicy[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getRoguePolicies, params)
        return{
          ...req
        }
      }
    })
  })
})

export const {
  useVenuesListQuery,
  useLazyVenuesListQuery,
  useAddVenueMutation,
  useGetVenueQuery,
  useVenueDetailsHeaderQuery,
  useFloorPlanListQuery,
  useGetVenueSettingsQuery,
  useUpdateVenueMeshMutation,
  useGetVenueCapabilitiesQuery,
  useGetVenueApModelsQuery,
  useGetVenueLedOnQuery,
  useUpdateVenueLedOnMutation,
  useGetDenialOfServiceProtectionQuery,
  useUpdateDenialOfServiceProtectionMutation,
  useGetVenueRogueApQuery,
  useUpdateVenueRogueApMutation,
  useGetRoguePoliciesQuery
} = venueApi
