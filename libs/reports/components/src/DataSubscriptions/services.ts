import { TableResult }     from '@acx-ui/rc/utils'
import { notificationApi } from '@acx-ui/store'
import { RequestPayload }  from '@acx-ui/types'

export type DataQuotaUsage = {
    used: number
    allowed: number
}

type AzureStoragePayload = {
  azureConnectionType: string,
  azureAccountName: string,
  azureAccountKey: string,
  azureShareName: string,
  azureCustomerName: string
}
type FTPStroagePayload = {
  ftpHost: string,
  ftpPort: string,
  ftpUserName: string,
  ftpPassword: string
}
type SFTPStoragePayload = {
  sftpHost: string,
  sftpPort: string,
  sftpUserName: string,
  sftpPassword: string,
  sftpPrivateKey: string
}
export type StoragePayload = {
  connectionType: 'azure' | 'ftp' | 'sftp',
  id?: string
} & (AzureStoragePayload | FTPStroagePayload | SFTPStoragePayload) & { isEdit: boolean }
type SubscriptionPayload = {
  name: string,
  dataSource: string,
  columns: string[],
  frequency: string,
  userName: string,
  tenantId: string,
  id?: string
  userId: string,
  isEdit: boolean
}
export type StorageData = {
  config: StoragePayload,
  id: string
}
export type DataSubscription = Omit<SubscriptionPayload, 'id'> & {
  id: string
  status: boolean,
  updatedAt: string
}

type PatchDataSubscriptions = {
  dataSubscriptionIds: string[]
  data: Partial<DataSubscription>
}
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
      transformResponse: (response: { data: StorageData }) => {
        return response.data
      }
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
      transformResponse: (response: { data: SubscriptionPayload }) => {
        return response.data
      }
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
      invalidatesTags: [{ type: 'DataSubscription', id: 'GET_SUBSCRIPTION' }]
    }),
    getQuotaUsage: build.query<DataQuotaUsage, void>({
      query: () => {
        return {
          url: 'dataSubscriptions/quota',
          method: 'GET',
          credentials: 'include'
        }
      }
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
    })
  })
})

export const {
  useGetStorageQuery,
  useSaveStorageMutation,
  useSaveSubscriptionMutation,
  useGetSubscriptionQuery,
  useGetQuotaUsageQuery,
  useDataSubscriptionsQuery,
  usePatchDataSubscriptionsMutation,
  useDeleteDataSubscriptionsMutation
} = dataSubscriptionApis
