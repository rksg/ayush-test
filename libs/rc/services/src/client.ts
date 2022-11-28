import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'

import {
  ClientList,
  ClientListMeta,
  CommonUrlsInfo,
  createHttpRequest,
  getClientHealthClass,
  getDeviceTypeIcon,
  getOsTypeIcon,
  RequestPayload,
  TableResult,
  transformByte
} from '@acx-ui/rc/utils'
import { convertEpochToRelativeTime, formatter } from '@acx-ui/utils'

export const baseClientApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'clientApi',
  refetchOnMountOrArgChange: true,
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
      deviceTypeIcon: getDeviceTypeIcon(client.deviceTypeStr),
      // osTypeIcon: getOsTypeIcon(client.osType),
      healthClass: getClientHealthClass(client.healthCheckStatus),
      totalTraffic: transformByte(client.totalTraffic),
      trafficToClient: transformByte(client.trafficToClient),
      trafficFromClient: transformByte(client.trafficFromClient)
    }
    if (tmp.sessStartTime && tmp.sessStartTime > 0 && !tmp.sessStartTimeParssed) {
      tmp.sessStartTimeString = formatter('longDurationFormat')(convertEpochToRelativeTime(client.sessStartTime))
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
  useGetClientListQuery
} = clientApi
