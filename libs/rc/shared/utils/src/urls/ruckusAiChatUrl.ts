import { ApiInfo } from '@acx-ui/utils'

export const RuckusAiChatUrlInfo: { [key: string]: ApiInfo } = {
  chats: {
    method: 'post',
    url: '/ruckusAi/chats',
    newApi: true
  },
  histories: {
    method: 'post',
    url: '/ruckusAi/chats/histories',
    newApi: true
  }
}
