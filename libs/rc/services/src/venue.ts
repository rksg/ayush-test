import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  SwitchUrlsInfo,
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
  RadiusServer,
  TacacsServer,
  LocalUser,
  AAASetting
} from '@acx-ui/rc/utils'

export const baseVenueApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'venueApi',
  tagTypes: ['Venue', 'AAA'],
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
          showActivityMessage(msg, ['AddVenue', 'DeleteVenue'], () => {
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
    venueSwitchAAAServerList: build.query<
    TableResult<RadiusServer | TacacsServer | LocalUser>, RequestPayload>({
      query: ({ params, payload }) => {
        const listReq = createHttpRequest(SwitchUrlsInfo.getAaaServerList, params)
        return {
          ...listReq,
          body: payload
        }
      },
      providesTags: [{ type: 'AAA', id: 'LIST' }]
    }),
    getAaaSetting: build.query<AAASetting, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getAaaSetting, params)
        return{
          ...req
        }
      }
    }),
    addAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.addAaaServer, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AAA', id: 'LIST' }]
    }),
    updateAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.updateAaaServer, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AAA', id: 'LIST' }]
    }),
    deleteAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.deleteAaaServer, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'AAA', id: 'LIST' }]
    }),
    bulkDeleteAAAServer: build.mutation<RadiusServer | TacacsServer | LocalUser, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.bulkDeleteAaaServer, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AAA', id: 'LIST' }]
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
  useGetVenueCapabilitiesQuery,
  useGetVenueApModelsQuery,
  useGetVenueLedOnQuery,
  useUpdateVenueLedOnMutation,
  useVenueSwitchAAAServerListQuery,
  useGetAaaSettingQuery,
  useAddAAAServerMutation,
  useUpdateAAAServerMutation,
  useDeleteAAAServerMutation,
  useBulkDeleteAAAServerMutation
} = venueApi
