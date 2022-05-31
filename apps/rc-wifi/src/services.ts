import { message } from 'antd'

import { baseCloudpathApi, baseNetworkApi }                           from '@acx-ui/rc/services'
import { CommonUrlsInfo, createHttpRequest, onSocketActivityChanged } from '@acx-ui/rc/utils'
import { Params }                                                     from '@acx-ui/react-router-dom'

interface RequestPayload {
  params?: Params<string>;
  payload?: any;
}

export const networkApi = baseNetworkApi.injectEndpoints({
  endpoints: (build) => ({
    networkList: build.query<any, RequestPayload>({
      query: ({ params, payload }) => {
        const networkListReq = createHttpRequest(CommonUrlsInfo.getVMNetworksList, params)
        return {
          ...networkListReq,
          body: payload
        }
      },
      providesTags: ['Network'],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          if (msg.status !== 'SUCCESS') return
          if (!['DeleteNetwork', 'AddNetworkDeep'].includes(msg.useCase)) return

          if (msg.useCase === 'AddNetworkDeep') message.success('Created successfully')

          api.dispatch(networkApi.util.invalidateTags(['Network']))
        })
      }
    }),
    createNetwork: build.mutation<any, RequestPayload>({
      query: ({ params, payload }) => {
        const createNetworkReq = createHttpRequest(CommonUrlsInfo.addNetworkDeep, params)
        return {
          ...createNetworkReq,
          body: payload
        }
      },
      invalidatesTags: ['Network']
    }),
    venueList: build.query<any, RequestPayload>({
      query: ({ params, payload }) => {
        const venueListReq = createHttpRequest(CommonUrlsInfo.getNetworksVenuesList, params)
        return{
          ...venueListReq,
          body: payload
        }
      }
    })
  })
})

export const {
  useNetworkListQuery,
  useCreateNetworkMutation,
  useVenueListQuery
} = networkApi

export const cloudpathApi = baseCloudpathApi.injectEndpoints({
  endpoints: (build) => ({
    cloudpathList: build.query<any, RequestPayload>({
      query: ({ params }) => {
        const cloudpathListReq = createHttpRequest(
          CommonUrlsInfo.getCloudpathList,
          params
        )
        return {
          ...cloudpathListReq
        }
      }
    })
  })
})

export const { useCloudpathListQuery } = cloudpathApi
