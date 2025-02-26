
import { DefaultOptionType } from 'antd/lib/select'
import _, { cloneDeep }      from 'lodash'

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
  VenueDetail,
  IpSecOptionsData,
  IpsecActivation,
  SoftGreUrls,
  SoftGreViewData
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

        const venueSoftGreMap:{ [key:string]: string } = {}
        let softGreIds: string[] = []

        Object.entries(activations).forEach(([venueId, activation]) => {
          if (activation) {
            venueNetworksMap[venueId] = Array.from(activation.wifiNetworkIds)
            networkIds = networkIds.concat(Array.from(activation.wifiNetworkIds))

            apNameMap[venueId] = Array.from(activation.apSerialNumbers)
            apSerialNumbers = apSerialNumbers.concat(Array.from(activation.apSerialNumbers))

            if (activation.softGreProfileId) {
              venueSoftGreMap[venueId] = activation.softGreProfileId
              softGreIds.push(activation.softGreProfileId)
            }
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
        const softGreIdsSet = Array.from(new Set(softGreIds))
        if(softGreIdsSet.length > 0){
          const softGreQueryPayload = {
            fields: ['name', 'id'],
            filters: { id: softGreIdsSet },
            pageSize: 10000
          }
          const softGreReq = createHttpRequest(SoftGreUrls.getSoftGreViewDataList)
          const softGreRes = await fetchWithBQ({ ...softGreReq,
            body: JSON.stringify(softGreQueryPayload) })
          const { data: softGreData } = softGreRes.data as TableResult<SoftGreViewData>
          softGreData?.forEach((softGre: SoftGreViewData) => {
            if (softGre.name) {
              softGreProfileMap[softGre.id] = softGre.name
            }
          })
        }

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
          const softGreProfileId = venueSoftGreMap[venue.id]
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
    }),
    getIpsecOptions: build.query<IpSecOptionsData, RequestPayload>({
      queryFn: async ( { params, payload }, _api, _extraOptions, fetchWithBQ) => {
        const { venueId, networkId } = params as { venueId: string, networkId?: string }
        const activationProfiles:string[] = []

        const ipsecListReq = createHttpRequest(IpsecUrls.getIpsecViewDataList)
        const ipsecListRes = await fetchWithBQ({
          ...ipsecListReq,
          body: JSON.stringify(payload)
        })
        if (ipsecListRes.error) return {
          data: {
            options: [],
            isLockedOptions: true,
            activationProfiles
          } as IpSecOptionsData }

        let { data: listData } = ipsecListRes.data as TableResult<IpsecViewData>

        let venueTotal = 0
        let ipsecProfileId = ''

        const options = listData?.map(item => {
          let isSame = false

          const profileActivations = consolidateActivations(item, venueId)

          profileActivations.forEach(activation => {
            const isEqualVenue = activation.venueId === venueId
            if (isEqualVenue) {
              activationProfiles.push(item.id)
              // let isOnlyAppliedCurrentNetwork = false
              isSame = activation.venueId === venueId
              if (networkId && activation.wifiNetworkIds?.includes(networkId)) {
                ipsecProfileId = item.id
                if (activation.wifiNetworkIds.length === 1) {
                  // isOnlyAppliedCurrentNetwork = true
                } else {
                  venueTotal += 1
                }
              } else {
                venueTotal += 1
              }
            }
          })
          return {
            disabled: !isSame,
            value: item.id,
            label: item.name
          } as DefaultOptionType
        })
        const commonData = {
          activationProfiles
        }

        if (venueTotal >= 3) {
          return {
            data: {
              options: options,
              id: ipsecProfileId,
              isLockedOptions: true,
              ...commonData
            } as IpSecOptionsData
          }
        }
        return {
          data: {
            options: options.map((item) =>
              ({ value: item.value, label: item.label, disabled: false })) ,
            id: ipsecProfileId,
            isLockedOptions: false,
            ...commonData
          } as IpSecOptionsData
        }
      },
      providesTags: [{ type: 'IpSec', id: 'Options' }],
      extraOptions: { maxRetries: 5 }
    }),
    activateIpsec: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(IpsecUrls.activateIpsec, params)
      },
      invalidatesTags: [{ type: 'IpSec', id: 'LIST' }, { type: 'IpSec', id: 'Options' }]
    }),
    dectivateIpsec: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(IpsecUrls.dectivateIpsec, params)
      },
      invalidatesTags: [{ type: 'IpSec', id: 'LIST' }, { type: 'IpSec', id: 'Options' }]
    }),
    activateIpsecOnVenueLanPort: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(IpsecUrls.activateIpsecOnVenueLanPort, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'IpSec', id: 'LIST' }]
    }),
    deactivateIpsecOnVenueLanPort: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(IpsecUrls.deactivateIpsecOnVenueLanPort, params)
      },
      invalidatesTags: [{ type: 'IpSec', id: 'LIST' }]
    }),
    activateIpsecOnAPLanPort: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(IpsecUrls.activateIpsecOnApLanPort, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    deactivateIpsecOnAPLanPort: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(IpsecUrls.deactivateIpsecOnApLanPort, params)
        return {
          ...req
        }
      }
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
  useGetVenuesIpsecPolicyQuery,
  useGetIpsecOptionsQuery,
  useLazyGetIpsecOptionsQuery,
  useActivateIpsecMutation,
  useDectivateIpsecMutation,
  useActivateIpsecOnVenueLanPortMutation,
  useDeactivateIpsecOnVenueLanPortMutation,
  useActivateIpsecOnAPLanPortMutation,
  useDeactivateIpsecOnAPLanPortMutation
} = ipSecApi



const SPECIFIC_NETWORK_ID = 'usedByVenueApActivation'

const consolidateActivations = (
  profile: IpsecViewData,
  venueId: string
):IpsecActivation[] => {

  let finalActivations = cloneDeep(profile.activations ?? [])

  const isExistVenueActivation = profile.venueActivations?.some(v => v.venueId === venueId) || false
  const isExistApActivation = profile.apActivations?.some(a => a.venueId === venueId) || false

  if (!isExistVenueActivation && !isExistApActivation) {
    return finalActivations
  }

  const existingActivation = finalActivations.some(va => va.venueId === venueId)

  if (existingActivation) {
    finalActivations.forEach(activation => {
      if (activation.venueId === venueId) {
        activation.wifiNetworkIds.push(SPECIFIC_NETWORK_ID)
      }
    })
    return finalActivations
  }

  const newActivation: IpsecActivation = {
    venueId: venueId,
    wifiNetworkIds: [SPECIFIC_NETWORK_ID]
  }

  return [...finalActivations, newActivation]
}