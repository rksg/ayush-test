import { initialSocket }                       from './initialSocket'
import { initializeSockets, reconnectSockets } from './socketManager'

const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  disconnect: jest.fn(),
  close: jest.fn()
}

describe('socketManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(require('./initialSocket'),
      'initialSocket').mockImplementation(() => mockSocket)
  })

  it('should initialize sockets correctly', () => {
    initializeSockets()
    expect(initialSocket).toHaveBeenCalled()
  })

  it('should reconnect sockets correctly', () => {
    initializeSockets()
    reconnectSockets()
    expect(mockSocket.off).toHaveBeenCalledWith('activityChangedEvent')
    expect(mockSocket.disconnect).toHaveBeenCalled()
    expect(mockSocket.close).toHaveBeenCalled()
    expect(initialSocket).toHaveBeenCalledTimes(2)
  })
})
