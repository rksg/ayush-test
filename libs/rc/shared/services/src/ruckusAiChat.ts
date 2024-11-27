import {
  RuckusAiChatResponse,
  RuckusAiChatUrlInfo
} from '@acx-ui/rc/utils'
import { baseRuckusAiChatApi } from '@acx-ui/store'
import { RequestPayload }      from '@acx-ui/types'
import { createHttpRequest }   from '@acx-ui/utils'

export const ruckusAiChatApi = baseRuckusAiChatApi.injectEndpoints({
  endpoints: (build) => ({
    chats: build.mutation<RuckusAiChatResponse, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(RuckusAiChatUrlInfo.chats)
        return {
          ...req,
          body: payload
        }
      }
    })
  })
})

export const {
  useChatsMutation
} = ruckusAiChatApi
