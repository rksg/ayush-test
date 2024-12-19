import { ApiInfo } from '@acx-ui/utils'

export const RuckusAiChatUrlInfo: { [key: string]: ApiInfo } = {
  getAllChats: {
    method: 'get',
    url: '/ruckusAi/chats',
    newApi: true
  },
  chats: {
    method: 'post',
    url: '/ruckusAi/chats',
    newApi: true
  },
  getChat: {
    method: 'get',
    url: '/ruckusAi/chats/:sessionId',
    newApi: true
  },
  updateChat: {
    method: 'put',
    url: '/ruckusAi/chats/:sessionId',
    newApi: true
  },
  deleteChat: {
    method: 'delete',
    url: '/ruckusAi/chats/:sessionId',
    newApi: true
  },
  chart: {
    method: 'get',
    url: '/ruckusAi/chats/:sessionId/charts/:chatId',
    newApi: true
  }
}
