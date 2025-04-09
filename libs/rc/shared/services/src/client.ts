import { QueryReturnValue, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'
import { cloneDeep }                                                 from 'lodash'

import { convertEpochToRelativeTime, convertToRelativeTime, formatter } from '@acx-ui/formatter'
import {
  Client,
  ClientList,
  ClientListMeta,
  ClientUrlsInfo,
  CommonResult,
  CommonUrlsInfo,
  EventMeta,
  getClientHealthClass,
  Guest,
  Network,
  onSocketActivityChanged,
  onActivityMessageReceived,
  TableResult,
  downloadFile,
  transformByte,
  RequestFormData,
  ClientStatusEnum,
  UEDetail,
  ApiVersionEnum,
  GetApiVersionHeader,
  CommonRbacUrlsInfo,
  ClientInfo,
  SwitchRbacUrlsInfo,
  SwitchClient,
  SwitchInformation,
  WiredClientInfo
} from '@acx-ui/rc/utils'
import { baseClientApi }                       from '@acx-ui/store'
import { RequestPayload }                      from '@acx-ui/types'
import { createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

import { isPayloadHasField, latestTimeFilter } from './utils'

const historicalPayload = {
  fields: ['clientMac', 'clientIP', 'userId', 'username', 'userName', 'hostname', 'venueId',
    'serialNumber', 'networkId', 'disconnectTime', 'ssid', 'osType',
    'sessionDuration', 'venueName', 'apName', 'bssid'],
  sortField: 'event_datetime',
  searchTargetFields: ['clientMac'],
  page: 1,
  pageSize: 10
}

const defaultRbacClientPayload = {
  searchString: '',
  searchTargetFields: ['macAddress'],
  filters: {},
  fields: [
    'modelName', 'deviceType', 'macAddress', 'osType',
    'ipAddress', 'username', 'hostname', 'connectedTime',
    'venueInformation', 'apInformation', 'networkInformation', 'switchInformation',
    'signalStatus', 'radioStatus', 'trafficStatus', 'authenticationStatus'
  ],
  page: 1,
  pageSize: 10000
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
    // RBAC API
    getClients: build.query<TableResult<ClientInfo>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { params, payload } = arg
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const clientListInfo = {
          ...createHttpRequest(ClientUrlsInfo.getClients, params, apiCustomHeader),
          body: JSON.stringify(payload)
        }
        const clientListQuery = await fetchWithBQ(clientListInfo)
        const clientList = clientListQuery.data as TableResult<ClientInfo>

        const apMacSwitchMap = new Map<string, SwitchInformation>()

        const needSwitchData = isPayloadHasField(payload, 'switchInformation')
        if (needSwitchData && clientList.totalCount > 0) {
          const unqueClientApMacs: Set<string> = new Set()
          clientList.data.forEach((clientInfo) => {
            unqueClientApMacs.add(clientInfo.apInformation.macAddress)
          })
          const switchClientMacs: string[] = Array.from(unqueClientApMacs)
          const switchApiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
          const switchClientPayload = {
            fields: ['clientMac', 'switchId', 'switchName', 'switchSerialNumber'],
            page: 1,
            pageSize: 10000,
            filters: { clientMac: switchClientMacs }
          }
          const switchClistInfo = {
            ...createHttpRequest(SwitchRbacUrlsInfo.getSwitchClientList, {}, switchApiCustomHeader),
            body: JSON.stringify(switchClientPayload)
          }
          const switchClientsQuery = await fetchWithBQ(switchClistInfo)
          const switchClients = switchClientsQuery.data as TableResult<SwitchClient>

          switchClients?.data?.forEach((switchInfo) => {
            const { clientMac, switchId, switchName, switchSerialNumber } = switchInfo
            apMacSwitchMap.set(clientMac, {
              id: switchId,
              name: switchName,
              serialNumber: switchSerialNumber
            })
          })
        }

        const aggregatedList = aggregatedRbacClientListData(clientList, apMacSwitchMap)

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
          ...createHttpRequest(CommonRbacUrlsInfo.getGuestsList,
            arg.params,
            GetApiVersionHeader(ApiVersionEnum.v1_1)),
          body: JSON.stringify({ ...body, filters, fields })
        })
        const guestsList = guestsListQuery.data as TableResult<Guest>
        const guestIdWithMacMaps: Map<string, string[]> = new Map()
        const uniqueDeviceMacs: Set<string> = new Set()
        const apMacSwitchMap = new Map<string, SwitchInformation>()

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
        const clientPayload = { ...defaultRbacClientPayload, filter }
        const clientListQuery = await fetchWithBQ({
          ...createHttpRequest(ClientUrlsInfo.getClients,
            arg.params,
            GetApiVersionHeader(ApiVersionEnum.v1)),
          body: JSON.stringify(clientPayload)
        })
        const clientList = clientListQuery.data as TableResult<ClientInfo>
        // retireve switch infomation
        if (clientList.totalCount > 0) {
          const unqueClientApMacs: Set<string> = new Set()
          clientList.data.forEach((clientInfo) => {
            unqueClientApMacs.add(clientInfo.apInformation.macAddress)
          })
          const switchClientMacs: string[] = Array.from(unqueClientApMacs)
          const switchApiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
          const switchClientPayload = {
            fields: ['clientMac', 'switchId', 'switchName', 'switchSerialNumber'],
            page: 1,
            pageSize: 10000,
            filters: { clientMac: switchClientMacs }
          }
          const switchClistInfo = {
            ...createHttpRequest(SwitchRbacUrlsInfo.getSwitchClientList, {}, switchApiCustomHeader),
            body: JSON.stringify(switchClientPayload)
          }
          const switchClientsQuery = await fetchWithBQ(switchClistInfo)
          const switchClients = switchClientsQuery.data as TableResult<SwitchClient>

          switchClients?.data?.forEach((switchInfo) => {
            const { clientMac, switchId, switchName, switchSerialNumber } = switchInfo
            apMacSwitchMap.set(clientMac, {
              id: switchId,
              name: switchName,
              serialNumber: switchSerialNumber
            })
          })
        }

        const aggregatedRbacClientList = aggregatedRbacClientListData(clientList, apMacSwitchMap)

        const aggregatedList = aggregatedGuestClientData(
          guestsList, guestIdWithMacMaps, aggregatedRbacClientList.data)

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
        return createHttpRequest(ClientUrlsInfo.deleteGuest,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1))
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }]
    }),
    disableGuests: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientUrlsInfo.disableGuests,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1))
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }]
    }),
    enableGuests: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientUrlsInfo.enableGuests,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1))
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }]
    }),
    validateGuestPasswordByGuestId: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientUrlsInfo.enableGuests,
          params,
          { ...GetApiVersionHeader(ApiVersionEnum.v1),
            ...ignoreErrorModal
          })
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }]
    }),
    validateGuestPassword: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientUrlsInfo.validateGuestPassword,
          params,
          { ...GetApiVersionHeader(ApiVersionEnum.v1),
            ...ignoreErrorModal
          })
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
        const req = createHttpRequest(ClientUrlsInfo.generateGuestPassword,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1))
        return {
          ...req,
          body: JSON.stringify(payload)
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
            body: latestTimeFilter(arg.payload)
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
        const req = createHttpRequest(CommonRbacUrlsInfo.addGuestPass,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1))
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }]
    }),
    getGuestNetworkList: build.query<TableResult<Network>, RequestPayload>({
      query: ({ params, payload }) => {
        const networkListReq = createHttpRequest(CommonRbacUrlsInfo.getWifiNetworksList, params)
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
          ...GetApiVersionHeader(ApiVersionEnum.v1),
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
          return disconnectQuery as
            QueryReturnValue<CommonResult, FetchBaseQueryError, FetchBaseQueryMeta | undefined>
        }
        return { data: 'done' }
      }
    }),
    getApWiredClients: build.query<TableResult<WiredClientInfo>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { params, payload } = arg
        const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
        const wiredClientListInfo = {
          ...createHttpRequest(ClientUrlsInfo.getApWiredClients, params, apiCustomHeader),
          body: JSON.stringify(payload)
        }
        const wiredClientListQuery = await fetchWithBQ(wiredClientListInfo)
        const wiredClientList = wiredClientListQuery.data as TableResult<WiredClientInfo>
        const aggregatedList = aggregatedApWiredClientListData(wiredClientList)

        return wiredClientListQuery.data
          ? { data: aggregatedList }
          : { error: wiredClientListQuery.error as FetchBaseQueryError }

      },
      providesTags: [{ type: 'WiredClient', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
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

export const aggregatedRbacClientListData = (clientList: TableResult<ClientInfo>,
  apSwitchInfoMap:Map<string, SwitchInformation>) => {
  const data:ClientInfo[] = []

  clientList?.data.forEach(client => {
    const apMac = client.apInformation?.macAddress ?? ''
    const switchInformation = apSwitchInfoMap.get(apMac)

    const trafficStatus = client.trafficStatus? {
      ...client.trafficStatus,
      totalTraffic: transformByte(client.trafficStatus.totalTraffic),
      trafficToClient: transformByte(client.trafficStatus.trafficToClient),
      trafficFromClient: transformByte(client.trafficStatus.trafficFromClient)
    } : undefined

    const tmp = {
      ...client,
      switchInformation: cloneDeep(switchInformation),
      ...(trafficStatus && { trafficStatus: trafficStatus }),
      macAddress: client.macAddress.toLowerCase()
    }

    if (tmp.connectedTime && !tmp.connectedTimeParssed) {
      tmp.connectedTimeString =
        formatter('longDurationFormat')(convertToRelativeTime(client.connectedTime))
      tmp.connectedTimeParssed = true
    }

    data.push(tmp)
  })

  return {
    ...clientList,
    data
  }
}

export const aggregatedGuestClientData = (guestsListResult: TableResult<Guest>,
  guestIdWithMacMaps: Map<string, string[]>, clientList:ClientInfo[]) => {

  const guestIdWithClientMaps: Map<string, ClientInfo[]> = new Map()

  guestIdWithMacMaps.forEach((macs: string[], guestId: string) => {
    const matchingClients = clientList
      .filter(client => macs.includes(client.macAddress))
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

export const aggregatedApWiredClientListData = (wiredClientList: TableResult<WiredClientInfo>) => {
  const data: WiredClientInfo[] = []

  wiredClientList?.data.forEach(client => {
    const tmp = {
      ...client,
      macAddress: client.macAddress.toLowerCase()
    }

    if (tmp.connectedTime && !tmp.connectedTimeParssed) {
      tmp.connectedTimeString =
        formatter('longDurationFormat')(convertToRelativeTime(client.connectedTime))
      tmp.connectedTimeParssed = true
    }

    data.push(tmp)
  })

  return {
    ...wiredClientList,
    data
  }
}


export const {
  useGetClientListQuery,
  useLazyGetClientListQuery,
  useGetClientsQuery,
  useLazyGetClientsQuery,
  useGetGuestsListQuery,
  useDisconnectClientMutation,
  useRevokeClientMutation,
  useLazyGetGuestsListQuery,
  useAddGuestPassMutation,
  useLazyGetGuestNetworkListQuery,
  useGetHistoricalClientListQuery,
  useLazyGetHistoricalClientListQuery,
  useGetGuestsMutation,
  useDeleteGuestMutation,
  useEnableGuestsMutation,
  useValidateGuestPasswordMutation,
  useValidateGuestPasswordByGuestIdMutation,
  useDisableGuestsMutation,
  useGenerateGuestPasswordMutation,
  useImportGuestPassMutation,
  useGetClientOrHistoryDetailQuery,
  useGetClientUEDetailQuery,
  useGetUEDetailAndDisconnectMutation,
  useGetApWiredClientsQuery
} = clientApi
