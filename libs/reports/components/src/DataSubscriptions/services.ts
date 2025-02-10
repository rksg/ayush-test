import { TableResult }     from '@acx-ui/rc/utils'
import { notificationApi } from '@acx-ui/store'
import { RequestPayload }  from '@acx-ui/types'

import { AuditDto, DataSubscriptionDto, Response } from './types'

export const subscriptionsApi = notificationApi.injectEndpoints({
  endpoints: (build) => ({
    getDataSubscriptionById: build.query<DataSubscriptionDto, string | undefined>({
      query: (id) => ({
        url: `/dataSubscriptions/${id}`,
        method: 'GET',
        credentials: 'include'
      }),
      transformResponse: (response: Response<DataSubscriptionDto>) => response.data
    }),
    getAudits: build.query<
      TableResult<AuditDto>,
      RequestPayload
    >({
      query: ({ payload }) => ( {
        url: '/dataSubscriptions/audit/query',
        method: 'POST',
        credentials: 'include',
        body: payload
      })
      ,
      providesTags: [{ type: 'DataSubscription', id: 'AUDIT_LIST' }]
    }),
    retryAudit: build.mutation<AuditDto['id'], AuditDto['id']>({
      query: (id) => ({
        url: `/dataSubscriptions/retry/${id}`,
        method: 'POST',
        credentials: 'include'
      }),
      invalidatesTags: [{ type: 'DataSubscription', id: 'AUDIT_LIST' }]
    })
  })
})

export const {
  useGetDataSubscriptionByIdQuery,
  useGetAuditsQuery,
  useRetryAuditMutation
} = subscriptionsApi