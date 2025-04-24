import {
  CommonResult,
  TableResult,
  IotControllerSetting,
  IotControllerStatus,
  IotUrlsInfo
} from '@acx-ui/rc/utils'
import { baseIotApi }     from '@acx-ui/store'
import { RequestPayload } from '@acx-ui/types'
import {
  createHttpRequest,
  getEnabledDialogImproved,
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
      providesTags: [{ type: 'IotController', id: 'LIST' }]
    }),
    addIotController: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(IotUrlsInfo.addIotController, params, getEnabledDialogImproved() ? {} : {
          ...ignoreErrorModal
        })
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
    deleteIotController: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(IotUrlsInfo.deleteIotController, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'IotController', id: 'LIST' }]
    })
  })
})

export const {
  useGetIotControllerListQuery,
  useGetIotControllerQuery,
  useLazyGetIotControllerQuery,
  useDeleteIotControllerMutation
} = iotApi
