import {
  RuckusAiChat,
  RuckusAiChatUrlInfo,
  WidgetListData,
  ChatHistory,
  Canvas,
  RuckusAiChats
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
    getChats: build.mutation<RuckusAiChats, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.getChats, params)
        return {
          ...req,
          body: payload
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
    getCanvas: build.query<Canvas[], RequestPayload>({
      query: () => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.getCanvas)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Canvas', id: 'LIST' }]
    }),
    getCanvasById: build.query<Canvas, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.getCanvasById, params)
        return {
          ...req
        }
      }
    }),
    updateCanvas: build.mutation<Canvas, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.updateCanvas, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Canvas', id: 'LIST' }]
    }),
    deleteCanvas: build.mutation<Canvas, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.deleteCanvas, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Canvas', id: 'LIST' }]
    }),
    createCanvas: build.mutation<Canvas, RequestPayload>({
      query: () => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.createCanvas)
        return {
          ...req,
          body: {}
        }
      },
      invalidatesTags: [{ type: 'Canvas', id: 'LIST' }]
    }),
    chatAi: build.mutation<RuckusAiChat, RequestPayload>({
      query: ({ payload, customHeaders }) => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.chats, undefined, customHeaders)
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
    }),
    getWidget: build.query<WidgetListData, RequestPayload>({
      query: ({ params, customHeaders }) => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.getWidget, params, customHeaders)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Widget', id: 'DATA' }]
    }),
    createWidget: build.mutation<{ id: string, name: string }, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.createWidget, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateWidget: build.mutation<WidgetListData, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.updateWidget, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Widget', id: 'DATA' }]
    }),
    sendFeedback: build.mutation({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.sendFeedback, params)
        return {
          ...req,
          body: payload
        }
      }
    })
  })
})

export const {
  useGetAllChatsQuery,
  useGetChatQuery,
  useLazyGetChatQuery,
  useGetChatsMutation,
  useGetCanvasQuery,
  useLazyGetCanvasQuery,
  useLazyGetCanvasByIdQuery,
  useUpdateCanvasMutation,
  useDeleteCanvasMutation,
  useCreateCanvasMutation,
  useChatAiMutation,
  useUpdateChatMutation,
  useDeleteChatMutation,
  useChatChartQuery,
  useGetWidgetQuery,
  useCreateWidgetMutation,
  useUpdateWidgetMutation,
  useSendFeedbackMutation
} = ruckusAiChatApi
