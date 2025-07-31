import {
  CommonResult,
  DeviceProvision,
  DeviceProvisionStatus,
  DeviceProvisionUrlsInfo,
  onSocketActivityChanged,
  onActivityMessageReceived
} from '@acx-ui/rc/utils'
import { baseDeviceProvisionApi } from '@acx-ui/store'
import { RequestPayload }         from '@acx-ui/types'
import {
  createHttpRequest,
  ApiInfo,
  TableResult
} from '@acx-ui/utils'

interface TableQueryPayload {
  page?: number
  size?: number
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

// Helper function to build query parameters for model queries
const buildModelQueryParams = (tablePayload: TableQueryPayload): URLSearchParams => {
  const queryParams = new URLSearchParams()

  if (tablePayload?.filters?.includeHidden !== undefined) {
    queryParams.append('includeHidden', tablePayload.filters.includeHidden[0].toString())
  }

  return queryParams
}

// Helper function to create model query
const createModelQuery = (urlInfo: ApiInfo) => {
  return ({ params, payload }: RequestPayload) => {
    const tablePayload = payload as TableQueryPayload
    const queryParams = buildModelQueryParams(tablePayload)
    const queryString = queryParams.toString()
    const url = queryString ? `${urlInfo.url}?${queryString}` : urlInfo.url

    const req = createHttpRequest({
      ...urlInfo,
      url
    }, params)

    return { ...req }
  }
}

// Helper function to create POST query with payload
const createPostQuery = (urlInfo: ApiInfo) => {
  return ({ params, payload }: RequestPayload) => {
    const tablePayload = payload as TableQueryPayload

    // Build payload directly from tablePayload
    const newPayload: Record<string, unknown> = {}

    // Add page parameter
    if (tablePayload?.page) {
      newPayload.page = tablePayload.page - 1
    }

    // Add size parameter
    if (tablePayload?.size) {
      newPayload.size = tablePayload.size
    }

    // Add searchText parameter
    if (tablePayload?.searchString) {
      newPayload.searchText = tablePayload.searchString
    }

    // Add sortColumn parameter
    if (tablePayload?.sortField && sortableFields.includes(tablePayload.sortField)) {
      if (tablePayload.sortField === 'visibleStatus') {
        newPayload.sortColumn = 'hiddenStatusName'
      } else {
        newPayload.sortColumn = tablePayload.sortField
      }
    }

    // Add order parameter
    if (tablePayload?.sortOrder) {
      newPayload.order = tablePayload.sortOrder
    }

    // Add includeHidden parameter
    if (tablePayload?.filters?.includeHidden !== undefined) {
      newPayload.includeHidden = tablePayload.filters.includeHidden[0]
    }

    // Add filterModels parameter
    if (tablePayload?.filters?.model) {
      newPayload.filterModels = tablePayload.filters.model
    }

    // Add createdDateFrom parameter
    if (tablePayload?.filters?.fromTime) {
      newPayload.createdDateFrom = tablePayload.filters.fromTime.slice(0, 10)
    }

    // Add createdDateTo parameter
    if (tablePayload?.filters?.toTime) {
      newPayload.createdDateTo = tablePayload.filters.toTime.slice(0, 10)
    }

    const req = createHttpRequest({
      ...urlInfo,
      url: urlInfo.url
    }, params)

    return {
      ...req,
      body: JSON.stringify(newPayload)
    }
  }
}

export const deviceProvisionApi = baseDeviceProvisionApi.injectEndpoints({
  endpoints: (build) => ({
    getApStatus: build.query<DeviceProvisionStatus, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(DeviceProvisionUrlsInfo.getApStatus, params)
        return {
          ...req,
          url: `${req.url}?fields=refreshedTime`
        }
      },
      providesTags: [{ type: 'deviceProvision', id: 'AP_STATUS' }]
    }),
    getSwitchStatus: build.query<DeviceProvisionStatus, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(DeviceProvisionUrlsInfo.getSwitchStatus, params)
        return {
          ...req,
          url: `${req.url}?fields=refreshedTime`
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
      query: createModelQuery(DeviceProvisionUrlsInfo.getApModels),
      providesTags: [{ type: 'deviceProvision', id: 'AP_MODELS' }]
    }),
    getSwitchModels: build.query<string[], RequestPayload>({
      query: createModelQuery(DeviceProvisionUrlsInfo.getSwitchModels),
      providesTags: [{ type: 'deviceProvision', id: 'SWITCH_MODELS' }]
    }),
    getApProvisions: build.query<TableResult<DeviceProvision>, RequestPayload>({
      query: createPostQuery(DeviceProvisionUrlsInfo.getApProvisions),
      transformResponse: transformTableResponse,
      providesTags: [{ type: 'deviceProvision', id: 'AP_PROVISIONS' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'ImportVenueApsCsv',
            'HideApProvisions'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(deviceProvisionApi.util.invalidateTags([
              { type: 'deviceProvision', id: 'AP_PROVISIONS' },
              { type: 'deviceProvision', id: 'AP_STATUS' }
            ]))
          })
        })
      }
    }),
    getSwitchProvisions: build.query<TableResult<DeviceProvision>, RequestPayload>({
      query: createPostQuery(DeviceProvisionUrlsInfo.getSwitchProvisions),
      transformResponse: transformTableResponse,
      providesTags: [{ type: 'deviceProvision', id: 'SWITCH_PROVISIONS' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'ImportVenueSwitchesCsv',
            'HideSwitchProvisions'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(deviceProvisionApi.util.invalidateTags([
              { type: 'deviceProvision', id: 'SWITCH_PROVISIONS' },
              { type: 'deviceProvision', id: 'SWITCH_STATUS' }
            ]))
          })
        })
      }
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
