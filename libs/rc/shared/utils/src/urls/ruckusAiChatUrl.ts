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
  getChats: {
    method: 'post',
    url: '/ruckusAi/chats/:sessionId/histories/query',
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
  },
  getCanvas: {
    method: 'get',
    url: '/ruckusAi/canvas',
    newApi: true
  },
  createCanvas: {
    method: 'post',
    url: '/ruckusAi/canvas',
    newApi: true
  },
  updateCanvas: {
    method: 'put',
    url: '/ruckusAi/canvas/:canvasId',
    newApi: true
  },
  createWidget: {
    method: 'post',
    url: '/ruckusAi/canvas/:canvasId/widgets',
    newApi: true
  },
  getWidget: {
    method: 'get',
    url: '/ruckusAi/canvas/:canvasId/widgets/:widgetId',
    newApi: true
  },
  updateWidget: {
    method: 'put',
    url: '/ruckusAi/canvas/:canvasId/widgets/:widgetId',
    newApi: true
  }
}
