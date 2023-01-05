import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  createHttpRequest,
  RequestFormData,
  RequestPayload,
  SaveSwitchProfile,
  SwitchUrlsInfo,
  SwitchViewModel,
  SwitchPortViewModel,
  TableResult,
  SwitchAclUnion,
  SwitchDefaultVlan,
  SwitchProfile,
  SwitchVlanUnion,
  PortSetting,
  PortsSetting,
  VePortRoutedResp,
  Vlan
} from '@acx-ui/rc/utils'

export const baseSwitchApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'switchApi',
  tagTypes: ['Switch', 'SwitchPort'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
})

export const switchApi = baseSwitchApi.injectEndpoints({
  endpoints: (build) => ({
    switchDetailHeader: build.query<SwitchViewModel, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchDetailHeader, params)
        return {
          ...req
        }
      }
    }),
    switchPortlist: build.query<TableResult<SwitchPortViewModel>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          SwitchUrlsInfo.getSwitchPortlist,
          params
        )
        return {
          ...req,
          body: payload
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchPort', id: 'LIST' }]
    }),
    getSwitchRoutedList: build.query<VePortRoutedResp, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          SwitchUrlsInfo.getSwitchRoutedList,
          params
        )
        return {
          ...req,
          body: payload
        }
      }
    }),
    getVenueRoutedList: build.query<VePortRoutedResp, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          SwitchUrlsInfo.getVenueRoutedList,
          params
        )
        return {
          ...req,
          body: payload
        }
      }
    }),
    getPortSetting: build.query<PortSetting, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getPortSetting, params)
        return {
          ...req
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchPort', id: 'Setting' }]
    }),
    getPortsSetting: build.query<PortsSetting, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          SwitchUrlsInfo.getPortsSetting,
          params
        )
        return {
          ...req,
          body: payload
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchPort', id: 'Setting' }]
    }),
    getAclUnion: build.query<SwitchAclUnion, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getAclUnion, params)
        return {
          ...req
        }
      }
    }),
    getDefaultVlan: build.query<SwitchDefaultVlan[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          SwitchUrlsInfo.getDefaultVlan,
          params
        )
        return {
          ...req,
          body: payload
        }
      }
    }),
    getSwitchVlan: build.query<SwitchVlanUnion, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchVlanUnion, params)
        return {
          ...req
        }
      }
    }),
    getSwitchVlans: build.query<Vlan[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchVlans, params)
        return {
          ...req
        }
      }
    }),
    getSwitchesVlan: build.query<SwitchVlanUnion, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          SwitchUrlsInfo.getSwitchesVlan,
          params
        )
        return {
          ...req,
          body: payload
        }
      }
    }),
    getVlansByVenue: build.query<Vlan[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getVlansByVenue, params)
        return {
          ...req
        }
      }
    }),
    getTaggedVlansByVenue: build.query<any, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getTaggedVlansByVenue, params)
        return {
          ...req
        }
      }
    }),
    getUntaggedVlansByVenue: build.query<any, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getUntaggedVlansByVenue, params)
        return {
          ...req
        }
      }
    }),
    getSwitchConfigurationProfileByVenue: build.query<SwitchProfile[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchConfigurationProfileByVenue, params)
        return {
          ...req
        }
      }
    }),
    savePortsSetting: build.mutation<SaveSwitchProfile[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.savePortsSetting, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'SwitchPort', id: 'LIST' }]
    }),
    importSwitches: build.mutation<{}, RequestFormData>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.importSwitches, params, {
          'Content-Type': undefined,
          'Accept': '*/*'
        })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'LIST' }]
    })
  })
})
export const {
  useSwitchDetailHeaderQuery,
  useSwitchPortlistQuery,
  useGetPortSettingQuery,
  useLazyGetPortSettingQuery,
  useGetPortsSettingQuery,
  useLazyGetPortsSettingQuery,
  useGetSwitchRoutedListQuery,
  useLazyGetSwitchRoutedListQuery,
  useGetVenueRoutedListQuery,
  useLazyGetVenueRoutedListQuery,
  useGetAclUnionQuery,
  useGetDefaultVlanQuery,
  useGetSwitchVlanQuery,
  useLazyGetSwitchVlanQuery,
  useGetSwitchVlansQuery,
  useLazyGetSwitchVlansQuery,
  useGetSwitchesVlanQuery,
  useLazyGetSwitchesVlanQuery,
  useGetVlansByVenueQuery,
  useLazyGetVlansByVenueQuery,
  useGetTaggedVlansByVenueQuery,
  useLazyGetTaggedVlansByVenueQuery,
  useGetUntaggedVlansByVenueQuery,
  useLazyGetUntaggedVlansByVenueQuery,
  useGetSwitchConfigurationProfileByVenueQuery,
  useLazyGetSwitchConfigurationProfileByVenueQuery,
  useSavePortsSettingMutation,
  useImportSwitchesMutation
} = switchApi
