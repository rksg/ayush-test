import {
  onSocketActivityChanged,
  onActivityMessageReceived,
  ActivePluginsData,
  CommonResult,
  CommonRbacUrlsInfo,
  TableResult,
  RcapLicenseUtilizationData,
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

const iotControllerList = {
  requestId: '4cde2a1a-f916-4a19-bcac-869620d7f96f',
  response: {
    data: [{
      id: 'bbc41563473348d29a36b76e95c50381',
      name: 'ruckusdemos',
      inboundAddress: '192.168.1.1',
      iotSerialNumber: 'rewqfdsafasd',
      publicAddress: 'ruckusdemos.cloud',
      publicPort: 443,
      apiToken: 'xxxxxxxxxxxxxxxxxxx',
      tenantId: '3f10af1401b44902a88723cb68c4bc77',
      assocVenueIds: ['db2b80ba868c419fb5c1732575160808', 'e54374d158664f9295c4d7508225c582']
    }, {
      id: 'e0dfcc8c-e328-4969-b5de-10aa91b98b82',
      name: 'iotController1',
      inboundAddress: '192.168.2.21',
      iotSerialNumber: 'jfsdjoiasdfjo',
      publicAddress: '35.229.207.4',
      publicPort: 443,
      apiToken: 'xxxxxxxxxxxxxxxxxxx',
      tenantId: '3f10af1401b44902a88723cb68c4bc77',
      assocVenueIds: ['db2b80ba868c419fb5c1732575160808', 'e54374d158664f9295c4d7508225c582']
    }] as IotControllerStatus[]
  }
}


export const iotApi = baseIotApi.injectEndpoints({
  endpoints: (build) => ({
    getIotControllerList: build.query<TableResult<IotControllerStatus>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(CommonRbacUrlsInfo.getRwgList, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse: ({ response }) => {
        // const _res: IotControllerStatus[] = response.data.map((controller: IotControllerStatus) => {
        //   return {
        //     ...controller,
        //     rowId: controller.id
        //   }
        // })
        // eslint-disable-next-line max-len
        const _res: IotControllerStatus[] = iotControllerList.response.data.map((controller: IotControllerStatus) => {
          return {
            ...controller,
            rowId: controller.id
          }
        })

        return {
          data: _res,
          totalCount: response.totalCount,
          page: response.page
        }
      },
      keepUnusedDataFor: 0,
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
    getIotController: build.query<IotControllerStatus, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(CommonRbacUrlsInfo.getRwgList, params)
        // const req = createHttpRequest(IotUrlsInfo.getIotController, params)
        return {
          ...req
        }
      },
      transformResponse: () => {
        return iotControllerList.response.data[1]
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
      invalidatesTags: [{ type: 'IotController', id: 'Overview' }]
    }),
    iotControllerLicenseStatus: build.query<RcapLicenseUtilizationData, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(IotUrlsInfo.getIotControllerLicenseStatus, params),
          body: payload
        }
      },
      providesTags: [{ type: 'IotController', id: 'Overview' }]
    }),
    iotControllerDashboard: build.query<IotControllerDashboard, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(IotUrlsInfo.getIotControllerDashboard, params),
          body: payload
        }
      },
      providesTags: [{ type: 'IotController', id: 'Overview' }]
    }),
    iotControllerPlugins: build.query<ActivePluginsData, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(IotUrlsInfo.getIotControllerPlugins, params),
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
  useIotControllerLicenseStatusQuery,
  useIotControllerDashboardQuery,
  useIotControllerPluginsQuery
} = iotApi
