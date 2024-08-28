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
  onActivityMessageReceived,
  SoftGreOption
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
    }),
    getSoftGreSelectOption: build.query<SoftGreOption[], RequestPayload>({
      queryFn: async ( { params, payload }, _api, _extraOptions, fetchWithBQ) => {
        const { current: venueId, networkId } = _.get(payload,'current')
        const emptyResponse = [] as unknown as SoftGreOption[]
        // query SoftGre profiles
        const softGreListReq = createHttpRequest(SoftGreUrls.getSoftGreViewDataList, params)
        const reqPayload = _.omit(payload as RequestPayload, ['current'])
        // eslint-disable-next-line max-len
        const softGreListRes = await fetchWithBQ({ ...softGreListReq, body: JSON.stringify(reqPayload) })
        if (softGreListRes.error) return emptyResponse
        // eslint-disable-next-line max-len, @typescript-eslint/no-unused-vars
        let { data: _softGreListData } = softGreListRes?.data as unknown as SoftGreOption[]

        let venueTotal = 0
        let softGreProfileId = ''

        let options: SoftGreOption[]
        const softGreListData = [
          {
            id: '086b1cacab274e0e8f7c3b8e40cfd73e',
            name: 'jean-1',
            activations: [
              {
                venueId: '54d0451af18549bcadc9ed084ddf1288', // My-Venue
                wifiNetworkIds: [
                  '850811279c2b4f92b0f684a0c74aee49', // _WPA3_
                  'fd5d6b3a003c4cd0b6b5ab80159b1187' // ==dev-app8-ssi
                ]
              },
              {
                venueId: '54d0451af18549bcadc9ed084ddf1288', // test-0821
                wifiNetworkIds: [
                  'fbde2b0600b646cfb7663f304cb20b7e'
                ]
              }
            ]
          },{
            id: 'a983a74d1791406a9dfb17c6796676d4',
            name: '1112232',
            activations: [
              {
                venueId: '991eb992ece042a183b6945a2398ddb9', // joe-test
                wifiNetworkIds: [
                  '9b33509cc0a1464cad9447778a72006f',
                  '797a1f499c254260b7a1aedafba524a3',
                  'b946294426b8413d819751cb3d320a20'
                ]
              }
            ]
          },
          {
            id: 'd01d17d3a59f4907b7ad895cc3182394',
            name: '5555',
            activations: [
              {
                venueId: '54d0451af18549bcadc9ed084ddf1288', // test-0821
                wifiNetworkIds: [
                  '9b33509cc0a1464cad9447778a72006f' // ==dev-app8-wipsr
                ]
              }
            ]
          },
          {
            id: '56376b8a7fd04649a771dfa6a3ae776b',
            name: '553567',
            activations: [
              {
                venueId: '54d0451af18549bcadc9ed084ddf1288', // test-0821
                wifiNetworkIds: [
                  'd5997305b9624cc68bc321dc5211e77e' // ==app8=psk
                ]
              }
            ]
          }
        ]
        // // eslint-disable-next-line max-len
        const aggregatedData = softGreListData.map(softGre => {
          let isCurrentVenue:boolean
          softGre.activations.forEach(activation => {
            isCurrentVenue = activation.venueId === venueId
            if (activation.venueId === venueId === true) {
              venueTotal += 1 // TODO: can not count, venueTotal is always 0
            }
            if (activation.wifiNetworkIds.includes(networkId)) {
              softGreProfileId = softGre.id
            }
          })
          const result = {
            label: softGre.name,
            value: softGre.id,
            isCurrentVenue
          }
          return result
        })

        options = aggregatedData.map(
          (softGre: { label: string; value: string; isCurrentVenue: boolean } ) => {
            return {
              label: softGre.label,
              value: softGre.value,
              disable: venueTotal === 3 ? (softGre.isCurrentVenue ? false : true) : false
            } as SoftGreOption
          }) as unknown as SoftGreOption[]
        return { data: options }
      },
      providesTags: [{ type: 'SoftGre', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    })
  })
})
// avcCategoryList: build.query<AvcCategory[], RequestPayload>({
//   queryFn: async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
//     if (enableRbac) {
//       try {
//         const categoryListReq = createHttpRequest(
//           AccessControlUrls.applicationLibrariesCategoryList,
//           params
//         )
//         const categoryListRes = await fetchWithBQ(categoryListReq)

//         if (categoryListRes.error) {
//           return { error: categoryListRes.error as FetchBaseQueryError }
//         }

//         const categoryListResData = (categoryListRes.data as { categories: { id: string, name: string }[] }).categories
//         return { data: categoryListResData.map(categoryList => {
//           return {
//             catId: categoryList.id as string,
//             catName: categoryList.name as string,
//             appNames: []
//           }
//         }) as unknown as AvcCategory[] }
//       } catch (error) {
//         return { error: error as FetchBaseQueryError }
//       }
//     }

//     const avcCatListReq = createHttpRequest(AccessControlUrls.getAvcCategory, params)
//     const avcCatListRes = await fetchWithBQ({
//       ...avcCatListReq,
//       body: payload
//     })

//     if (avcCatListRes.error) {
//       return { error: avcCatListRes.error as FetchBaseQueryError }
//     }

//     return { data: avcCatListRes.data as AvcCategory[] }
//   },
//   providesTags: [{ type: 'Policy', id: 'LIST' }]
// }),

//  getRegisteredUsersList: build.query<RegisteredUserSelectOption[], RequestPayload>({
//       query: ({ params }) => {
//         const req =
//           createHttpRequest(AdministrationUrlsInfo.getRegisteredUsersList, params)
//         return {
//           ...req
//         }
//       },
//       transformResponse: (response: unknown[]) => {
//         return response.map((item: unknown) => {
//           const { email, externalId } = item as { email: string, externalId: string }

//           return {
//             externalId: externalId,
//             email: email
//           }
//         })
//       }
//     }),
// ====
// query: ({ payload, params }) => {

//   const req = createHttpRequest(SoftGreUrls.getSoftGreViewDataList, params)
//   return {
//     ...req,
//     body: JSON.stringify(payload)
//   }
// },
// transformResponse: (response: { data: SoftGre[] } ): SoftGreOption[] => {
//   const options: SoftGreOption[] = []
//   response.data.forEach(item => {
//     const option = { label: item.name, value: item.id } as SoftGreOption
//     const isCurrentVenue = item.id === current.venueId
//     options.push(option)
//   })
//   console.info(response)
//   return options
// }

export const {
  useCreateSoftGreMutation,
  useGetSoftGreViewDataListQuery,
  useLazyGetSoftGreViewDataListQuery,
  useDeleteSoftGreMutation,
  useGetSoftGreByIdQuery,
  useUpdateSoftGreMutation,
  useGetVenuesSoftGrePolicyQuery,
  useGetSoftGreSelectOptionQuery
} = softGreApi
