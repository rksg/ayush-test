import { closeCcdSocket, initCcdSocket } from './ccdSocket'

const mockedSocket = {
  on: jest.fn(),
  off: jest.fn(),
  disconnected: false,
  close: jest.fn()
}

jest.mock('./initialSocket', () => ({
  getIndependentSocket: () => mockedSocket
}))

describe('ccdSocket', () => {

  it('initPokeSocket', () => {
    mockedSocket.on.mockImplementation((event: string, handler: () => void) => {
      if (event === 'ccdEvent') handler()
    })
    const handler = jest.fn()
    const socket = initCcdSocket('REQUEST_ID', handler)

    expect(handler).toHaveBeenCalledTimes(1)

    closeCcdSocket(socket)

    expect(mockedSocket.off).toHaveBeenCalledTimes(1)
    expect(mockedSocket.close).toHaveBeenCalledTimes(1)
  })
})
