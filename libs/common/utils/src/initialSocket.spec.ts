import io from 'socket.io-client'

import { mockWebsocketServer } from '@acx-ui/test-utils'

import { initialSocket, offActivity, onActivity, websocketServerUrl } from './initialSocket'
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn((event: string, callback: ((...data: string[]) => void)) => {
    mockSocket.on(event, callback)
  }),
  connect: io.connect,
  disconnect: jest.fn(),
  id: 'mockId',
  connected: true,
  disconnected: false,
  binaryType: 'blob',
  io: io.Socket
}


jest.mock('socket.io-client', () => {
  return jest.fn(() => mockSocket)
})


describe('Test websocket', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should connect websocket correctly', async () => {
    const url = `ws://localhost${websocketServerUrl}/`
    mockWebsocketServer(url)

    const client = initialSocket()

    client.send('hello')
  })

  it('initializes socket with the correct URL', () => {
    require('@acx-ui/config').getJwtToken = jest.fn().mockImplementation(() => 'mockToken')
    require('./getTenantId').getTenantId = jest.fn().mockImplementation(() => 'mockTenantId')

    initialSocket()

    const expectedUrl = '/activity?token=mockToken&tenantId=mockTenantId'

    expect(mockSocket.connect).toHaveBeenCalledWith(expectedUrl, {
      path: websocketServerUrl,
      secure: true,
      transports: ['websocket'],
      rejectUnauthorized: false,
      reconnection: true,
      reconnectionDelay: 1500,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000,
      forceNew: true
    })

    const mockCallback = jest.fn()
    onActivity(mockCallback)

    mockSocket.emit('activityChangedEvent', () => 'random')

    expect(mockSocket.on).toHaveBeenCalledWith('activityChangedEvent', expect.any(Function))

    offActivity(mockCallback)

  })

})
