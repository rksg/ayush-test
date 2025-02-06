import { notificationApi } from '@acx-ui/store'


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
} & (AzureStoragePayload | FTPStroagePayload | SFTPStoragePayload) & {
  tenantId: string, isEdit: boolean}
export type StorageData = {
  config: StoragePayload, 
  id: string
}
export const dataSubscriptionApis = notificationApi.injectEndpoints({
  endpoints: (build) => ({
    getStorage: build.query<StorageData, {
      tenantId: string
    }>({
      query: ({ tenantId }) => {
        return {
          url: '/dataSubscriptions/storage',
          method: 'get',
          credentials: 'include',
          headers: {
            'x-mlisa-tenant-id': tenantId
          }
        }
      },
      providesTags: [{ type: 'Notification', id: 'GET_STORAGE' }],
      transformResponse: (response: { data: StorageData }) => {
        return response.data
      }
    }),
    saveStorage: build.mutation<{ data: { id: string} }, StoragePayload>({
      query: ({ tenantId, isEdit, ...data }) => {
        return {
          url: isEdit ? `/dataSubscriptions/storage/${data.id}` : '/dataSubscriptions/storage',
          method: isEdit ? 'put' : 'post',
          credentials: 'include',
          body: JSON.stringify(data),
          headers: {
            'x-mlisa-tenant-id': tenantId,
            //'x-mlisa-user-id': userId,
            'content-type': 'application/json'
          }
        }
      },
      invalidatesTags: [{ type: 'Notification', id: 'GET_STORAGE' }]
    })
  })
})

export const {
  useGetStorageQuery,
  useSaveStorageMutation
} = dataSubscriptionApis
