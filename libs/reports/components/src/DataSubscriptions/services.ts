import { TableResult }     from '@acx-ui/rc/utils'
import { notificationApi } from '@acx-ui/store'
import { RequestPayload }  from '@acx-ui/types'

import {
  Response,
  AuditDto,
  DataSubscription,
  DataSubscriptionDto,
  PatchDataSubscriptions,
  StorageData,
  StoragePayload,
  SubscriptionPayload
} from './types'

export const dataSubscriptionApis = notificationApi.injectEndpoints({
  endpoints: (build) => ({
    getStorage: build.query<StorageData, {}>({
      query: () => {
        return {
          url: '/dataSubscriptions/storage',
          method: 'get',
          credentials: 'include'
        }
      },
      providesTags: [{ type: 'DataSubscription', id: 'GET_STORAGE' }],
      transformResponse: (response: Response<StorageData>) => response.data
    }),
    saveStorage: build.mutation<{ data: { id: string } }, StoragePayload>({
      query: ({ isEdit, ...data }) => {
        return {
          url: isEdit ? `/dataSubscriptions/storage/${data.id}` : '/dataSubscriptions/storage',
          method: isEdit ? 'put' : 'post',
          credentials: 'include',
          body: JSON.stringify(data),
          headers: {
            'content-type': 'application/json'
          }
        }
      },
      invalidatesTags: [{ type: 'DataSubscription', id: 'GET_STORAGE' }]
    }),
    getSubscription: build.query<SubscriptionPayload, { id?: string }>({
      query: ({ id }) => {
        return {
          url: `/dataSubscriptions/${id}`,
          method: 'get',
          credentials: 'include'
        }
      },
      transformResponse: (response: Response<SubscriptionPayload>) => response.data
    }),
    saveSubscription: build.mutation<{ data: { id: string } }, SubscriptionPayload>({
      query: ({ isEdit, id, ...data }) => {
        return {
          url: '/dataSubscriptions',
          method: isEdit ? 'PATCH' : 'POST',
          credentials: 'include',
          body: isEdit
            ? JSON.stringify({ data, dataSubscriptionIds: [id] })
            : JSON.stringify(data),
          headers: {
            'content-type': 'application/json'
          }
        }
      },
      invalidatesTags: [{ type: 'DataSubscription', id: 'GET_SUBSCRIPTION_LIST' }]
    }),
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
      providesTags: [{ type: 'DataSubscription', id: 'GET_SUBSCRIPTION_LIST' }],
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
      invalidatesTags: [{ type: 'DataSubscription', id: 'GET_SUBSCRIPTION_LIST' }]
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
      invalidatesTags: [{ type: 'DataSubscription', id: 'GET_SUBSCRIPTION_LIST' }]
    }),
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
      }),
      providesTags: [{ type: 'DataSubscription', id: 'GET_AUDIT_LIST' }]
    }),
    retryAudit: build.mutation<AuditDto['id'], AuditDto['id']>({
      query: (id) => ({
        url: `/dataSubscriptions/retry/${id}`,
        method: 'POST',
        credentials: 'include'
      }),
      invalidatesTags: [{ type: 'DataSubscription', id: 'GET_AUDIT_LIST' }]
    })
  })
})

export const {
  useGetStorageQuery,
  useSaveStorageMutation,
  useSaveSubscriptionMutation,
  useGetSubscriptionQuery,
  useDataSubscriptionsQuery,
  usePatchDataSubscriptionsMutation,
  useDeleteDataSubscriptionsMutation,
  useGetDataSubscriptionByIdQuery,
  useGetAuditsQuery,
  useRetryAuditMutation
} = dataSubscriptionApis
