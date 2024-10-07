import { ApiInfo } from '@acx-ui/utils'

export const RuckusAssistantUrlInfo: { [key: string]: ApiInfo } = {
  startConversations: {
    method: 'post',
    url: '/ruckusAssistant/conversations/start',
    newApi: true
  },
  updateSsidProfile: {
    method: 'post',
    url: '/ruckusAssistant/conversations/:sessionId/ssidProfile',
    newApi: true
  },
  updateSsid: {
    method: 'post',
    url: '/ruckusAssistant/conversations/:sessionId/ssid',
    newApi: true
  },
  updateVlan: {
    method: 'post',
    url: '/ruckusAssistant/conversations/:sessionId/vlan',
    newApi: true
  },
  applyConversations: {
    method: 'post',
    url: '/ruckusAssistant/conversations/:sessionId/apply',
    newApi: true
  }
}
