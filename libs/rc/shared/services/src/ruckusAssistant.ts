import {
  RuckusAiConfiguration,
  RuckusAiConversation,
  NetworkSaveData,
  RuckusAssistantUrlInfo,
  Vlan
} from '@acx-ui/rc/utils'
import { baseRuckusAssistantApi } from '@acx-ui/store'
import { RequestPayload }         from '@acx-ui/types'
import { createHttpRequest }      from '@acx-ui/utils'

export const ruckusAssistantApi = baseRuckusAssistantApi.injectEndpoints({
  endpoints: (build) => ({
    startConversations: build.mutation<RuckusAiConversation, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(RuckusAssistantUrlInfo.startConversations)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateConversations: build.mutation<RuckusAiConversation, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(RuckusAssistantUrlInfo.updateConversations, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    deleteOnboardConfigs: build.mutation<RuckusAiConversation, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RuckusAssistantUrlInfo.deleteOnboardConfigs, params)
        return {
          ...req
        }
      }
    }),
    applyConversations: build.mutation<RuckusAiConversation, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RuckusAssistantUrlInfo.applyConversations, params)
        return {
          ...req,
          body: JSON.stringify({})
        }
      }
    }),
    createOnboardConfigs: build.mutation<RuckusAiConfiguration, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(RuckusAssistantUrlInfo.createOnboardConfigs)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateOnboardConfigs: build.mutation<RuckusAiConversation, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(RuckusAssistantUrlInfo.updateOnboardConfigs, params)
        return {
          ...req,
          body: payload
        }
      }
    }),

    getOnboardConfigs: build.query<NetworkSaveData, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RuckusAssistantUrlInfo.getOnboardConfigs, params)
        return {
          ...req
        }
      },
      keepUnusedDataFor: 0,
      transformResponse: (response: RuckusAiConfiguration) => {
        return JSON.parse(response.content) as NetworkSaveData
      }
    }),
    getVlanOnboardConfigs: build.query<Vlan, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RuckusAssistantUrlInfo.getOnboardConfigs, params)
        return {
          ...req
        }
      },
      transformResponse: (response: RuckusAiConfiguration) => {
        return JSON.parse(response.content) as Vlan
      }
    })
  })
})

export const {
  useStartConversationsMutation,
  useApplyConversationsMutation,
  useUpdateConversationsMutation,
  useCreateOnboardConfigsMutation,
  useUpdateOnboardConfigsMutation,
  useDeleteOnboardConfigsMutation,
  useGetOnboardConfigsQuery,
  useLazyGetOnboardConfigsQuery,
  useGetVlanOnboardConfigsQuery,
  useLazyGetVlanOnboardConfigsQuery
} = ruckusAssistantApi
