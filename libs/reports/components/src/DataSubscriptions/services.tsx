import { TableResult }       from '@acx-ui/rc/utils'
import { notificationApi }   from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

export type DataSubscription = {
  id: string
  name: string
  userId: string
  userName: string
  columns: string[]
  status: boolean
}

type PatchDataSubscriptions = {
  dataSubscriptionIds: string[]
  data: Partial<DataSubscription>
}

export const {
  useDataSubscriptionsQuery,
  usePatchDataSubscriptionsMutation,
  useDeleteDataSubscriptionsMutation
} = notificationApi.injectEndpoints({
  endpoints: (build) => ({
    dataSubscriptions: build.query<
      TableResult<DataSubscription>,
      RequestPayload
    >({
      query: ({ payload }) => {
        const req = createHttpRequest(
          {
            url: '/analytics/api/rsa-mlisa-notification/dataSubscriptions/query',
            method: 'post'
          })
        return {
          ...req,
          credentials: 'include',
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'DataSubscription', id: 'LIST' }],
      transformResponse: (response: TableResult<DataSubscription>) => {
        return {
          data: response.data,
          page: response.page,
          totalCount: response.totalCount
        }
      }
    }),
    patchDataSubscriptions: build.mutation<
      void,
      RequestPayload<PatchDataSubscriptions>
    >({
      query: ({ payload }) => {
        const req = createHttpRequest(
          {
            url: '/analytics/api/rsa-mlisa-notification/dataSubscriptions',
            method: 'PATCH'
          })
        return ({
          ...req,
          credentials: 'include',
          body: payload
        })
      },
      invalidatesTags: [{ type: 'DataSubscription', id: 'LIST' }]
    }),
    deleteDataSubscriptions: build.mutation<
      void,
      RequestPayload<string[]>
    >({
      query: ({ payload }) => {
        const req = createHttpRequest(
          {
            url: '/analytics/api/rsa-mlisa-notification/dataSubscriptions',
            method: 'DELETE'
          })
        return ({
          ...req,
          credentials: 'include',
          body: payload
        })
      },
      invalidatesTags: [{ type: 'DataSubscription', id: 'LIST' }]
    })
  })
})
