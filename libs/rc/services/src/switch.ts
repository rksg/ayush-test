import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  createHttpRequest,
  RequestFormData,
  RequestPayload,
  SwitchUrlsInfo,
  SwitchViewModel
} from '@acx-ui/rc/utils'

export const baseSwitchApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'switchApi',
  tagTypes: ['Switch'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
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
  useImportSwitchesMutation
} = switchApi
