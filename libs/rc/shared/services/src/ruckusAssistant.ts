import {
  CommonResult,
  RuckusAssistantUrlInfo
} from '@acx-ui/rc/utils'
import { baseRuckusAssistantApi } from '@acx-ui/store'
import { RequestPayload }             from '@acx-ui/types'
import { createHttpRequest }          from '@acx-ui/utils'

export const ruckusAssistantApi = baseRuckusAssistantApi.injectEndpoints({
  endpoints: (build) => ({
    startConversations: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(RuckusAssistantUrlInfo.startConversations)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateSsidProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(RuckusAssistantUrlInfo.updateSsidProfile)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateSsid: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(RuckusAssistantUrlInfo.updateSsid)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateVlan: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(RuckusAssistantUrlInfo.updateVlan)
        return {
          ...req,
          body: payload
        }
      }
    })
  })
})

export const {
  useStartConversationsMutation,
  useUpdateSsidProfileMutation,
  useUpdateSsidMutation,
  useUpdateVlanMutation
} = ruckusAssistantApi
