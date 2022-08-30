import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
  RequestPayload,
  TableResult,
  CommonResult,
  Service,
  DHCPSaveData
} from '@acx-ui/rc/utils'

export const baseServiceApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'serviceApi',
  tagTypes: ['Service'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const serviceApi = baseServiceApi.injectEndpoints({
  endpoints: (build) => ({
    serviceList: build.query<TableResult<Service>, RequestPayload>({
      query: ({ params, payload }) => {
        const serviceListReq = createHttpRequest(CommonUrlsInfo.getServicesList, params)
        return {
          ...serviceListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    deleteService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonUrlsInfo.deleteService, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    getDHCP: build.query<DHCPSaveData | undefined, RequestPayload>({
      async queryFn ({ params }, _queryApi, _extraOptions, fetch) {
        if (!params?.serviceId) return Promise.resolve({ data: undefined } as QueryReturnValue<
          undefined,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)
        const result = await fetch(createHttpRequest(CommonUrlsInfo.getService, params))
        return result as QueryReturnValue<DHCPSaveData,
        FetchBaseQueryError,
        FetchBaseQueryMeta>
      },
      providesTags: [{ type: 'Service', id: 'DETAIL' }]
    }),
    saveDHCP: build.mutation<Service, RequestPayload>({
      query: ({ params, payload }) => {

        const createDHCPReq = createHttpRequest(CommonUrlsInfo.saveDHCPService, params)
        return {
          ...createDHCPReq,
          body: payload
        }

      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    })
  })
})
export const {
  useServiceListQuery,
  useDeleteServiceMutation,
  useGetDHCPQuery,
  useSaveDHCPMutation
} = serviceApi
