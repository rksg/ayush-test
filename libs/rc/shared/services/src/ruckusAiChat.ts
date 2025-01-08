import {
  RuckusAiChat,
  RuckusAiChatUrlInfo,
  WidgetListData,
  ChatHistory
} from '@acx-ui/rc/utils'
import { baseRuckusAiChatApi } from '@acx-ui/store'
import { RequestPayload }      from '@acx-ui/types'
import { createHttpRequest }   from '@acx-ui/utils'

export const ruckusAiChatApi = baseRuckusAiChatApi.injectEndpoints({
  endpoints: (build) => ({
    getAllChats: build.query<ChatHistory[], RequestPayload>({
      query: () => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.getAllChats)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Chat', id: 'LIST' }]
    }),
    getChat: build.query<RuckusAiChat, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.getChat, params)
        return {
          ...req
        }
      }
    }),
    updateChat: build.mutation<RuckusAiChat, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.updateChat, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Chat', id: 'LIST' }]
    }),
    deleteChat: build.mutation<RuckusAiChat, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.deleteChat, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Chat', id: 'LIST' }]
    }),
    chatAi: build.mutation<RuckusAiChat, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.chats)
        return {
          ...req,
          body: payload
        }
      }
    }),
    chatChart: build.query<WidgetListData, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.chart, params)
        return {
          ...req
        }
      }
    })
  })
})

export const {
  useGetAllChatsQuery,
  useGetChatQuery,
  useLazyGetChatQuery,
  useChatAiMutation,
  useUpdateChatMutation,
  useDeleteChatMutation,
  useChatChartQuery
} = ruckusAiChatApi
