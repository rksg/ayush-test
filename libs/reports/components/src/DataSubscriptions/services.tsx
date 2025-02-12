import { TableResult }     from '@acx-ui/rc/utils'
import { notificationApi } from '@acx-ui/store'
import { RequestPayload }  from '@acx-ui/types'

export type DataSubscription = {
  id: string
  name: string
  userId: string
  userName: string
  columns: string[]
  status: boolean,
  frequency: string,
  updatedAt: string
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
      query: ({ payload }) => ({
        url: 'dataSubscriptions/query',
        method: 'post',
        credentials: 'include',
        body: payload
      }),
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
      query: ({ payload }) => ({
        url: 'dataSubscriptions',
        method: 'PATCH',
        credentials: 'include',
        body: payload
      }),
      invalidatesTags: [{ type: 'DataSubscription', id: 'LIST' }]
    }),
    deleteDataSubscriptions: build.mutation<
      void,
      RequestPayload<string[]>
    >({
      query: ({ payload }) => ({
        url: 'dataSubscriptions',
        method: 'DELETE',
        credentials: 'include',
        body: payload
      }),
      invalidatesTags: [{ type: 'DataSubscription', id: 'LIST' }]
    })
  })
})
