import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  CommonUrlsInfo,
  DHCPUrls,
  WifiUrlsInfo,
  SwitchUrlsInfo,
  createHttpRequest,
  FloorPlanDto,
  onSocketActivityChanged,
  RequestPayload,
  onActivityMessageReceived,
  TableResult,
  Venue,
  VenueExtended,
  VenueDetailHeader,
  APMesh,
  Capabilities,
  VenueLed,
  VenueApModels,
  ExternalAntenna,
  CapabilitiesApModel,
  VenueLanPorts,
  VenueDosProtection,
  VenueRogueAp,
  RogueClassificationPolicy,
  VenueSyslog,
  RadiusServer,
  TacacsServer,
  LocalUser,
  AAASetting,
  CommonResult,
  NetworkVenue,
  VenueSettings,
  VenueSwitchConfiguration,
  ConfigurationProfile,
  ConfigurationHistory,
  transformConfigType,
  transformConfigStatus,
  VenueConfigHistoryDetailResp,
  VenueDHCPProfile,
  VenueDHCPPoolInst,
  DHCPLeases,
  VenueDefaultRegulatoryChannels,
  TriBandSettings,
  AvailableLteBands,
  VenueApModelCellular,
  UploadUrlResponse,
  NetworkDeviceResponse,
  NetworkDevicePayload,
  RogueOldApResponseType,
  VenueRadioCustomization,
  VenueDirectedMulticast,
  VenueLoadBalancing,
  TopologyData,
  VenueBonjourFencingPolicy,
  PropertyConfigs,
  PropertyUrlsInfo,
  PropertyUnit,
  ResidentPortal,
  NewTableResult,
  transferToTableResult,
  downloadFile,
  RequestFormData,
  createNewTableHttpRequest,
  TableChangePayload
} from '@acx-ui/rc/utils'
import { baseVenueApi } from '@acx-ui/store'

const RKS_NEW_UI = {
  'x-rks-new-ui': true
}

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
      keepUnusedDataFor: 0,
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
          onActivityMessageReceived(msg, activities, () => {
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
    newAddVenue: build.mutation<VenueExtended, RequestPayload>({ //Only for IT test
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.newAddVenue, params)
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
    getVenues: build.query<{ data: Venue[] }, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenues, params)
        return{
          ...req,
          body: payload
        }
      }
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
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Venue', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg,
            ['AddNetworkVenue', 'DeleteNetworkVenue'], () => {
              api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'DETAIL' }]))
            })
        })
      }
    }),
    getVenueCityList: build.query<{ name: string }[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenueCityList, params)
        return{
          ...req, body: payload
        }
      },
      transformResponse: (result: { cityList: { name: string }[] }) => {
        return result.cityList
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
        if (payload) { //delete multiple rows
          let req = createHttpRequest(CommonUrlsInfo.deleteVenues, params)
          return {
            ...req,
            body: payload
          }
        } else { //delete single row
          let req = createHttpRequest(CommonUrlsInfo.deleteVenue, params)
          return {
            ...req
          }
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }]
    }),
    getNetworkApGroups: build.query<NetworkVenue[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.venueNetworkApGroup, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse: (result: CommonResult) => {
        return result.response as NetworkVenue[]
      }
    }),
    getFloorPlan: build.query<FloorPlanDto, RequestPayload>({
      query: ({ params }) => {
        const floorPlansReq = createHttpRequest(CommonUrlsInfo.getFloorplan, params)
        return {
          ...floorPlansReq
        }
      },
      transformResponse (result: FloorPlanDto) {
        return result
      }
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
          onActivityMessageReceived(msg,
            ['AddFloorPlan', 'UpdateFloorPlan', 'DeleteFloorPlan'], () => {
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
    addFloorPlan: build.mutation<FloorPlanDto, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.addFloorplan,
          params)
        return {
          ...req,
          headers: {
            ...req.headers,
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json; charset=UTF-8'
          },
          body: payload
        }
      },
      invalidatesTags: [{ type: 'VenueFloorPlan', id: 'DETAIL' }]
    }),
    getUploadURL: build.mutation<UploadUrlResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const floorPlansReq = createHttpRequest(CommonUrlsInfo.getUploadURL, params)
        return {
          ...floorPlansReq,
          body: payload
        }
      }
    }),
    updateFloorPlan: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateFloorplan, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'VenueFloorPlan', id: 'DETAIL' }]
    }),
    getAllDevices: build.query<NetworkDeviceResponse, RequestPayload<NetworkDevicePayload>>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getAllDevices, params)
        return {
          ...req,
          body: payload as NetworkDevicePayload
        }
      },
      providesTags: [{ type: 'VenueFloorPlan', id: 'DEVICE' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'Update Switch Position',
            'UpdateApPosition',
            'UpdateCloudpathServerPosition',
            'DeleteFloorPlan'], () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'VenueFloorPlan', id: 'DEVICE' }]))
          })
        })
      }
    }),
    updateSwitchPosition: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.UpdateSwitchPosition, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'VenueFloorPlan', id: 'DEVICE' }]
    }),
    updateApPosition: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.UpdateApPosition, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'VenueFloorPlan', id: 'DEVICE' }]
    }),
    updateCloudpathServerPosition: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.UpdateCloudpathServerPosition, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'VenueFloorPlan', id: 'DEVICE' }]
    }),
    getVenueCapabilities: build.query<Capabilities, RequestPayload>({
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
    switchConfigProfile: build.query<ConfigurationProfile, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getSwitchConfigProfile, params)
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
      providesTags: [{ type: 'AAA', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg,
            ['AddAaaServer', 'UpdateAaaServer', 'DeleteAaaServer'], () => {
              api.dispatch(venueApi.util.invalidateTags([{ type: 'AAA', id: 'LIST' }]))
            })
        })
      }
    }),
    updateAAASetting: build.mutation<AAASetting, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.updateAaaSetting, params)
        return{
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AAA', id: 'DETAIL' }]
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
    getVenueExternalAntenna: build.query<ExternalAntenna[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getVenueExternalAntenna, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'ExternalAntenna', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg,
            ['UpdateVenueExternalAntenna'], () => {
              api.dispatch(venueApi.util.invalidateTags([{ type: 'ExternalAntenna', id: 'LIST' }]))
            })
        })
      }
    }),
    venueDefaultRegulatoryChannels: build.query<VenueDefaultRegulatoryChannels, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getVenueDefaultRegulatoryChannels, params)
        return{
          ...req
        }
      }
    }),
    getDefaultRadioCustomization: build.query<VenueRadioCustomization, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getDefaultRadioCustomization, params)
        return{
          ...req
        }
      }
    }),
    getVenueRadioCustomization: build.query<VenueRadioCustomization, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.getVenueRadioCustomization, params)
        return{
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'VenueRadio', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg,
            ['UpdateVenueRadioCustomization'], () => {
              api.dispatch(venueApi.util.invalidateTags([{ type: 'VenueRadio', id: 'LIST' }]))
            })
        })
      }
    }),
    updateVenueRadioCustomization:
    build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateVenueRadioCustomization, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'VenueRadio', id: 'LIST' }]
    }),
    getVenueTripleBandRadioSettings:
    build.query<TriBandSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getVenueTripleBandRadioSettings, params)
        return{
          ...req
        }
      }
    }),
    updateVenueTripleBandRadioSettings:
    build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateVenueTripleBandRadioSettings, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getVenueApCapabilities: build.query<{
      version: string,
      apModels:CapabilitiesApModel[] }, RequestPayload>({
        query: ({ params }) => {
          const req = createHttpRequest(WifiUrlsInfo.getVenueApCapabilities, params)
          return {
            ...req
          }
        },
        providesTags: [{ type: 'ExternalAntenna', id: 'LIST' }]
      }),
    updateVenueExternalAntenna: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateVenueExternalAntenna, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'ExternalAntenna', id: 'LIST' }]
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
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateVenueRogueAp',
            'UpdateDenialOfServiceProtection'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }]))
          })
        })
      }
    }),
    getOldVenueRogueAp: build.query<TableResult<RogueOldApResponseType>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getOldVenueRogueAp, params)
        return{
          ...req,
          body: payload
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
    }),
    updateVenueSyslogAp: build.mutation<VenueSyslog, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateVenueSyslogAp, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'Syslog' }]
    }),
    venueDHCPProfile: build.query<VenueDHCPProfile, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(DHCPUrls.getVenueDHCPServiceProfile, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'DHCPProfile' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateVenueDhcpConfigServiceProfileSetting'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'DHCPProfile' }]))
          })
        })
      }

    }),
    venueDHCPPools: build.query<VenueDHCPPoolInst[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(DHCPUrls.getVenueActivePools, params, RKS_NEW_UI)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'poolList' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'DeactivateVenueDhcpPool',
            'ActivateVenueDhcpPool'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'poolList' }]))
          })
        })
      }
    }),
    venuesLeasesList: build.query<DHCPLeases[], RequestPayload>({
      query: ({ params }) => {
        const leasesList = createHttpRequest(DHCPUrls.getVenueLeases, params, RKS_NEW_UI)
        return {
          ...leasesList
        }
      }
    }),
    activateDHCPPool: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(DHCPUrls.activeVenueDHCPPool, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      }
    }),
    deactivateDHCPPool: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(DHCPUrls.deactivateVenueDHCPPool, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateVenueDHCPProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(DHCPUrls.updateVenueDHCPProfile, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getVenueDirectedMulticast: build.query<VenueDirectedMulticast, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getVenueDirectedMulticast, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'DIRECTED_MULTICAST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateVenueDirectedMulticast'
          ]
          onActivityMessageReceived(msg, activities, () => {
            const invalidateTagsFunc = venueApi.util.invalidateTags
            api.dispatch(invalidateTagsFunc([{ type: 'Venue', id: 'DIRECTED_MULTICAST' }]))
          })
        })
      }
    }),
    updateVenueDirectedMulticast: build.mutation<VenueDirectedMulticast, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateVenueDirectedMulticast, params)
        return{
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'DIRECTEDMULTICAST' }]
    }),
    getVenueConfigHistory: build.query<TableResult<ConfigurationHistory>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenueConfigHistory, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse: (res: { response:{ list:ConfigurationHistory[], totalCount:number } }, meta
        , arg: { payload:{ page:number } }) => {
        return {
          data: res.response.list ? res.response.list.map(item => ({
            ...item,
            startTime: formatter(DateFormatEnum.DateTimeFormatWithSeconds)(item.startTime),
            configType: (item.configType as unknown as string[])
              .map(type => transformConfigType(type)).join(', '),
            dispatchStatus: transformConfigStatus(item.dispatchStatus)
          })) : [],
          totalCount: res.response.totalCount,
          page: arg.payload.page
        }
      }
    }),
    getVenueConfigHistoryDetail: build.query<VenueConfigHistoryDetailResp, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenueConfigHistoryDetail, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getVenueLoadBalancing: build.query<VenueLoadBalancing, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.getVenueLoadBalancing, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'LOAD_BALANCING' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateVenueLoadBalancing'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'LOAD_BALANCING' }]))
          })
        })
      }
    }),
    updateVenueLoadBalancing: build.mutation<VenueLoadBalancing, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateVenueLoadBalancing, params)
        return{
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LOAD_BALANCING' }]
    }),
    getTopology: build.query<TopologyData, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getTopology, params)

        return {
          ...req
        }
      },
      transformResponse: (result: { data: TopologyData[] }) => {
        return result?.data[0] as TopologyData
      }
    }),
    getVenueBonjourFencing: build.query<VenueBonjourFencingPolicy, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.getVenueBonjourFencingPolicy, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'BONJOUR_FENCING' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateVenueBonjourFencing'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'Venue', id: 'BONJOUR_FENCING' }]))
          })
        })
      }
    }),
    updateVenueBonjourFencing: build.mutation<VenueBonjourFencingPolicy, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateVenueBonjourFencingPolicy, params)
        return{
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'BONJOUR_FENCING' }]
    }),
    getPropertyConfigs: build.query<PropertyConfigs, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          PropertyUrlsInfo.getPropertyConfigs,
          params,
          { Accept: 'application/hal+json' }
        )
        return {
          ...req
        }
      },
      providesTags: [{ type: 'PropertyConfigs', id: 'ID' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'ENABLE_PROPERTY',
            'DISABLE_PROPERTY'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([{ type: 'PropertyConfigs', id: 'ID' }]))
          })
        })
      }
    }),
    updatePropertyConfigs: build.mutation<PropertyConfigs, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.updatePropertyConfigs, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'PropertyConfigs', id: 'ID' }]
    }),
    patchPropertyConfigs: build.mutation<PropertyConfigs, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          PropertyUrlsInfo.patchPropertyConfigs,
          params,
          { 'Content-Type': 'application/json-patch+json' })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'PropertyConfigs', id: 'ID' }]
    }),
    addPropertyUnit: build.mutation<PropertyUnit, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.addPropertyUnit, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'PropertyUnit', id: 'LIST' }]
    }),
    importPropertyUnits: build.mutation<{}, RequestFormData>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.importPropertyUnits, params, {
          'Content-Type': undefined,
          'Accept': undefined
        })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'PropertyUnit' }]
    }),

    // eslint-disable-next-line max-len
    getPropertyUnitById: build.query<PropertyUnit, RequestPayload<{ venueId: string, unitId: string }>>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(PropertyUrlsInfo.getUnitById, params, { Accept: 'application/hal+json' })
        return {
          ...req
        }
      },
      providesTags: [{ type: 'PropertyUnit', id: 'ID' }]
    }),
    getPropertyUnitList: build.query<TableResult<PropertyUnit>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          PropertyUrlsInfo.getPropertyUnitList,
          params,
          { Accept: 'application/hal+json' }
        )
        return {
          ...req,
          body: payload
        }
      },
      transformResponse (result: NewTableResult<PropertyUnit>) {
        return transferToTableResult<PropertyUnit>(result)
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'ADD_UNIT',
            'UPDATE_UNIT',
            'DELETE_UNITS'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(venueApi.util.invalidateTags([
              { type: 'PropertyUnit', id: 'LIST' },
              { type: 'PropertyUnit', id: 'ID' }
            ]))
          })
        })
      },
      providesTags: [{ type: 'PropertyUnit', id: 'LIST' }]
    }),
    downloadPropertyUnits: build.query<Blob, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.exportPropertyUnits, {
          ...params
        },{
          Accept: 'text/csv'
        })

        return {
          ...req,
          body: payload,
          responseHandler: async (response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : 'PropertyUnits.csv'
            downloadFile(response, fileName)
          }
        }
      }
    }),
    updatePropertyUnit: build.mutation<PropertyUnit, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.updatePropertyUnit, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'PropertyUnit', id: 'LIST' }]
    }),
    deletePropertyUnits: build.mutation<PropertyUnit, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.deletePropertyUnits, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'PropertyUnit', id: 'LIST' }]
    }),
    getResidentPortalList: build.query<TableResult<ResidentPortal>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: PropertyUrlsInfo.getResidentPortalList,
          params,
          payload: payload as TableChangePayload
        })
        return {
          ...req
        }
      },
      transformResponse (result: NewTableResult<ResidentPortal>) {
        return transferToTableResult<ResidentPortal>(result)
      },
      providesTags: [{ type: 'ResidentPortal', id: 'LIST' }]
    }),
    getVenueWithSetProperty: build.query<string[], string[]>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const result: string[] = []
        for(let venueId of arg) {
          const urlInfo = createHttpRequest(PropertyUrlsInfo.getPropertyConfigs, { venueId })
          urlInfo.headers['Accept'] = '*/*'
          const fetchResult = await fetchWithBQ(urlInfo)
          if(!fetchResult.error) {
            result.push(venueId)
          }
        }
        return { data: result }
      }
    })
  })
})

export const {
  useVenuesListQuery,
  useLazyVenuesListQuery,
  useAddVenueMutation,
  useNewAddVenueMutation,
  useGetVenueQuery,
  useLazyGetVenueQuery,
  useGetVenuesQuery,
  useUpdateVenueMutation,
  useVenueDetailsHeaderQuery,
  useGetVenueCityListQuery,
  useGetVenueSettingsQuery,
  useLazyGetVenueSettingsQuery,
  useUpdateVenueMeshMutation,
  useUpdateVenueCellularSettingsMutation,
  useMeshApsQuery,
  useDeleteVenueMutation,
  useGetNetworkApGroupsQuery,
  useGetFloorPlanQuery,
  useFloorPlanListQuery,
  useDeleteFloorPlanMutation,
  useAddFloorPlanMutation,
  useGetUploadURLMutation,
  useUpdateFloorPlanMutation,
  useGetAllDevicesQuery,
  useUpdateSwitchPositionMutation,
  useUpdateApPositionMutation,
  useUpdateCloudpathServerPositionMutation,
  useGetVenueCapabilitiesQuery,
  useGetVenueApModelsQuery,
  useGetVenueLedOnQuery,
  useUpdateVenueLedOnMutation,
  useGetVenueLanPortsQuery,
  useLazyGetVenueLanPortsQuery,
  useUpdateVenueLanPortsMutation,
  useVenueSwitchAAAServerListQuery,
  useGetAaaSettingQuery,
  useUpdateAAASettingMutation,
  useAddAAAServerMutation,
  useUpdateAAAServerMutation,
  useDeleteAAAServerMutation,
  useBulkDeleteAAAServerMutation,
  useGetDenialOfServiceProtectionQuery,
  useUpdateDenialOfServiceProtectionMutation,
  useGetVenueRogueApQuery,
  useGetOldVenueRogueApQuery,
  useUpdateVenueRogueApMutation,
  useGetRoguePoliciesQuery,
  useConfigProfilesQuery,
  useVenueSwitchSettingQuery,
  useUpdateVenueSwitchSettingMutation,
  useSwitchConfigProfileQuery,
  useVenueDHCPProfileQuery,
  useVenueDHCPPoolsQuery,
  useVenuesLeasesListQuery,
  useActivateDHCPPoolMutation,
  useDeactivateDHCPPoolMutation,
  useUpdateVenueDHCPProfileMutation,
  useVenueDefaultRegulatoryChannelsQuery,
  useGetDefaultRadioCustomizationQuery,
  useGetVenueRadioCustomizationQuery,
  useLazyGetVenueRadioCustomizationQuery,
  useUpdateVenueRadioCustomizationMutation,
  useGetVenueTripleBandRadioSettingsQuery,
  useUpdateVenueTripleBandRadioSettingsMutation,
  useGetVenueExternalAntennaQuery,
  useGetVenueApCapabilitiesQuery,
  useUpdateVenueExternalAntennaMutation,
  useGetAvailableLteBandsQuery,
  useGetVenueApModelCellularQuery,
  useGetVenueDirectedMulticastQuery,
  useLazyGetVenueDirectedMulticastQuery,
  useUpdateVenueDirectedMulticastMutation,
  useGetVenueConfigHistoryQuery,
  useLazyGetVenueConfigHistoryQuery,
  useGetVenueConfigHistoryDetailQuery,
  useLazyGetVenueConfigHistoryDetailQuery,
  useGetVenueLoadBalancingQuery,
  useUpdateVenueLoadBalancingMutation,
  useGetTopologyQuery,
  useGetVenueBonjourFencingQuery,
  useUpdateVenueBonjourFencingMutation,
  useGetPropertyConfigsQuery,
  useUpdatePropertyConfigsMutation,
  usePatchPropertyConfigsMutation,
  useAddPropertyUnitMutation,

  useGetPropertyUnitByIdQuery,
  useLazyGetPropertyUnitByIdQuery,
  useGetPropertyUnitListQuery,
  useUpdatePropertyUnitMutation,
  useDeletePropertyUnitsMutation,
  useGetResidentPortalListQuery,
  useImportPropertyUnitsMutation,
  useLazyDownloadPropertyUnitsQuery,
  useGetVenueWithSetPropertyQuery
} = venueApi
