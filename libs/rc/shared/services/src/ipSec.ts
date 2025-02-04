
import _ from 'lodash'

import {
  Ipsec,
  TableResult,
  IpsecViewData,
  onSocketActivityChanged,
  onActivityMessageReceived,
  IpsecUrls,
  VenueTableUsageByIpsec,
  VenueTableIpsecActivation,
  CommonUrlsInfo,
  Network,
  CommonRbacUrlsInfo,
  NewAPModel,
  VenueDetail
} from '@acx-ui/rc/utils'
import { baseIpSecApi }      from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { CommonResult }      from '@acx-ui/user'
import { createHttpRequest } from '@acx-ui/utils'



export const ipSecApi = baseIpSecApi.injectEndpoints({
  endpoints: (build) => ({
    createIpsec: build.mutation<CommonResult, RequestPayload<Ipsec>>({
      query: ({ payload }) => {
        const req = createHttpRequest(IpsecUrls.createIpsec)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'IpSec', id: 'LIST' }, { type: 'IpSec', id: 'Options' }]
    }),
    getIpsecViewDataList: build.query<TableResult<IpsecViewData>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(IpsecUrls.getIpsecViewDataList)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'IpSec', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddIpsecProfile',
            'UpdateIpsecProfile',
            'DeleteIpsecProfile',
            'ActivateIpsecProfileOnVenueWifiNetwork',
            'DeactivateIpsecProfileOnVenueWifiNetwork'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(
              ipSecApi.util.invalidateTags([
                { type: 'IpSec', id: 'LIST' },
                { type: 'IpSec', id: 'Options' }
              ])
            )
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    deleteIpsec: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(IpsecUrls.deleteIpsec, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'IpSec', id: 'LIST' }]
    }),
    getIpsecById: build.query<Ipsec, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(IpsecUrls.getIpsec, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'IpSec', id: 'DETAIL' }]
    }),
    updateIpsec: build.mutation<CommonResult, RequestPayload<Ipsec>>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(IpsecUrls.updateIpsec, params)
        return {
          ...req,
          body: JSON.stringify(_.omit(payload, ['activations']))
        }
      },
      invalidatesTags: [{ type: 'IpSec', id: 'LIST' }]
    }),
    getVenuesIpsecPolicy: build.query<TableResult<VenueTableUsageByIpsec>, RequestPayload>({
      queryFn: async ( { payload }, _api, _extraOptions, fetchWithBQ) => {
        const activations =
          _.get(payload,'activations') as Record<string, VenueTableIpsecActivation>
        const emptyResponse = { data: { totalCount: 0 } as TableResult<VenueTableUsageByIpsec> }
        const venueNetworksMap:{ [key:string]: string[] } = {}
        let networkIds: string[] = []

        const apNameMap:{ [key:string]: string[] } = {}
        let apSerialNumbers: string[] = []

        Object.entries(activations).forEach(([venueId, activation]) => {
          if (activation) {
            venueNetworksMap[venueId] = Array.from(activation.wifiNetworkIds)
            networkIds = networkIds.concat(Array.from(activation.wifiNetworkIds))

            apNameMap[venueId] = Array.from(activation.apSerialNumbers)
            apSerialNumbers = apSerialNumbers.concat(Array.from(activation.apSerialNumbers))
          }
        })

        if(networkIds.length === 0 && apSerialNumbers.length === 0) return emptyResponse

        // Collect network names by ids
        const networkIdsSet = Array.from(new Set(networkIds))
        let networkMapping:{ [key:string]: string } = {}
        if(networkIdsSet.length > 0){
          const networkQueryPayload = {
            fields: ['name', 'id'],
            filters: { id: networkIdsSet },
            page: 1,
            pageSize: 10_000
          }
          const networkReq = createHttpRequest(CommonUrlsInfo.getWifiNetworksList)
          // eslint-disable-next-line max-len
          const networkRes = await fetchWithBQ({ ...networkReq, body: JSON.stringify(networkQueryPayload) })
          const { data: networkData } = networkRes.data as TableResult<Network>

          networkData?.forEach((network: Network) => {
            networkMapping[network.id] = network.name
          })
        }

        // Collect AP names by serial numbers
        let apMapping:{ [key:string]: string } = {}
        const apSerialNumbersSet = Array.from(new Set(apSerialNumbers))
        if(apSerialNumbersSet.length > 0){
          const apsQueryPayload = {
            fields: ['name', 'serialNumber'],
            filters: { serialNumber: apSerialNumbers },
            pageSize: 10000
          }
          const apsReq = createHttpRequest(CommonRbacUrlsInfo.getApsList)
          const apsRes = await fetchWithBQ({ ...apsReq, body: JSON.stringify(apsQueryPayload) })
          const { data: apsData } = apsRes.data as TableResult<NewAPModel>

          apsData.forEach((ap: NewAPModel) => {
            if (ap.name) {
              apMapping[ap.serialNumber] = ap.name
            }
          })
        }

        // Collect softgre names by ids
        let softGreProfileMap:{ [key:string]: string } = {}

        const venueIds = Object.keys(venueNetworksMap)
        const venueQueryPayload = {
          ...(_.omit(payload as RequestPayload, ['activations'])),
          filters: { id: venueIds }
        }
        const venueReq = createHttpRequest(CommonUrlsInfo.getVenuesList)
        const venueRes = await fetchWithBQ({ ...venueReq, body: JSON.stringify(venueQueryPayload) })
        if (venueRes.error) return emptyResponse
        const { data: venueData } = venueRes?.data as TableResult<VenueDetail>

        const venueResult = venueData?.map(venue =>{
          const wifiNetworkIDs = venueNetworksMap[venue.id]
          const wifiNetworkNames = wifiNetworkIDs.map(id => (networkMapping[id]))
          const apSerialNumbers = apNameMap[venue.id]
          const apNames = apSerialNumbers.map(id => (apMapping[id]))
          const softGreProfileId = ''
          const softGreProfileName = softGreProfileMap[softGreProfileId]
          return {
            ...venue,
            wifiNetworkIds: wifiNetworkIDs, wifiNetworkNames,
            apSerialNumbers, apNames,
            softGreProfileId, softGreProfileName
          } as unknown as VenueTableUsageByIpsec
        })

        const result = {
          data: venueResult,
          page: 1,
          totalCount: venueResult.length
        } as TableResult<VenueTableUsageByIpsec>
        return { data: result }
      },
      providesTags: [{ type: 'IpSec', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    })
  })
})

export const {
  useCreateIpsecMutation,
  useGetIpsecViewDataListQuery,
  useLazyGetIpsecViewDataListQuery,
  useDeleteIpsecMutation,
  useGetIpsecByIdQuery,
  useUpdateIpsecMutation,
  useGetVenuesIpsecPolicyQuery
} = ipSecApi