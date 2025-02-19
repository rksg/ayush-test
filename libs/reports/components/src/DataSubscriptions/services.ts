import { notificationApi } from '@acx-ui/store'

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
      providesTags: [{ type: 'Notification', id: 'GET_STORAGE' }],
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
      invalidatesTags: [{ type: 'Notification', id: 'GET_STORAGE' }]
    }),
    getSubscription: build.query<SubscriptionPayload, { id?: string }>({
      query: ({ id }) => {
        return {
          url: `/dataSubscriptions/${id}`,
          method: 'get',
          credentials: 'include'
        }
      },
      providesTags: [{ type: 'Notification', id: 'GET_SUBSCRIPTION' }],
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
      invalidatesTags: [{ type: 'Notification', id: 'GET_SUBSCRIPTION' }]
    }),
    getQuotaUsage: build.query<DataQuotaUsage, void>({
      query: () => {
        return {
          url: 'dataSubscriptions/quota',
          method: 'GET',
          credentials: 'include'
        }
      }
    })
  })
})

export const {
  useGetStorageQuery,
  useSaveStorageMutation,
  useSaveSubscriptionMutation,
  useGetSubscriptionQuery,
  useGetQuotaUsageQuery
} = dataSubscriptionApis
