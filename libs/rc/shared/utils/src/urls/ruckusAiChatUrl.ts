import { ApiInfo } from '@acx-ui/utils'

export const RuckusAiChatUrlInfo: { [key: string]: ApiInfo } = {
  chats: {
    method: 'post',
    url: '/ruckusAi/chats',
    newApi: true
  },
  chart: {
    method: 'get',
    url: '/ruckusAi/chats/:sessionId/charts/:chatId',
    newApi: true
  }
}
