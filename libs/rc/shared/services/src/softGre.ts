import { DefaultOptionType } from 'antd/lib/select'
import _                     from 'lodash'

import { CommonResult,
  SoftGreViewData,
  TableResult,
  SoftGreUrls,
  SoftGre,
  CommonUrlsInfo,
  Network,
  VenueTableUsageBySoftGre,
  VenueDetail,
  onSocketActivityChanged,
  onActivityMessageReceived,
  SoftGreOptionsData,
  VenueApModelLanPortSettingsV1,
  VenueTableSoftGreActivation,
  CommonRbacUrlsInfo,
  NewAPModel,
  IpsecUrls,
  IpsecViewData
} from '@acx-ui/rc/utils'
import { baseSoftGreApi }    from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

import consolidateActivations             from './softGreUtils'
import { handleCallbackWhenActivityDone } from './utils'

export const softGreApi = baseSoftGreApi.injectEndpoints({
  endpoints: (build) => ({
    createSoftGre: build.mutation<CommonResult, RequestPayload<SoftGre>>({
      query: ({ payload }) => {
        const req = createHttpRequest(SoftGreUrls.createSoftGre)
        if (payload && !payload.secondaryGatewayAddress) {
          delete payload.secondaryGatewayAddress
        }
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'SoftGre', id: 'LIST' }, { type: 'SoftGre', id: 'Options' }]
    }),
    getSoftGreViewDataList: build.query<TableResult<SoftGreViewData>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(SoftGreUrls.getSoftGreViewDataList)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'SoftGre', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddSoftGreProfile',
            'UpdateSoftGreProfile',
            'DeleteSoftGreProfile',
            'ActivateSoftGreProfileOnVenueWifiNetwork',
            'DeactivateSoftGreProfileOnVenueWifiNetwork'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(
              softGreApi.util.invalidateTags([
                { type: 'SoftGre', id: 'LIST' },
                { type: 'SoftGre', id: 'Options' }
              ])
            )
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    deleteSoftGre: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SoftGreUrls.deleteSoftGre, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'SoftGre', id: 'LIST' }]
    }),
    getSoftGreById: build.query<SoftGre, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SoftGreUrls.getSoftGre, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SoftGre', id: 'DETAIL' }]
    }),
    updateSoftGre: build.mutation<CommonResult, RequestPayload<SoftGre>>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SoftGreUrls.updateSoftGre, params)
        if (payload && !payload.secondaryGatewayAddress) {
          delete payload.secondaryGatewayAddress
        }
        return {
          ...req,
          body: JSON.stringify(_.omit(payload, ['activations']))
        }
      },
      invalidatesTags: [{ type: 'SoftGre', id: 'LIST' }]
    }),
    getVenuesSoftGrePolicy: build.query<TableResult<VenueTableUsageBySoftGre>, RequestPayload>({
      queryFn: async ( { payload }, _api, _extraOptions, fetchWithBQ) => {
        const activations =
          _.get(payload,'activations') as Record<string, VenueTableSoftGreActivation>
        const emptyResponse = { data: { totalCount: 0 } as TableResult<VenueTableUsageBySoftGre> }
        const venueNetworksMap:{ [key:string]: string[] } = {}
        let networkIds: string[] = []

        const apNameMap:{ [key:string]: string[] } = {}
        let apSerialNumbers: string[] = []

        let venues: string[] = []

        Object.entries(activations)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([venueId, activation]) => { return !!activation })
          .forEach(([venueId, activation]) => {
            venueNetworksMap[venueId] = Array.from(activation.wifiNetworkIds)
            networkIds = networkIds.concat(Array.from(activation.wifiNetworkIds))
            apNameMap[venueId] = Array.from(activation.apSerialNumbers)
            apSerialNumbers = apSerialNumbers.concat(Array.from(activation.apSerialNumbers))
            venues.push(venueId)
          })

        if(
          networkIds.length === 0 &&
          apSerialNumbers.length === 0 &&
          venues.length === 0) {

          return emptyResponse
        }

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
          return {
            ...venue, wifiNetworkIds: wifiNetworkIDs, wifiNetworkNames, apSerialNumbers, apNames
          } as unknown as VenueTableUsageBySoftGre
        })

        const result = {
          data: venueResult,
          page: 1,
          totalCount: venueResult.length
        } as TableResult<VenueTableUsageBySoftGre>
        return { data: result }
      },
      providesTags: [{ type: 'SoftGre', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getSoftGreOptions: build.query<SoftGreOptionsData, RequestPayload>({
      queryFn: async ( { params, payload, enableIpsec }, _api, _extraOptions, fetchWithBQ) => {
        const { venueId, networkId } = params as { venueId: string, networkId?: string }
        const gatewayIps = new Set<string>()
        const gatewayIpMaps:Record<string, string[]> = {}
        const activationProfiles:string[] = []

        const softGreListReq = createHttpRequest(SoftGreUrls.getSoftGreViewDataList)
        const softGreListRes = await fetchWithBQ({
          ...softGreListReq,
          body: JSON.stringify(payload)
        })
        // eslint-disable-next-line max-len
        if (softGreListRes.error) return {
          data: {
            options: [],
            isLockedOptions: true,
            gatewayIps: Array.from(gatewayIps),
            gatewayIpMaps,
            activationProfiles
          } as SoftGreOptionsData }

        let { data: listData } = softGreListRes.data as TableResult<SoftGreViewData>

        let venueTotal = 0
        let softGreProfileId = ''

        const options = listData?.map(item => {
          const { id, primaryGatewayAddress, secondaryGatewayAddress } = item
          let isSame = false
          gatewayIpMaps[id] = [primaryGatewayAddress, secondaryGatewayAddress ?? '']

          const profileActivations = consolidateActivations(item, venueId)

          profileActivations.forEach(activation => {
            const isEqualVenue = activation.venueId === venueId
            if (isEqualVenue) {
              activationProfiles.push(item.id)
              let isOnlyAppliedCurrentNetwork = false
              isSame = activation.venueId === venueId
              if (networkId && activation.wifiNetworkIds?.includes(networkId)) {
                softGreProfileId = item.id
                if (activation.wifiNetworkIds.length === 1) {
                  isOnlyAppliedCurrentNetwork = true
                } else {
                  venueTotal += 1
                }
              } else {
                venueTotal += 1
              }
              if (!isOnlyAppliedCurrentNetwork && primaryGatewayAddress) {
                gatewayIps.add(primaryGatewayAddress)
              }
              if (!isOnlyAppliedCurrentNetwork && secondaryGatewayAddress) {
                gatewayIps.add(secondaryGatewayAddress)
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
          gatewayIps: Array.from(gatewayIps),
          gatewayIpMaps,
          activationProfiles
        }

        if (enableIpsec && venueTotal > 0) {
          const ipsecQueryPayload = {
            fields: ['id', 'activations', 'venueActivations', 'apActivations'],
            filters: {},
            page: 1,
            pageSize: 10_000
          }
          const ipsecReq = createHttpRequest(IpsecUrls.getIpsecViewDataList)
          // eslint-disable-next-line max-len
          const ipsecRes = await fetchWithBQ({ ...ipsecReq, body: JSON.stringify(ipsecQueryPayload) })
          const { data: ipsecData } = ipsecRes.data as TableResult<IpsecViewData>
          let bindSoftGreId = ''
          const ipsec = ipsecData.find(i => i.activations.find(a => a.venueId === venueId)
            || i.apActivations.find(a => a.venueId === venueId)
            || i.venueActivations.find(a => a.venueId === venueId))
          if (ipsec) {
            if (ipsec.activations.length > 0) {
              bindSoftGreId = ipsec.activations[0].softGreProfileId || ''
            }
            if (bindSoftGreId.length === 0 && ipsec.apActivations.length > 0) {
              bindSoftGreId = ipsec.apActivations[0].softGreProfileId || ''
            }
            if (bindSoftGreId.length === 0&& ipsec.venueActivations.length > 0) {
              bindSoftGreId = ipsec.venueActivations[0].softGreProfileId || ''
            }
          }
          if (bindSoftGreId.length > 0) {
            options.forEach(op => {
              if (op.value !== bindSoftGreId) {
                op.disabled = true
              }
            })
            return {
              data: {
                options: options,
                id: bindSoftGreId,
                isLockedOptions: true,
                ...commonData
              } as SoftGreOptionsData
            }
          }
        }

        if (venueTotal >= 3) {
          return {
            data: {
              options: options,
              id: softGreProfileId,
              isLockedOptions: true,
              ...commonData
            } as SoftGreOptionsData
          }
        }
        return {
          data: {
            options: options.map((item) =>
              ({ value: item.value, label: item.label, disabled: false })) ,
            id: softGreProfileId,
            isLockedOptions: false,
            ...commonData
          } as SoftGreOptionsData
        }
      },
      providesTags: [{ type: 'SoftGre', id: 'Options' }],
      extraOptions: { maxRetries: 5 }
    }),
    activateSoftGre: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(SoftGreUrls.activateSoftGre, params)
      },
      invalidatesTags: [{ type: 'SoftGre', id: 'LIST' }, { type: 'SoftGre', id: 'Options' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivityDone({
            api,
            activityData: msg,
            useCase: 'ActivateSoftGreProfileOnVenueWifiNetwork',
            callback: requestArgs.callback,
            failedCallback: requestArgs.failedCallback
          })
        })
      }
    }),
    dectivateSoftGre: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(SoftGreUrls.dectivateSoftGre, params)
      },
      invalidatesTags: [{ type: 'SoftGre', id: 'LIST' }, { type: 'SoftGre', id: 'Options' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivityDone({
            api,
            activityData: msg,
            useCase: 'DeactivateSoftGreProfileOnVenueWifiNetwork',
            callback: requestArgs.callback,
            failedCallback: requestArgs.failedCallback
          })
        })
      }
    }),
    activateSoftGreProfileOnVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SoftGreUrls.activateSoftGreProfileOnVenue, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'SoftGre', id: 'LIST' }]
    }),
    deactivateSoftGreProfileOnVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(SoftGreUrls.deactivateSoftGreProfileOnVenue, params)
      },
      invalidatesTags: [{ type: 'SoftGre', id: 'LIST' }]
    }),
    activateSoftGreProfileOnAP: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SoftGreUrls.activateSoftGreProfileOnAP, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    deactivateSoftGreProfileOnAP: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SoftGreUrls.deactivateSoftGreProfileOnAP, params)
        return {
          ...req
        }
      }
    }),
    // eslint-disable-next-line max-len
    getSoftGreProfileConfigurationOnVenue: build.query<VenueApModelLanPortSettingsV1 ,RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(SoftGreUrls.getSoftGreProfileConfigurationOnVenue, params)
      }
    }),
    getSoftGreProfileConfigurationOnAP: build.query<VenueApModelLanPortSettingsV1 ,RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(SoftGreUrls.getSoftGreProfileConfigurationOnAP, params)
      }
    })
  })
})


export const {
  useCreateSoftGreMutation,
  useGetSoftGreViewDataListQuery,
  useLazyGetSoftGreViewDataListQuery,
  useDeleteSoftGreMutation,
  useGetSoftGreByIdQuery,
  useUpdateSoftGreMutation,
  useGetVenuesSoftGrePolicyQuery,
  useGetSoftGreOptionsQuery,
  useLazyGetSoftGreOptionsQuery,
  useActivateSoftGreMutation,
  useDectivateSoftGreMutation,
  useActivateSoftGreProfileOnVenueMutation,
  useDeactivateSoftGreProfileOnVenueMutation,
  useActivateSoftGreProfileOnAPMutation,
  useDeactivateSoftGreProfileOnAPMutation,
  useGetSoftGreProfileConfigurationOnVenueQuery,
  useLazyGetSoftGreProfileConfigurationOnVenueQuery,
  useGetSoftGreProfileConfigurationOnAPQuery,
  useLazyGetSoftGreProfileConfigurationOnAPQuery
} = softGreApi
