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
  VenueExtended,
  VenueDetailHeader,
  APMesh,
  VenueCapabilities,
  VenueLed,
  VenueApModels,
  VenueDosProtection,
  VenueRogueAp,
  RogueClassificationPolicy,
  RadiusServer,
  TacacsServer,
  LocalUser,
  AAASetting,
  CommonResult,
  VenueSettings,
  VenueSwitchConfiguration,
  ConfigurationProfile,
  WifiUrlsInfo,
  AvailableLteBands,
  VenueApModelCellular
} from '@acx-ui/rc/utils'


export const baseVenueApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'venueApi',
  tagTypes: ['Venue', 'Device', 'VenueFloorPlan', 'AAA'],
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
            'DeleteVenues',
            'UpdateVenueRogueAp',
            'AddRoguePolicy',
            'UpdateRoguePolicy',
            'UpdateDenialOfServiceProtection'
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
    updateVenueCellularSettings: build.mutation<VenueApModelCellular[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateVenueCellularSettings, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    meshAps: build.query<TableResult<APMesh>, RequestPayload>({
      query: ({ params, payload }) => {
        const venueMeshReq = createHttpRequest(CommonUrlsInfo.getMeshAps, params)
        return {
          ...venueMeshReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Device', id: 'MESH' }]
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
      },
      providesTags: [{ type: 'VenueFloorPlan', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          showActivityMessage(msg, ['AddFloorPlan', 'UpdateFloorPlan', 'DeleteFloorPlan'], () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'VenueFloorPlan', id: 'DETAIL' }]))
          })
        })
      }
    }),
    deleteFloorPlan: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.deleteFloorPlan, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'VenueFloorPlan', id: 'DETAIL' }]
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
    getAvailableLteBands: build.query<AvailableLteBands[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getAvailableLteBands, params)
        return{
          ...req
        }
      }
    }),
    getVenueApModelCellular: build.query<VenueApModelCellular, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getVenueApModelCellular, params)
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
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          showActivityMessage(msg,
            ['AddAaaServer', 'UpdateAaaServer', 'DeleteAaaServer'], () => {
              api.dispatch(venueApi.util.invalidateTags([{ type: 'AAA', id: 'LIST' }]))
            })
        })
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
  useUpdateVenueMutation,
  useVenueDetailsHeaderQuery,
  useGetVenueSettingsQuery,
  useUpdateVenueMeshMutation,
  useUpdateVenueCellularSettingsMutation,
  useMeshApsQuery,
  useDeleteVenueMutation,
  useFloorPlanListQuery,
  useDeleteFloorPlanMutation,
  useGetVenueCapabilitiesQuery,
  useGetVenueApModelsQuery,
  useGetVenueLedOnQuery,
  useUpdateVenueLedOnMutation,
  useVenueSwitchAAAServerListQuery,
  useGetAaaSettingQuery,
  useAddAAAServerMutation,
  useUpdateAAAServerMutation,
  useDeleteAAAServerMutation,
  useBulkDeleteAAAServerMutation,
  useGetDenialOfServiceProtectionQuery,
  useUpdateDenialOfServiceProtectionMutation,
  useGetVenueRogueApQuery,
  useUpdateVenueRogueApMutation,
  useGetRoguePoliciesQuery,
  useConfigProfilesQuery,
  useVenueSwitchSettingQuery,
  useUpdateVenueSwitchSettingMutation,
  useSwitchConfigProfileQuery,
  useGetAvailableLteBandsQuery,
  useGetVenueApModelCellularQuery
} = venueApi
