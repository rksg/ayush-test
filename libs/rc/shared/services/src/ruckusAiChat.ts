import {
  RuckusAiChat,
  RuckusAiChatUrlInfo,
  WidgetListData
} from '@acx-ui/rc/utils'
import { baseRuckusAiChatApi } from '@acx-ui/store'
import { RequestPayload }      from '@acx-ui/types'
import { createHttpRequest }   from '@acx-ui/utils'

export const ruckusAiChatApi = baseRuckusAiChatApi.injectEndpoints({
  endpoints: (build) => ({
    getChat: build.query<RuckusAiChat, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.getChat, params)
        return {
          ...req
        }
      }
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
  useGetChatQuery,
  useLazyGetChatQuery,
  useChatAiMutation,
  useChatChartQuery
} = ruckusAiChatApi
