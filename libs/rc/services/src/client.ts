import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  createHttpRequest,
  Client,
  ClientUrlsInfo,
  CommonUrlsInfo,
  DpskPassphrase,
  EventMeta,
  RequestPayload,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'

export const baseClientApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'clientApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const clientApi = baseClientApi.injectEndpoints({
  endpoints: (build) => ({
    getClientDetails: build.query<Client, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ClientUrlsInfo.getClientDetails, params)
        return {
          ...req
        }
      }
    }),
    getDpskPassphraseByQuery: build.query<DpskPassphrase, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.getDpskPassphraseByQuery, params)
        return{
          ...req,
          body: payload
        }
      }
    }),
    getHistoricalClientDetails: build.query<Client, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const clientDetails = {
          ...createHttpRequest(CommonUrlsInfo.getHistoricalClientDetails, arg.params),
          body: arg.payload
        }
        const baseDetailsQuery = await fetchWithBQ(clientDetails)
        const baseDetails = baseDetailsQuery.data as { data: Client[] }

        const metaInfo = {
          ...createHttpRequest(CommonUrlsInfo.getEventListMeta, arg.params),
          body: {
            fields: ['networkId', 'venueName', 'apName'],
            filters: { id: [baseDetails?.data?.[0]?.id] }
          }
        }
        const metaListQuery = await fetchWithBQ(metaInfo)
        const metaList = metaListQuery?.data as { data: EventMeta[] }

        return {
          data: {
            ...baseDetails?.data?.[0],
            ...metaList?.data?.[0]
          }
        }
      }
    })
  })
})
export const {
  useGetClientDetailsQuery,
  useLazyGetClientDetailsQuery,
  useGetDpskPassphraseByQueryQuery,
  useLazyGetDpskPassphraseByQueryQuery,
  useGetHistoricalClientDetailsQuery,
  useLazyGetHistoricalClientDetailsQuery
} = clientApi
