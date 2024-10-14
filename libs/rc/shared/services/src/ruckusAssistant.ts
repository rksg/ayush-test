import {
  GptConversation,
  RuckusAssistantUrlInfo
} from '@acx-ui/rc/utils'
import { baseRuckusAssistantApi } from '@acx-ui/store'
import { RequestPayload }         from '@acx-ui/types'
import { createHttpRequest }      from '@acx-ui/utils'

export const ruckusAssistantApi = baseRuckusAssistantApi.injectEndpoints({
  endpoints: (build) => ({
    startConversations: build.mutation<GptConversation, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(RuckusAssistantUrlInfo.startConversations)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateSsidProfile: build.mutation<GptConversation, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(RuckusAssistantUrlInfo.updateSsidProfile, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateSsid: build.mutation<GptConversation, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(RuckusAssistantUrlInfo.updateSsid, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateVlan: build.mutation<GptConversation, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(RuckusAssistantUrlInfo.updateVlan, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    applyConversations: build.mutation<GptConversation, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RuckusAssistantUrlInfo.applyConversations, params)
        return {
          ...req,
          body: JSON.stringify({})
        }
      }
    })
  })
})

export const {
  useStartConversationsMutation,
  useApplyConversationsMutation,
  useUpdateSsidProfileMutation,
  useUpdateSsidMutation,
  useUpdateVlanMutation
} = ruckusAssistantApi
