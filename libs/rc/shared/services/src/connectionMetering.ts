
import {
  TableResult,
  createNewTableHttpRequest,
  ConnectionMetering,
  ConnectionMeteringUrls,
  TableChangePayload,
  NewTableResult,
  transferToTableResult,
  QosStats
} from '@acx-ui/rc/utils'
import { baseConnectionMeteringApi } from '@acx-ui/store'
import { RequestPayload }            from '@acx-ui/types'
import { createHttpRequest }         from '@acx-ui/utils'


export const connectionMeteringApi = baseConnectionMeteringApi.injectEndpoints({
  endpoints: build => ({
    addConnectionMetering: build.mutation<ConnectionMetering, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ConnectionMeteringUrls.createConnectionMetering, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'ConnectionMetering', id: 'LIST' }]
    }),
    getConnectionMeteringList: build.query<TableResult<ConnectionMetering>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: ConnectionMeteringUrls.getConnectionMeteringList,
          params,
          payload: payload as TableChangePayload
        })
        return {
          ...req,
          params
        }
      },
      transformResponse (result: NewTableResult<ConnectionMetering>) {
        return transferToTableResult<ConnectionMetering>(result)
      },
      providesTags: [{ type: 'ConnectionMetering', id: 'LIST' }]
    }),
    deleteConnectionMetering: build.mutation({
      query: ({ params }) => {
        const req = createHttpRequest(ConnectionMeteringUrls.deleteConnectionMetering, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'ConnectionMetering' }]
    }),
    getConnectionMeteringById: build.query<ConnectionMetering, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ConnectionMeteringUrls.getConnectionMeteringDetail, params)
        return {
          ...req
        }
      },
      providesTags: [
        { type: 'ConnectionMetering', id: 'ID' }
      ]
    }),
    updateConnectionMetering: build.mutation<ConnectionMetering, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ConnectionMeteringUrls.updateConnectionMetering, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'ConnectionMetering' }]
    }),
    searchConnectionMeteringList: build.query<TableResult<ConnectionMetering>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: ConnectionMeteringUrls.searchConnectionMeteringList,
          params,
          payload: payload as TableChangePayload
        })
        return {
          ...req,
          body: payload
        }
      },
      transformResponse (result: NewTableResult<ConnectionMetering>) {
        return transferToTableResult<ConnectionMetering>(result)
      },
      providesTags: [{ type: 'ConnectionMetering', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getQosStats: build.query<{ data: QosStats[] }, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ConnectionMeteringUrls.getQosStats, params)
        return{
          ...req,
          body: payload
        }
      }
    })
  })
})

export const {
  useAddConnectionMeteringMutation,
  useGetConnectionMeteringListQuery,
  useLazyGetConnectionMeteringListQuery,
  useDeleteConnectionMeteringMutation,
  useGetConnectionMeteringByIdQuery,
  useLazyGetConnectionMeteringByIdQuery,
  useUpdateConnectionMeteringMutation,
  useSearchConnectionMeteringListQuery,
  useLazySearchConnectionMeteringListQuery,
  useLazyGetQosStatsQuery,
  useGetQosStatsQuery
} = connectionMeteringApi