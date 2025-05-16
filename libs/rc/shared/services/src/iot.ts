import {
  onSocketActivityChanged,
  onActivityMessageReceived,
  CommonResult,
  TableResult,
  IotControllerDashboard,
  IotControllerSetting,
  IotControllerStatus,
  IotSerialNumberResult,
  IotUrlsInfo
} from '@acx-ui/rc/utils'
import { baseIotApi }     from '@acx-ui/store'
import { RequestPayload } from '@acx-ui/types'
import {
  createHttpRequest,
  ignoreErrorModal
} from '@acx-ui/utils'

export const iotApi = baseIotApi.injectEndpoints({
  endpoints: (build) => ({
    getIotControllerList: build.query<TableResult<IotControllerStatus>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(IotUrlsInfo.getIotControllerList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'IotController', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddIotController',
            'DeleteIotController',
            'UpdateIotController'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(iotApi.util.invalidateTags([{ type: 'IotController', id: 'LIST' }]))
          })
        })
      }
    }),
    addIotController: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(IotUrlsInfo.addIotController)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [
        { type: 'IotController', id: 'LIST' }
      ]
    }),
    getIotController: build.query<IotControllerSetting, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(IotUrlsInfo.getIotController, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'IotController', id: 'DETAIL' }]
    }),
    updateIotController: build.mutation<IotControllerSetting, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(IotUrlsInfo.updateIotController, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'IotController', id: 'LIST' }]
    }),
    deleteIotController: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(IotUrlsInfo.deleteIotController, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'IotController', id: 'LIST' }]
    }),
    testConnectionIotController: build.mutation<IotSerialNumberResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(IotUrlsInfo.testConnectionIotController,
          undefined,
          { ...ignoreErrorModal }
        )
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    refreshIotController: build.mutation<void, void>({
      queryFn: async () => {
        return { data: undefined }
      },
      invalidatesTags: [{ type: 'IotController', id: 'DETAIL' }]
    }),
    iotControllerDashboard: build.query<IotControllerDashboard, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(IotUrlsInfo.getIotControllerDashboard, params),
          body: payload
        }
      },
      providesTags: [{ type: 'IotController', id: 'Overview' }]
    })
  })
})

export const {
  useGetIotControllerListQuery,
  useLazyGetIotControllerListQuery,
  useAddIotControllerMutation,
  useGetIotControllerQuery,
  useLazyGetIotControllerQuery,
  useUpdateIotControllerMutation,
  useDeleteIotControllerMutation,
  useTestConnectionIotControllerMutation,
  useRefreshIotControllerMutation,
  useIotControllerDashboardQuery
} = iotApi
