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
  VenueExtended,
  VenueDetailHeader,
  VenueCapabilities,
  VenueLed,
  VenueApModels,
  VenueLanPorts,
  VenueSettings,
  VenueSwitchConfiguration,
  ConfigurationProfile
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
          const activities = [
            'AddVenue',
            'UpdateVenue',
            'DeleteVenue',
            'DeleteVenues'
          ]
          showActivityMessage(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }]))
          })
        })
      }
    }),
    addVenue: build.mutation<VenueExtended, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.addVenue, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }]
    }),
    getVenue: build.query<VenueExtended, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenue, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'DETAIL' }]
    }),
    updateVenue: build.mutation<VenueExtended, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateVenue, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }]
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
    deleteVenue: build.mutation<Venue, RequestPayload>({
      query: ({ params, payload }) => {
        if(payload){ //delete multiple rows
          const req = createHttpRequest(CommonUrlsInfo.deleteVenues, params)
          return {
            ...req,
            body: payload
          }
        }else{ //delete single row
          const req = createHttpRequest(CommonUrlsInfo.deleteVenue, params)
          return {
            ...req
          }
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }]
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
    getVenueLanPorts: build.query<VenueLanPorts[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenueLanPorts, params)
        return{
          ...req
        }
      }
    }),
    updateVenueLanPorts: build.mutation<VenueLanPorts[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateVenueLanPorts, params)
        return{
          ...req
        }
      }
    }),
    configProfiles: build.query<ConfigurationProfile[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getConfigProfiles, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse (result: { data: ConfigurationProfile[] }) {
        return result?.data
      }
    }),
    venueSwitchSetting: build.query<VenueSwitchConfiguration, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenueSwitchSetting, params)
        return{
          ...req
        }
      }
    }),
    updateVenueSwitchSetting: build.mutation<Venue, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateVenueSwitchSetting, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    switchConfigProfile: build.query<ConfigurationProfile, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getSwitchConfigProfile, params)
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
  useUpdateVenueMutation,
  useVenueDetailsHeaderQuery,
  useGetVenueSettingsQuery,
  useUpdateVenueMeshMutation,
  useDeleteVenueMutation,
  useFloorPlanListQuery,
  useGetVenueCapabilitiesQuery,
  useGetVenueApModelsQuery,
  useGetVenueLedOnQuery,
  useUpdateVenueLedOnMutation,
  useGetVenueLanPortsQuery,
  useUpdateVenueLanPortsMutation,
  useConfigProfilesQuery,
  useVenueSwitchSettingQuery,
  useUpdateVenueSwitchSettingMutation,
  useSwitchConfigProfileQuery
} = venueApi
