import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
  Guest,
  Network,
  onSocketActivityChanged,
  RequestPayload,
  showActivityMessage,
  TableResult
} from '@acx-ui/rc/utils'

export const baseClientApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'clientApi',
  refetchOnMountOrArgChange: true,
  tagTypes: ['Client', 'Guest'],
  endpoints: () => ({ })
})

export const clientApi = baseClientApi.injectEndpoints({
  endpoints: (build) => ({
    getGuestsList: build.query<TableResult<Guest>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          CommonUrlsInfo.getGuestsList,
          params
        )
        return {
          ...req,
          body: payload
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Guest', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          showActivityMessage(msg, ['AddGuest', 'DeleteGuest'], () => {
            api.dispatch(clientApi.util.invalidateTags([{ type: 'Guest', id: 'LIST' }]))
          })
        })
      }
    }),
    addGuestPass: build.mutation<Guest, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.addGuestPass, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }]
    }),
    getGuestNetworkList: build.query<TableResult<Network>, RequestPayload>({
      query: ({ params, payload }) => {
        const networkListReq = createHttpRequest(CommonUrlsInfo.getVMNetworksList, params)
        return {
          ...networkListReq,
          body: payload
        }
      }
    })
  })
})
export const {
  useGetGuestsListQuery,
  useAddGuestPassMutation,
  useLazyGetGuestNetworkListQuery
} = clientApi
