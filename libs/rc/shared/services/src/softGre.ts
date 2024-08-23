import _ from 'lodash'

import { CommonResult,
  SoftGreViewData,
  TableResult,
  SoftGreUrls,
  SoftGre,
  CommonUrlsInfo,
  SoftGreActivation,
  Network,
  VenueTableUsageBySoftGre,
  VenueDetail,
  onSocketActivityChanged,
  onActivityMessageReceived
} from '@acx-ui/rc/utils'
import { baseSoftGreApi }    from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

export const softGreApi = baseSoftGreApi.injectEndpoints({
  endpoints: (build) => ({
    createSoftGre: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(SoftGreUrls.createSoftGre)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'SoftGre', id: 'LIST' }]
    }),
    getSoftGreViewDataList: build.query<TableResult<SoftGreViewData>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(SoftGreUrls.getSoftGreViewDataList, params)
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
            'DeleteSoftGreProfile'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(
              softGreApi.util.invalidateTags([
                { type: 'SoftGre', id: 'LIST' }
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
    updateSoftGre: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SoftGreUrls.updateSoftGre, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'SoftGre', id: 'LIST' }]
    }),
    getVenuesSoftGrePolicy: build.query<TableResult<VenueTableUsageBySoftGre>, RequestPayload>({
      queryFn: async ( { params, payload }, _api, _extraOptions, fetchWithBQ) => {
        const activations = _.get(payload,'activations') as SoftGreActivation[]
        const emptyResponse = { data: { totalCount: 0 } as TableResult<VenueTableUsageBySoftGre> }
        const venueNetworksMap:{ [key:string]: string[] } = {}
        let networkIds: string[] = []

        activations.forEach(venue => {
          venueNetworksMap[venue.venueId] = venue.wifiNetworkIds
          networkIds = networkIds.concat(venue.wifiNetworkIds)
        })

        const networkIdsSet = Array.from(new Set(networkIds))

        // query network name with networkId
        if (networkIds.length === 0) return emptyResponse
        const networkQueryPayload = {
          fields: ['name', 'id'],
          filters: { id: networkIdsSet },
          page: 1,
          pageSize: 10_000
        }
        const networkReq = createHttpRequest(CommonUrlsInfo.getWifiNetworksList, params)
        // eslint-disable-next-line max-len
        const networkRes = await fetchWithBQ({ ...networkReq, body: JSON.stringify(networkQueryPayload) })
        if (networkRes.error) return emptyResponse

        const { data: networkData } = networkRes.data as TableResult<Network>
        let networkMapping:{ [key:string]: string } = {}
        networkData?.forEach((network: Network) => {
          networkMapping[network.id] = network.name
        })

        // query venue name and address by venueId
        const venueIds = Object.keys(venueNetworksMap)
        const venueQueryPayload = {
          ...(_.omit(payload as RequestPayload, ['activations'])),
          filters: { id: venueIds }
        }
        const venueReq = createHttpRequest(CommonUrlsInfo.getVenuesList, params)
        const venueRes = await fetchWithBQ({ ...venueReq, body: JSON.stringify(venueQueryPayload) })
        if (venueRes.error) return emptyResponse
        const { data: venueData } = venueRes?.data as TableResult<VenueDetail>

        // process data
        const venueResult = venueData?.map(venue =>{
          const wifiNetworkIDs = venueNetworksMap[venue.id]
          const wifiNetworkNames = wifiNetworkIDs.map(id => (networkMapping[id]))
          // eslint-disable-next-line max-len
          return { ...venue, wifiNetworkIds: wifiNetworkIDs, wifiNetworkNames } as unknown as VenueTableUsageBySoftGre
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
  useGetVenuesSoftGrePolicyQuery
} = softGreApi
