import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'

import {
  Client,
  ClientList,
  ClientListMeta,
  ClientUrlsInfo,
  CommonResult,
  CommonUrlsInfo,
  createHttpRequest,
  DpskPassphrase,
  EventMeta,
  getClientHealthClass,
  Guest,
  onSocketActivityChanged,
  RequestPayload,
  showActivityMessage,
  TableResult,
  transformByte,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { convertEpochToRelativeTime, formatter } from '@acx-ui/utils'

export const baseClientApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'clientApi',
  refetchOnMountOrArgChange: true,
  tagTypes: ['Client', 'Guest'],
  endpoints: () => ({ })
})

export const clientApi = baseClientApi.injectEndpoints({
  endpoints: (build) => ({
    getClientList: build.query<TableResult<ClientList>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const clientListInfo = {
          ...createHttpRequest(CommonUrlsInfo.getClientList, arg.params),
          body: arg.payload
        }
        const clientListQuery = await fetchWithBQ(clientListInfo)
        const clientList = clientListQuery.data as TableResult<ClientList>

        const clientListMetaInfo = {
          ...createHttpRequest(CommonUrlsInfo.getClientMeta, arg.params),
          body: {
            fields: ['switchSerialNumber', 'venueName', 'apName', 'switchName'],
            filters: {
              id: clientList.data.map(item => item.clientMac)
            }
          }
        }
        const clientListMetaQuery = await fetchWithBQ(clientListMetaInfo)
        const clientListMeta = clientListMetaQuery.data as TableResult<ClientListMeta>

        const aggregatedList = aggregatedClientListData(clientList, clientListMeta)

        return clientListQuery.data
          ? { data: aggregatedList }
          : { error: clientListQuery.error as FetchBaseQueryError }
      }
    }),
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
      providesTags: [{ type: 'Guest', id: 'LIST' }],
      keepUnusedDataFor: 0,
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          showActivityMessage(msg,
            [
              'DisableGuest',
              'EnableGuest'
            ], () => {
              api.dispatch(clientApi.util.invalidateTags([{ type: 'Guest', id: 'LIST' }]))
            })
        })
      }
    }),
    deleteGuests: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientUrlsInfo.deleteGuests, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }]
    }),
    disableGuests: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ClientUrlsInfo.disableGuests, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }]
    }),
    enableGuests: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ClientUrlsInfo.enableGuests, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }]
    }),
    getGuests: build.mutation<{ data: BlobPart }, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientUrlsInfo.getGuests, params)
        return {
          ...req,
          responseHandler: async (response) => {
            response.blob().then(myBlob => {
              const file = new File([myBlob], 'test.csv')

              const link = document.createElement('a')
              link.href = URL.createObjectURL(file)
              link.setAttribute('download', 'test')
              document.body.appendChild(link)
              link.click()
            })
          },
          body: payload,
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json,text/plain,*/*'
          }
        }
      }
    }),
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
    getHistoricalClientList: build.query<TableResult<Client>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const clientDetails = {
          ...createHttpRequest(CommonUrlsInfo.getHistoricalClientList, arg.params),
          body: arg.payload
        }
        const baseDetailsQuery = await fetchWithBQ(clientDetails)
        const baseDetails = baseDetailsQuery.data as TableResult<Client>

        const metaInfo = {
          ...createHttpRequest(CommonUrlsInfo.getEventListMeta, arg.params),
          body: {
            fields: ['networkId', 'venueName', 'apName'],
            filters: { id: baseDetails?.data?.map(d => d.id) }
          }
        }
        const metaListQuery = await fetchWithBQ(metaInfo)
        const metaList = metaListQuery?.data as { data: EventMeta[] }

        return {
          data: {
            ...baseDetails,
            data: baseDetails?.data?.map((item) => {
              return {
                ...item,
                ...metaList?.data?.filter(data => data.id === item.id)?.[0]
              }
            })
          }
        }
      }
    })
  })
})

export const aggregatedClientListData = (clientList: TableResult<ClientList>,
  metaList:TableResult<ClientListMeta>) => {
  const data:ClientList[] = []
  clientList.data.forEach(client => {
    const meta = metaList?.data?.find(
      i => i.clientMac === client.clientMac
    )
    const tmp = {
      ...client,
      ...meta,
      healthClass: getClientHealthClass(client.healthCheckStatus),
      totalTraffic: transformByte(client.totalTraffic),
      trafficToClient: transformByte(client.trafficToClient),
      trafficFromClient: transformByte(client.trafficFromClient)
    }
    if (tmp.sessStartTime && tmp.sessStartTime > 0 && !tmp.sessStartTimeParssed) {
      tmp.sessStartTimeString =
      formatter('longDurationFormat')(convertEpochToRelativeTime(client.sessStartTime))
      tmp.sessStartTimeParssed = true
    }
    data.push(tmp)
  })

  return {
    ...clientList,
    data
  }
}
export const {
  useGetClientDetailsQuery,
  useLazyGetClientDetailsQuery,
  useGetDpskPassphraseByQueryQuery,
  useLazyGetDpskPassphraseByQueryQuery,
  useGetHistoricalClientListQuery,
  useLazyGetHistoricalClientListQuery,
  useGetClientListQuery,
  useGetGuestsListQuery,
  useGetGuestsMutation,
  useDeleteGuestsMutation,
  useEnableGuestsMutation,
  useDisableGuestsMutation
} = clientApi
