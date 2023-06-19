import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'

import { convertEpochToRelativeTime, formatter } from '@acx-ui/formatter'
import {
  Client,
  ClientList,
  ClientListMeta,
  ClientStatistic,
  ClientUrlsInfo,
  CommonResult,
  CommonUrlsInfo,
  DpskPassphrase,
  EventMeta,
  getClientHealthClass,
  Guest,
  Network,
  onSocketActivityChanged,
  onActivityMessageReceived,
  TableResult,
  downloadFile,
  transformByte,
  WifiUrlsInfo,
  RequestFormData, enableNewApi
} from '@acx-ui/rc/utils'
import { baseClientApi }     from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

import { latestTimeFilter } from './utils'

export const clientApi = baseClientApi.injectEndpoints({
  endpoints: (build) => ({
    getClientList: build.query<TableResult<ClientList>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const clientListInfo = {
          ...createHttpRequest(ClientUrlsInfo.getClientList, arg.params),
          body: arg.payload
        }
        const clientListQuery = await fetchWithBQ(clientListInfo)
        const clientList = clientListQuery.data as TableResult<ClientList>

        const clientListMetaInfo = {
          ...createHttpRequest(ClientUrlsInfo.getClientMeta, arg.params),
          body: {
            fields: ['switchId', 'switchSerialNumber', 'venueName', 'apName', 'switchName'],
            filters: {
              id: clientList?.data.map(item => item.clientMac)
            }
          }
        }
        const clientListMetaQuery = await fetchWithBQ(clientListMetaInfo)
        const clientListMeta = clientListMetaQuery.data as TableResult<ClientListMeta>

        const aggregatedList = aggregatedClientListData(clientList, clientListMeta)

        return clientListQuery.data
          ? { data: aggregatedList }
          : { error: clientListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Client', id: 'LIST' }]
    }),
    disconnectClient: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientUrlsInfo.disconnectClient, params)
        if (enableNewApi(ClientUrlsInfo.disconnectClient)) {
          payload = {
            action: 'disconnect',
            clients: payload
          }
        }
        return {
          ...req,
          body: payload
        }
      }
    }),
    getGuestsList: build.query<TableResult<Guest>, RequestPayload>({
      query: ({ params, payload }) => {
        const body = latestTimeFilter(payload)
        const filters = body.filters?.fromTime && body.filters?.toTime
          ? {
            ...body.filters,
            fromTime: [body.filters.fromTime],
            toTime: [body.filters.toTime]
          }
          : body.filters
        return {
          ...createHttpRequest(CommonUrlsInfo.getGuestsList, params),
          body: { ...body, filters }
        }
      },
      providesTags: [{ type: 'Guest', id: 'LIST' }],
      keepUnusedDataFor: 0,
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg,
            [
              'RegeneratePass',
              'DisableGuest',
              'EnableGuest',
              'AddGuest',
              'DeleteGuest'
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
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientUrlsInfo.disableGuests, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }]
    }),
    enableGuests: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientUrlsInfo.enableGuests, params)
        return {
          ...req,
          body: payload
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
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent ? JSON.parse(
              headerContent.split('filename=')[1]) : 'Guests Information.csv'
            downloadFile(response, fileName)
          },
          body: payload,
          headers: {
            ...req.headers,
            Accept: 'application/json,text/plain,*/*'
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
    generateGuestPassword: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientUrlsInfo.generateGuestPassword, params)
        return {
          ...req,
          body: payload
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

        let clientDetails = {
          url: '',
          method: 'post',
          body: arg.payload as unknown
        }
        try {
          clientDetails = {
            ...createHttpRequest(CommonUrlsInfo.getHistoricalClientList, arg.params),
            body: arg.payload
          }
        } catch(e) {
          // eslint-disable-next-line no-console
          console.error(e)
        }
        const baseDetailsQuery = await fetchWithBQ(clientDetails)
        const baseDetails = baseDetailsQuery.data as TableResult<Client>
        let metaInfo = {
          url: '',
          method: 'post',
          body: arg.payload as unknown
        }
        try {
          metaInfo = {
            ...createHttpRequest(CommonUrlsInfo.getEventListMeta, arg.params),
            body: {
              fields: ['networkId', 'venueName', 'apName'],
              filters: { id: baseDetails?.data?.map(d => d.id) }
            }
          }
        } catch(e) {
          // eslint-disable-next-line no-console
          console.error(e)
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
      },
      providesTags: [{ type: 'HistoricalClient', id: 'LIST' }]
    }),
    getHistoricalStatisticsReports: build.query<ClientStatistic, RequestPayload>({
      query: ({ params, payload }) => ({
        ...createHttpRequest(CommonUrlsInfo.getHistoricalStatisticsReportsV2, params),
        body: latestTimeFilter(payload)
      })
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
      },
      providesTags: [{ type: 'Guest', id: 'LIST' }]
    }),
    importGuestPass: build.mutation<{}, RequestFormData>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientUrlsInfo.importGuestPass, params, {
          'Content-Type': undefined,
          'Accept': '*/*'
        })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }]
    })
  })
})

export const aggregatedClientListData = (clientList: TableResult<ClientList>,
  metaList:TableResult<ClientListMeta>) => {
  const data:ClientList[] = []
  clientList?.data.forEach(client => {
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
  useGetGuestsListQuery,
  useDisconnectClientMutation,
  useLazyGetGuestsListQuery,
  useAddGuestPassMutation,
  useLazyGetGuestNetworkListQuery,
  useGetClientDetailsQuery,
  useLazyGetClientDetailsQuery,
  useGetDpskPassphraseByQueryQuery,
  useLazyGetDpskPassphraseByQueryQuery,
  useGetHistoricalClientListQuery,
  useLazyGetHistoricalClientListQuery,
  useGetClientListQuery,
  useLazyGetClientListQuery,
  useGetGuestsMutation,
  useDeleteGuestsMutation,
  useEnableGuestsMutation,
  useDisableGuestsMutation,
  useGenerateGuestPasswordMutation,
  useGetHistoricalStatisticsReportsQuery,
  useLazyGetHistoricalStatisticsReportsQuery,
  useImportGuestPassMutation
} = clientApi
