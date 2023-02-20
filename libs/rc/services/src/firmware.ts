import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  TableResult,
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
    })
  })
})

export const {
  useGetVenueVersionListQuery,
  useGetLatestFirmwareListQuery,
  useGetAvailableFirmwareListQuery
} = firmwareApi
