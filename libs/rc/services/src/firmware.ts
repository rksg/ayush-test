import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  TableResult,
  FirmwareUrlsInfo,
  FirmwareVenue,
  createHttpRequest,
  RequestPayload
} from '@acx-ui/rc/utils'

export const baseFirmwareApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'firmwareApi',
  tagTypes: ['Administration', 'Firmware', 'RadiusClientConfig'],
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
    })
  })
})

export const {
  useGetVenueVersionListQuery
} = firmwareApi
