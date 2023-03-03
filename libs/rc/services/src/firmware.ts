import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonResult,
  TableResult,
  UpgradePreferences,
  FirmwareUrlsInfo,
  FirmwareVersion,
  FirmwareVenue,
  createHttpRequest,
  RequestPayload
} from '@acx-ui/rc/utils'

export const baseFirmwareApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'firmwareApi',
  tagTypes: ['Firmware'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const firmwareApi = baseFirmwareApi.injectEndpoints({
  endpoints: (build) => ({
    getUpgradePreferences: build.query<UpgradePreferences, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getUpgradePreferences, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Firmware', id: 'PREFERENCES' }]
    }),
    updateUpgradePreferences: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.updateUpgradePreferences, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Firmware', id: 'PREFERENCES' }]
    }),
    getVenueVersionList: build.query<TableResult<FirmwareVenue>, RequestPayload>({
      query: ({ params, payload }) => {
        const queryString = payload as { searchString: string }
        const req = createHttpRequest(FirmwareUrlsInfo.getVenueVersionList, {
          ...params,
          version: '',
          type: '',
          search: queryString.searchString ?? ''
        })
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Firmware', id: 'LIST' }]
    }),
    getVenueVersions: build.query<FirmwareVenue[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getVenueVersions, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Firmware', id: 'LIST' }]
    }),
    getLatestFirmwareList: build.query<FirmwareVersion[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getLatestFirmwareList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Firmware', id: 'LIST' }]
    }),
    getAvailableFirmwareList: build.query<FirmwareVersion[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getAvailableFirmwareList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Firmware', id: 'LIST' }]
    }),
    getFirmwareVersionIdList: build.query<string[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getFirmwareVersionIdList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Firmware', id: 'LIST' }]
    }),
    skipVenueUpgradeSchedules: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.skipVenueUpgradeSchedules, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Firmware', id: 'LIST' }]
    }),
    updateVenueSchedules: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.updateVenueSchedules, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Firmware', id: 'LIST' }]
    }),
    updateNow: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.updateNow, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Firmware', id: 'LIST' }]
    })
  })
})

export const {
  useGetUpgradePreferencesQuery,
  useUpdateUpgradePreferencesMutation,
  useGetVenueVersionListQuery,
  useGetLatestFirmwareListQuery,
  useGetAvailableFirmwareListQuery,
  useGetFirmwareVersionIdListQuery,
  useSkipVenueUpgradeSchedulesMutation,
  useUpdateVenueSchedulesMutation,
  useUpdateNowMutation
} = firmwareApi
