import { ApiInfo } from '@acx-ui/utils'

export const RuckusAssistantUrlInfo: { [key: string]: ApiInfo } = {
  startConversations: {
    method: 'post',
    url: '/ruckusAssistant/conversations/start',
    newApi: true
  },
  updateConversations: {
    method: 'post',
    url: '/ruckusAssistant/conversations/:sessionId/:type',
    newApi: true
  },
  applyConversations: {
    method: 'post',
    url: '/ruckusAssistant/conversations/:sessionId/apply',
    newApi: true
  }
}
