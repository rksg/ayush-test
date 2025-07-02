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
  createHttpRequest
} from '@acx-ui/utils'

interface TableQueryPayload {
  page?: number
  pageSize?: number
  searchString?: string
  sortField?: string
  sortOrder?: string
  filters?: {
    includeHidden?: boolean[],
    model?: string[]
  }
}
const sortableFields = ['serialNumber', 'model', 'shipDate', 'createdDate', 'visibleStatus']

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
    getApProvisions: build.query<TableResult<DeviceProvision>, RequestPayload>({
      query: ({ params, payload }) => {
        const queryParams = new URLSearchParams()
        const tablePayload = payload as TableQueryPayload
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
          queryParams.append('sortColumn', tablePayload.sortField)
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

        const queryString = queryParams.toString()
        const url = queryString
          ? `${DeviceProvisionUrlsInfo.getApProvisions.url}?${queryString}`
          : DeviceProvisionUrlsInfo.getApProvisions.url

        const req = createHttpRequest({
          ...DeviceProvisionUrlsInfo.getApProvisions,
          url
        }, params)

        return {
          ...req
        }
      },
      transformResponse: (response: unknown) => {
        const responseData = response as Record<string, unknown>
        const items = (responseData.content || responseData.data || []) as DeviceProvision[]
        const pageable = responseData.pageable as Record<string, unknown>
        const currentPage = (pageable?.pageNumber as number || responseData.page as number || 1)
        const totalItems = (responseData.totalElements || responseData.totalCount || 0) as number
        items.forEach((item) => {
          item.includeHidden = true
        })

        return {
          data: items,
          fields: [],
          page: currentPage,
          totalCount: totalItems
        }
      },
      providesTags: [{ type: 'deviceProvision', id: 'AP_PROVISIONS' }]
    }),
    getSwitchProvisions: build.query<TableResult<DeviceProvision>, RequestPayload>({
      query: ({ params, payload }) => {
        const queryParams = new URLSearchParams()
        const tablePayload = payload as TableQueryPayload
        if (tablePayload?.page) {
          queryParams.append('page', tablePayload.page.toString())
        }
        if (tablePayload?.pageSize) {
          queryParams.append('size', tablePayload.pageSize.toString())
        }
        if (tablePayload?.searchString) {
          queryParams.append('searchText', tablePayload.searchString)
        }
        if (tablePayload?.sortField && sortableFields.includes(tablePayload.sortField)) {
          queryParams.append('sortColumn', tablePayload.sortField)
        }
        if (tablePayload?.sortOrder) {
          queryParams.append('order', tablePayload.sortOrder)
        }
        if (tablePayload?.filters?.includeHidden !== undefined
          && tablePayload.filters.includeHidden[0] === true) {
          queryParams.append('includeHidden', 'true')
        }
        if (tablePayload?.filters?.model !== undefined) {
          tablePayload.filters.model.forEach((m) => {
            queryParams.append('filterModels', m)
          })
        }

        const queryString = queryParams.toString()
        const url = queryString
          ? `${DeviceProvisionUrlsInfo.getSwitchProvisions.url}?${queryString}`
          : DeviceProvisionUrlsInfo.getSwitchProvisions.url

        const req = createHttpRequest({
          ...DeviceProvisionUrlsInfo.getSwitchProvisions,
          url
        }, params)

        return {
          ...req
        }
      },
      transformResponse: (response: unknown) => {
        const responseData = response as Record<string, unknown>
        const items = (responseData.content || responseData.data || []) as DeviceProvision[]
        const pageable = responseData.pageable as Record<string, unknown>
        const currentPage = (pageable?.pageNumber as number || responseData.page as number || 1)
        const totalItems = (responseData.totalElements || responseData.totalCount || 0) as number
        items.forEach((item) => {
          item.includeHidden = true
        })

        return {
          data: items,
          fields: [],
          page: currentPage,
          totalCount: totalItems
        }
      },
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
  useGetApProvisionsQuery,
  useLazyGetApProvisionsQuery,
  useGetSwitchProvisionsQuery,
  useLazyGetSwitchProvisionsQuery,
  useImportApProvisionsMutation,
  useImportSwitchProvisionsMutation,
  useHideApProvisionsMutation,
  useHideSwitchProvisionsMutation
} = deviceProvisionApi
