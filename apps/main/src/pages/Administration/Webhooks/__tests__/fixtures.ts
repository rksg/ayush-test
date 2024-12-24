export const fakeWebhooks = {
  totalCount: 3,
  page: 1,
  fields: ['name', 'url', 'payload', 'status'],
  data: [
    {
      id: '701fe9df5f6b4c17928a29851c07cc04',
      name: 'commscope',
      url: 'http://www.commscope.com',
      payload: 'RUCKUS',
      status: 'ON'
    },
    {
      id: '701fe9df5f6b4c17928a29851c07cc04',
      name: 'slack',
      url: 'http://slack.com',
      payload: 'SLACK',
      status: 'ON'
    },
    {
      id: '701fe9df5f6b4c17928a29851c07cc04',
      name: 'microsoft',
      url: 'http://microsoft.com',
      payload: 'MICROSOFT_TEAM',
      status: 'OFF'
    }
  ]
}

export const fakeWebhookEntry = {
  id: '701fe9df5f6b4c17928a29851c07cc04',
  name: 'commscope',
  url: 'http://www.commscope.com',
  payload: 'RUCKUS',
  secret: 'secret123',
  incident: {
    severity: ['P1', 'P2']
  },
  activity: {
    product: ['WIFI', 'SWITCH']
  },
  event: {
    severity: ['CRITICAL', 'WARNING'],
    type: ['AP', 'CLIENT', 'PROFILE'],
    product: ['GENERAL']
  },
  status: 'ON'
}
