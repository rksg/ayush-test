import * as utils from '@acx-ui/utils'

import { closePokeSocket, initPokeSocket } from './pokeSocket'

const mockedSocket = {
  on: jest.fn(),
  off: jest.fn(),
  disconnect: jest.fn(),
  disconnected: false
}

jest.mock('./initialSocket', () => ({
  getIndependentSocket: () => mockedSocket
}))

describe('pokeSocket', () => {
  jest.spyOn(utils, 'getJwtToken').mockImplementationOnce(() => 'JWT1234')
  jest.spyOn(utils, 'getTenantId').mockImplementationOnce(() => 'TENANT1234')

  it('initPokeSocket', () => {
    mockedSocket.on.mockImplementation((event: string, handler: () => void) => {
      if (event === 'pokeEvent') handler()
    })
    const handler = jest.fn()
    const socket = initPokeSocket('REQUEST_ID', handler)

    expect(handler).toHaveBeenCalledTimes(1)

    closePokeSocket(socket)

    expect(mockedSocket.off).toHaveBeenCalledTimes(1)
    expect(mockedSocket.disconnect).toHaveBeenCalledTimes(1)
  })
})
