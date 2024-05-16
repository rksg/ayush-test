import { QueryReturnValue }    from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'

import { convertEpochToRelativeTime, formatter } from '@acx-ui/formatter'
import {
  Client,
  ClientList,
  ClientListMeta,
  ClientUrlsInfo,
  CommonResult,
  CommonUrlsInfo,
  DpskPassphrase,
  EventMeta,
  getClientHealthClass,
  Guest,
  GuestClient,
  Network,
  onSocketActivityChanged,
  onActivityMessageReceived,
  TableResult,
  downloadFile,
  transformByte,
  WifiUrlsInfo,
  RequestFormData,
  ClientStatusEnum,
  UEDetail
} from '@acx-ui/rc/utils'
import { baseClientApi }                       from '@acx-ui/store'
import { RequestPayload }                      from '@acx-ui/types'
import { createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

import { latestTimeFilter } from './utils'

const historicalPayload = {
  fields: ['clientMac', 'clientIP', 'userId', 'username', 'userName', 'hostname', 'venueId',
    'serialNumber', 'networkId', 'disconnectTime', 'ssid', 'osType',
    'sessionDuration', 'venueName', 'apName', 'bssid'],
  sortField: 'event_datetime',
  searchTargetFields: ['clientMac'],
  page: 1,
  pageSize: 10
}

const defaultClientPayload = {
  searchString: '',
  searchTargetFields: ['clientMac'],
  fields: ['apMac','ssid','clientMac','connectSince','healthCheckStatus','hostname','ipAddress',
    'networkId','networkType','noiseFloor_dBm','osType','radioChannel','receiveSignalStrength_dBm',
    'rxBytes','rxPackets','serialNumber','snr_dB','ssid','txBytes','txDropDataPacket','txPackets',
    'username','venueId','vlan','vni'],
  page: 1,
  pageSize: 10000
}

const defaultVenuePayload = {
  searchString: '',
  searchTargetFields: ['name'],
  fields: ['id', 'name'],
  page: 1,
  pageSize: 10000
}

const v1Header = {
  'Content-Type': 'application/vnd.ruckus.v1+json',
  'Accept': 'application/vnd.ruckus.v1+json'
}

const v1_1Header = {
  'Content-Type': 'application/vnd.ruckus.v1.1+json',
  'Accept': 'application/vnd.ruckus.v1.1+json'
}


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
      providesTags: [{ type: 'Client', id: 'LIST' }],
      extraOptions: { maxRetries: 5 },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'PatchApClient'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(clientApi.util.invalidateTags([{ type: 'Client', id: 'LIST' }]))
          })
        })
      }
    }),
    disconnectClient: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientUrlsInfo.disconnectClient, params)
        payload = {
          status: 'DISCONNECTED'
        }
        return {
          ...req,
          body: payload
        }
      }
    }),
    revokeClient: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientUrlsInfo.disconnectClient, params)
        payload = {
          status: 'REVOKED'
        }
        return {
          ...req,
          body: payload
        }
      }
    }),
    getGuestsList: build.query<TableResult<Guest>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const body = latestTimeFilter(arg.payload)
        const filters = body.filters?.fromTime && body.filters?.toTime
          ? {
            ...body.filters,
            fromTime: [body.filters.fromTime],
            toTime: [body.filters.toTime]
          }
          : body.filters

        const fields = [ ...(arg.payload as { fields: string[] }).fields, 'devicesMac' ]
        const guestsListQuery = await fetchWithBQ({
          ...createHttpRequest(CommonUrlsInfo.getGuestsList, arg.params, v1_1Header),
          body: JSON.stringify({ ...body, filters, fields })
        })
        const guestsList = guestsListQuery.data as TableResult<Guest>
        const guestIdWithMacMaps: Map<string, string[]> = new Map()
        const uniqueDeviceMacs: Set<string> = new Set()
        const uniqueVenueIds: Set<string> = new Set()
        guestsList?.data?.filter(g =>
          g.guestStatus?.indexOf('Online') > -1 &&
          g.devicesMac && g.devicesMac.length > 0)
          .forEach(g => {
            const devicesMacs = g.devicesMac?.map((mac:string) => mac.toLowerCase()) ?? []
            guestIdWithMacMaps.set(g.id, devicesMacs)
            devicesMacs.forEach(mac => {
              uniqueDeviceMacs.add(mac)
            })
          })
        const distinctMacs: string[] = Array.from(uniqueDeviceMacs)
        // no online client
        if (distinctMacs && distinctMacs.length === 0) {
          return { data: guestsList }
        }
        // aggregated online clients
        const filter = { clientMac: distinctMacs }
        const clientPayload = { ...defaultClientPayload, filter }
        const clientListQuery = await fetchWithBQ({
          ...createHttpRequest(ClientUrlsInfo.getClientList, arg.params, v1Header),
          body: JSON.stringify(clientPayload)
        })
        const clientList = clientListQuery.data as TableResult<GuestClient>
        // retireve venueName
        const clientData = clientList.data as GuestClient[]
        clientData.forEach(client => {
          uniqueVenueIds.add(client.venueId)
        })
        const venuePayload = { ...defaultVenuePayload,
          filters: { id: Array.from(uniqueVenueIds) }
        }
        const venueListQuery = await fetchWithBQ({
          ...createHttpRequest(CommonUrlsInfo.getVenues, arg.params, v1Header),
          body: JSON.stringify(venuePayload)
        })
        const venueList = venueListQuery.data as TableResult<{ id:string, name:string }>
        const venueMap = new Map(venueList.data.map(venue => [venue.id, venue.name]))
        const clientResult = clientData.map(client => {
          client.venueName = venueMap.get(client.venueId) ?? ''
          return client
        })
        const aggregatedList = aggregatedGuestClientData(
          guestsList, guestIdWithMacMaps, clientResult)

        return guestsListQuery.data
          ? { data: aggregatedList }
          : { error: guestsListQuery.error as FetchBaseQueryError }
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
              'DeleteGuest',
              'DeleteBulk',
              'ImportGuests'
            ], () => {
              api.dispatch(clientApi.util.invalidateTags([{ type: 'Guest', id: 'LIST' }]))
            })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    deleteGuest: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(ClientUrlsInfo.deleteGuest, params, v1Header)
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }]
    }),
    disableGuests: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientUrlsInfo.disableGuests, params, v1Header)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }]
    }),
    enableGuests: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientUrlsInfo.enableGuests, params, v1Header)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }]
    }),
    getGuests: build.mutation<{ data: BlobPart }, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientUrlsInfo.getGuests, params, {
          'Accept': 'text/vnd.ruckus.v1.1+csv',
          'Content-Type': 'application/vnd.ruckus.v1.1+json'
        })
        return {
          ...req,
          responseHandler: async (response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent ? JSON.parse(
              headerContent.split('filename=')[1]) : 'Guests Information.csv'
            downloadFile(response, fileName)
          },
          body: JSON.stringify(payload),
          headers: {
            ...req.headers
          }
        }
      }
    }),
    generateGuestPassword: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientUrlsInfo.generateGuestPassword, params, v1Header)
        return {
          ...req,
          body: JSON.stringify(payload)
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
      providesTags: [{ type: 'HistoricalClient', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    addGuestPass: build.mutation<Guest, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.addGuestPass, params, v1Header)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }]
    }),
    getGuestNetworkList: build.query<TableResult<Network>, RequestPayload>({
      query: ({ params, payload }) => {
        const networkListReq = createHttpRequest(CommonUrlsInfo.getWifiNetworksList, params)
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
          ...v1Header,
          'Content-Type': undefined
        })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }]
    }),
    getClientOrHistoryDetail: build.query<{ data: Client, isHistorical: boolean }, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { status, clientId, ...params } = arg.params as Record<string, string>

        if(status !== ClientStatusEnum.HISTORICAL) {
          const clientDetail = (await fetchWithBQ({
            ...createHttpRequest(
              ClientUrlsInfo.getClientDetails, arg.params, { ...ignoreErrorModal })
          }))?.data as Client
          if(clientDetail) { return { data: { data: clientDetail, isHistorical: false } } }
        }

        const historicalClientList = (await fetchWithBQ({
          ...createHttpRequest(
            CommonUrlsInfo.getHistoricalClientList, params),
          body: { ...historicalPayload, searchString: clientId }
        }))?.data as TableResult<Client>

        const metaList = (await fetchWithBQ({
          ...createHttpRequest(
            CommonUrlsInfo.getEventListMeta, params),
          body: {
            fields: ['networkId', 'venueName', 'apName'],
            filters: { id: historicalClientList?.data?.map(d => d.id) }
          }
        }))?.data as { data: EventMeta[] }

        return { data: {
          data: (historicalClientList?.totalCount > 0
            ? historicalClientList?.data?.map((item) => {
              return {
                ...item,
                ...metaList?.data?.filter(data => data.id === item.id)?.[0]
              }
            })[0]
            : {}
          ) as Client,
          isHistorical: true
        } }
      },
      providesTags: [{ type: 'HistoricalClient', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getClientUEDetail: build.query<UEDetail, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ClientUrlsInfo.getClientUEDetail, params)
        return {
          ...req
        }
      }
    }),
    getUEDetailAndDisconnect: build.mutation<CommonResult | 'done', RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ){
        let serialNumber = arg.params?.serialNumber
        if(!serialNumber) {
          const ueDetailRequest = createHttpRequest(ClientUrlsInfo.getClientUEDetail, {
            clientMacAddress: arg.params?.clientMacAddress
          })
          const ueDetailQuery = await fetchWithBQ(ueDetailRequest)
          const result = ueDetailQuery?.data as UEDetail
          serialNumber = result.apSerialNumber
        }
        if(serialNumber){
          const disconnectRequest = createHttpRequest(ClientUrlsInfo.disconnectClient, {
            venueId: arg.params?.venueId,
            serialNumber: serialNumber,
            clientMacAddress: arg.params?.clientMacAddress
          })
          const disconnectQuery = await fetchWithBQ({
            ...disconnectRequest,
            body: arg.payload
          })
          return disconnectQuery as QueryReturnValue<CommonResult, FetchBaseQueryError>
        }
        return { data: 'done' }
      }
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
      trafficFromClient: transformByte(client.trafficFromClient),
      clientMac: client.clientMac.toLowerCase()
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

export const aggregatedGuestClientData = (guestsListResult: TableResult<Guest>,
  guestIdWithMacMaps: Map<string, string[]>, clientList:GuestClient[]) => {
  const guestIdWithClientMaps: Map<string, GuestClient[]> = new Map()
  guestIdWithMacMaps.forEach((macs: string[], guestId: string) => {
    const matchingClients = clientList
      .filter(client => macs.includes(client.clientMac.toLowerCase()))
    if (matchingClients.length > 0) {
      guestIdWithClientMaps.set(guestId, matchingClients)
    }
  })
  const guestsList = guestsListResult.data
  guestsList.forEach((guest: Guest) => {
    if (guestIdWithClientMaps.has(guest.id)) {
      guest.clients = guestIdWithClientMaps.get(guest.id)!
    }
  })

  return { ...guestsListResult, data: guestsList }
}


export const {
  useGetGuestsListQuery,
  useDisconnectClientMutation,
  useRevokeClientMutation,
  useLazyGetGuestsListQuery,
  useAddGuestPassMutation,
  useLazyGetGuestNetworkListQuery,
  useGetDpskPassphraseByQueryQuery,
  useLazyGetDpskPassphraseByQueryQuery,
  useGetHistoricalClientListQuery,
  useLazyGetHistoricalClientListQuery,
  useGetClientListQuery,
  useLazyGetClientListQuery,
  useGetGuestsMutation,
  useDeleteGuestMutation,
  useEnableGuestsMutation,
  useDisableGuestsMutation,
  useGenerateGuestPasswordMutation,
  useImportGuestPassMutation,
  useGetClientOrHistoryDetailQuery,
  useGetClientUEDetailQuery,
  useGetUEDetailAndDisconnectMutation
} = clientApi
