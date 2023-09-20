import {
  CommonUrlsInfo,
  onSocketActivityChanged,
  onActivityMessageReceived,
  TableResult,
  RWG
} from '@acx-ui/rc/utils'
import { baseRWGApi }        from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

export const rwgApi = baseRWGApi.injectEndpoints({
  endpoints: (build) => ({
    rwgList: build.query<TableResult<RWG>, RequestPayload>({
      query: ({ params }) => {
        const rwgListReq = createHttpRequest(CommonUrlsInfo.getRwgList, params)
        return {
          ...rwgListReq
        }
      },
      transformResponse: ({ response }) => {
        return {
          data: response,
          totalCount: response.length,
          page: 0
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'RWG', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddGateway',
            'DeleteGateway'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(rwgApi.util.invalidateTags([{ type: 'RWG', id: 'LIST' }]))
          })
        })
      }
    }),
    deleteGateway: build.mutation<RWG, RequestPayload>({
      query: ({ params, payload }) => {
        if (payload) { //delete multiple rows
          let req = createHttpRequest(CommonUrlsInfo.deleteGateways, params)
          return {
            ...req,
            body: payload
          }
        } else { //delete single row
          let req = createHttpRequest(CommonUrlsInfo.deleteGateway, params)
          return {
            ...req
          }
        }
      },
      invalidatesTags: [{ type: 'RWG', id: 'LIST' }]
    })
  })
})

export const {
  useRwgListQuery,
  useDeleteGatewayMutation
} = rwgApi
