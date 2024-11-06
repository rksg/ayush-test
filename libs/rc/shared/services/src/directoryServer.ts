import {
  CommonResult,
  TableResult,
  DirectoryServerUrls,
  DirectoryServer,
  onSocketActivityChanged,
  onActivityMessageReceived, DirectoryServerViewData, DirectoryServerDiagnosisCommand
} from '@acx-ui/rc/utils'
import { baseDirectoryServerApi }                        from '@acx-ui/store'
import { RequestPayload }                                from '@acx-ui/types'
import { batchApi, createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

export const directoryServerApi = baseDirectoryServerApi.injectEndpoints({
  endpoints: (build) => ({
    createDirectoryServer: build.mutation<CommonResult, RequestPayload<DirectoryServer>>({
      query: ({ payload }) => {
        const req = createHttpRequest(DirectoryServerUrls.createDirectoryServer)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [
        { type: 'DirectoryServer', id: 'LIST' },
        { type: 'DirectoryServer', id: 'Options' }]
    }),
    // eslint-disable-next-line max-len
    getDirectoryServerViewDataList: build.query<TableResult<DirectoryServerViewData>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(DirectoryServerUrls.getDirectoryServerViewDataList)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'DirectoryServer', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddDirectoryServerProfile',
            'UpdateDirectoryServerProfile',
            'DeleteDirectoryServerProfile',
            'ActivateDirectoryServerProfileOnWifiNetwork'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(
              directoryServerApi.util.invalidateTags([
                { type: 'DirectoryServer', id: 'LIST' },
                { type: 'DirectoryServer', id: 'Options' }
              ])
            )
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    deleteDirectoryServer: build.mutation<CommonResult, RequestPayload<string[]>>({
      queryFn: async ({ payload }, _queryApi, _extraOptions, fetchWithBQ) => {
        const requests = payload!.map(policyId => ({ params: { policyId } }))
        await batchApi(DirectoryServerUrls.deleteDirectoryServer, requests, fetchWithBQ)
        return { data: {} as CommonResult }
      },
      invalidatesTags: [{ type: 'DirectoryServer', id: 'LIST' }]
    }),
    getDirectoryServerById: build.query<DirectoryServer, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(DirectoryServerUrls.getDirectoryServer, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'DirectoryServer', id: 'DETAIL' }]
    }),
    updateDirectoryServer: build.mutation<CommonResult, RequestPayload<DirectoryServer>>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(DirectoryServerUrls.updateDirectoryServer, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'DirectoryServer', id: 'LIST' }]
    }),
    activateDirectoryServer: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(DirectoryServerUrls.activateDirectoryServer, params)
      },
      invalidatesTags: [
        { type: 'DirectoryServer', id: 'LIST' },
        { type: 'DirectoryServer', id: 'Options' }]
    }),
    // eslint-disable-next-line max-len
    testConnectionDirectoryServer: build.mutation<CommonResult, RequestPayload<DirectoryServerDiagnosisCommand>>({
      query: ({ payload }) => {
        const req = createHttpRequest(DirectoryServerUrls.testConnectionDirectoryServer,
          undefined,
          { ...ignoreErrorModal }
        )
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    })
  })
})


export const {
  useCreateDirectoryServerMutation,
  useGetDirectoryServerByIdQuery,
  useGetDirectoryServerViewDataListQuery,
  useLazyGetDirectoryServerViewDataListQuery,
  useDeleteDirectoryServerMutation,
  useUpdateDirectoryServerMutation,
  useActivateDirectoryServerMutation,
  useTestConnectionDirectoryServerMutation
} = directoryServerApi
