import { TableResult }     from '@acx-ui/rc/utils'
import { notificationApi } from '@acx-ui/store'
import { RequestPayload }  from '@acx-ui/types'

import {
  Response,
  AuditDto,
  DataQuotaUsage,
  DataConnector,
  DataConnectorDto,
  PatchDataConnector,
  StorageData,
  StoragePayload,
  ConnectorPayload
} from './types'

export const dataConnectorApis = notificationApi.injectEndpoints({
  endpoints: (build) => ({
    getStorage: build.query<StorageData, {}>({
      query: () => {
        return {
          url: '/dataConnector/storage',
          method: 'get',
          credentials: 'include'
        }
      },
      providesTags: [{ type: 'DataConnector', id: 'GET_STORAGE' }],
      transformResponse: (response: Response<StorageData>) => response.data
    }),
    saveStorage: build.mutation<{ data: { id: string } }, StoragePayload>({
      query: ({ isEdit, ...data }) => {
        return {
          url: isEdit ? `/dataConnector/storage/${data.id}` : '/dataConnector/storage',
          method: isEdit ? 'put' : 'post',
          credentials: 'include',
          body: JSON.stringify(data),
          headers: {
            'content-type': 'application/json'
          }
        }
      },
      invalidatesTags: [{ type: 'DataConnector', id: 'GET_STORAGE' }]
    }),
    getConnector: build.query<ConnectorPayload, { id?: string }>({
      query: ({ id }) => {
        return {
          url: `/dataConnector/${id}`,
          method: 'get',
          credentials: 'include'
        }
      },
      transformResponse: (response: Response<ConnectorPayload>) => response.data
    }),
    saveConnector: build.mutation<{ data: { id: string } }, ConnectorPayload>({
      query: ({ isEdit, id, ...data }) => {
        return {
          url: '/dataConnector',
          method: isEdit ? 'PATCH' : 'POST',
          credentials: 'include',
          body: isEdit
            ? JSON.stringify({ data, ids: [id] })
            : JSON.stringify(data),
          headers: {
            'content-type': 'application/json'
          }
        }
      },
      invalidatesTags: [{ type: 'DataConnector', id: 'GET_CONNECTOR' }]
    }),
    getQuotaUsage: build.query<DataQuotaUsage, void>({
      query: () => {
        return {
          url: 'dataConnector/quota',
          method: 'GET',
          credentials: 'include'
        }
      }
    }),
    dataConnector: build.query<
      TableResult<DataConnector>,
      RequestPayload
    >({
      query: ({ payload }) => ({
        url: 'dataConnector/query',
        method: 'post',
        credentials: 'include',
        body: payload
      }),
      providesTags: [{ type: 'DataConnector', id: 'GET_CONNECTOR_LIST' }],
      transformResponse: (response: TableResult<DataConnector>) => {
        return {
          data: response.data,
          page: response.page,
          totalCount: response.totalCount
        }
      }
    }),
    patchDataConnector: build.mutation<
      void,
      RequestPayload<PatchDataConnector>
    >({
      query: ({ payload }) => ({
        url: 'dataConnector',
        method: 'PATCH',
        credentials: 'include',
        body: payload
      }),
      invalidatesTags: [{ type: 'DataConnector', id: 'GET_CONNECTOR_LIST' }]
    }),
    deleteDataConnector: build.mutation<
      void,
      RequestPayload<string[]>
    >({
      query: ({ payload }) => ({
        url: 'dataConnector',
        method: 'DELETE',
        credentials: 'include',
        body: payload
      }),
      invalidatesTags: [{ type: 'DataConnector', id: 'GET_CONNECTOR_LIST' }]
    }),
    getDataConnectorById: build.query<DataConnectorDto, string | undefined>({
      query: (id) => ({
        url: `/dataConnector/${id}`,
        method: 'GET',
        credentials: 'include'
      }),
      transformResponse: (response: Response<DataConnectorDto>) => response.data
    }),
    getAudits: build.query<
      TableResult<AuditDto>,
      RequestPayload
    >({
      query: ({ payload }) => ( {
        url: '/dataConnector/audit/query',
        method: 'POST',
        credentials: 'include',
        body: payload
      }),
      providesTags: [{ type: 'DataConnector', id: 'GET_AUDIT_LIST' }]
    }),
    retryAudit: build.mutation<AuditDto['id'], AuditDto['id']>({
      query: (id) => ({
        url: `/dataConnector/retry/${id}`,
        method: 'POST',
        credentials: 'include'
      }),
      invalidatesTags: [{ type: 'DataConnector', id: 'GET_AUDIT_LIST' }]
    })
  })
})

export const {
  useGetStorageQuery,
  useSaveStorageMutation,
  useSaveConnectorMutation,
  useGetConnectorQuery,
  useGetQuotaUsageQuery,
  useDataConnectorQuery,
  usePatchDataConnectorMutation,
  useDeleteDataConnectorMutation,
  useGetDataConnectorByIdQuery,
  useGetAuditsQuery,
  useRetryAuditMutation
} = dataConnectorApis
