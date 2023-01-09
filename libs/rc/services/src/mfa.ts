import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  MFASession,
  createHttpRequest,
  RequestPayload,
  AdministrationUrlsInfo
} from '@acx-ui/rc/utils'

export const baseMfaApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'mfaApi',
  tagTypes: ['mfa'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const mfaApi = baseMfaApi.injectEndpoints({
  endpoints: (build) => ({
    getMfaTenantDetails: build.query<MFASession, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getMfaTenantDetails, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'mfa', id: 'DETAIL' }]
    })
  })
})

export const {
  useGetMfaTenantDetailsQuery
} = mfaApi
