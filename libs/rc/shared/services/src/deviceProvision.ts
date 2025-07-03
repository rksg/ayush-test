import {
  CommonResult,
  TableResult,
  DeviceProvision,
  DeviceProvisionStatus,
  DeviceProvisionUrlsInfo
} from '@acx-ui/rc/utils'
import { baseDeviceProvisionApi } from '@acx-ui/store'
import { RequestPayload }         from '@acx-ui/types'
import {
  createHttpRequest,
  ApiInfo
} from '@acx-ui/utils'

interface TableQueryPayload {
  page?: number
  pageSize?: number
  searchString?: string
  sortField?: string
  sortOrder?: string
  filters?: {
    includeHidden?: boolean[],
    model?: string[],
    fromTime?: string,
    toTime?: string
  }
}
const sortableFields = ['model', 'serialNumber', 'shipDate', 'createdDate', 'visibleStatus']

// Helper function to build query parameters from table payload
const buildQueryParams = (tablePayload: TableQueryPayload): URLSearchParams => {
  const queryParams = new URLSearchParams()

  if (tablePayload?.page) {
    queryParams.append('page', (tablePayload.page - 1).toString())
  }
  if (tablePayload?.pageSize) {
    queryParams.append('size', tablePayload.pageSize.toString())
  }
  if (tablePayload?.searchString) {
    queryParams.append('searchText', tablePayload.searchString)
  }
  if (tablePayload?.sortField && sortableFields.includes(tablePayload.sortField)) {
    if (tablePayload.sortField === 'visibleStatus') {
      queryParams.append('sortColumn', 'hiddenStatusName')
    } else {
      queryParams.append('sortColumn', tablePayload.sortField)
    }
  }
  if (tablePayload?.sortOrder) {
    queryParams.append('order', tablePayload.sortOrder)
  }
  if (tablePayload?.filters?.includeHidden !== undefined) {
    queryParams.append('includeHidden', 'true')
  }
  if (tablePayload?.filters?.model !== undefined) {
    tablePayload.filters.model.forEach((m) => {
      queryParams.append('filterModels', m)
    })
  }
  if (tablePayload?.filters?.fromTime !== undefined) {
    queryParams.append('createdDateFrom', tablePayload.filters.fromTime.slice(0, 10))
  }
  if (tablePayload?.filters?.toTime !== undefined) {
    queryParams.append('createdDateTo', tablePayload.filters.toTime.slice(0, 10))
  }

  return queryParams
}

// Helper function to transform API response to table result
const transformTableResponse = (response: unknown): TableResult<DeviceProvision> => {
  const responseData = response as Record<string, unknown>
  const items = (responseData.content || responseData.data || []) as DeviceProvision[]
  const pageable = responseData.pageable as Record<string, unknown>
  const currentPage = (pageable?.pageNumber as number || responseData.page as number || 1)
  const totalItems = (responseData.totalElements || responseData.totalCount || 0) as number

  return {
    data: items,
    page: currentPage,
    totalCount: totalItems
  }
}

// Helper function to create provision query
const createProvisionQuery = (urlInfo: ApiInfo) => {
  return ({ params, payload }: RequestPayload) => {
    const tablePayload = payload as TableQueryPayload
    const queryParams = buildQueryParams(tablePayload)
    const queryString = queryParams.toString()
    const url = queryString ? `${urlInfo.url}?${queryString}` : urlInfo.url

    const req = createHttpRequest({
      ...urlInfo,
      url
    }, params)

    return { ...req }
  }
}

export const deviceProvisionApi = baseDeviceProvisionApi.injectEndpoints({
  endpoints: (build) => ({
    getApStatus: build.query<DeviceProvisionStatus, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(DeviceProvisionUrlsInfo.getApStatus, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'deviceProvision', id: 'AP_STATUS' }]
    }),
    getSwitchStatus: build.query<DeviceProvisionStatus, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(DeviceProvisionUrlsInfo.getSwitchStatus, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'deviceProvision', id: 'SWITCH_STATUS' }]
    }),
    refreshApStatus: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(DeviceProvisionUrlsInfo.refreshApStatus, params)
        return {
          ...req
        }
      },
      invalidatesTags: [
        { type: 'deviceProvision', id: 'AP_STATUS' },
        { type: 'deviceProvision', id: 'AP_PROVISIONS' }
      ]
    }),
    refreshSwitchStatus: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(DeviceProvisionUrlsInfo.refreshSwitchStatus, params)
        return {
          ...req
        }
      },
      invalidatesTags: [
        { type: 'deviceProvision', id: 'SWITCH_STATUS' },
        { type: 'deviceProvision', id: 'SWITCH_PROVISIONS' }
      ]
    }),
    getApModels: build.query<string[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(DeviceProvisionUrlsInfo.getApModels, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'deviceProvision', id: 'AP_MODELS' }]
    }),
    getSwitchModels: build.query<string[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(DeviceProvisionUrlsInfo.getSwitchModels, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'deviceProvision', id: 'SWITCH_MODELS' }]
    }),
    getApProvisions: build.query<TableResult<DeviceProvision>, RequestPayload>({
      query: createProvisionQuery(DeviceProvisionUrlsInfo.getApProvisions),
      transformResponse: transformTableResponse,
      providesTags: [{ type: 'deviceProvision', id: 'AP_PROVISIONS' }]
    }),
    getSwitchProvisions: build.query<TableResult<DeviceProvision>, RequestPayload>({
      query: createProvisionQuery(DeviceProvisionUrlsInfo.getSwitchProvisions),
      transformResponse: transformTableResponse,
      providesTags: [{ type: 'deviceProvision', id: 'SWITCH_PROVISIONS' }]
    }),
    importApProvisions: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(DeviceProvisionUrlsInfo.importApProvisions, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [
        { type: 'deviceProvision', id: 'AP_PROVISIONS' },
        { type: 'deviceProvision', id: 'AP_STATUS' }
      ]
    }),
    importSwitchProvisions: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(DeviceProvisionUrlsInfo.importSwitchProvisions, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [
        { type: 'deviceProvision', id: 'SWITCH_PROVISIONS' },
        { type: 'deviceProvision', id: 'SWITCH_STATUS' }
      ]
    }),
    hideApProvisions: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(DeviceProvisionUrlsInfo.hideApProvisions, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [
        { type: 'deviceProvision', id: 'AP_PROVISIONS' },
        { type: 'deviceProvision', id: 'AP_STATUS' }
      ]
    }),
    hideSwitchProvisions: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(DeviceProvisionUrlsInfo.hideSwitchProvisions, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [
        { type: 'deviceProvision', id: 'SWITCH_PROVISIONS' },
        { type: 'deviceProvision', id: 'SWITCH_STATUS' }
      ]
    })
  })
})

export const {
  useGetApStatusQuery,
  useLazyGetApStatusQuery,
  useGetSwitchStatusQuery,
  useLazyGetSwitchStatusQuery,
  useRefreshApStatusMutation,
  useRefreshSwitchStatusMutation,
  useGetApModelsQuery,
  useLazyGetApModelsQuery,
  useGetSwitchModelsQuery,
  useLazyGetSwitchModelsQuery,
  useGetApProvisionsQuery,
  useLazyGetApProvisionsQuery,
  useGetSwitchProvisionsQuery,
  useLazyGetSwitchProvisionsQuery,
  useImportApProvisionsMutation,
  useImportSwitchProvisionsMutation,
  useHideApProvisionsMutation,
  useHideSwitchProvisionsMutation
} = deviceProvisionApi
