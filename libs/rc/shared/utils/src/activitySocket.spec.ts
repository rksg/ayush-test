import * as utils from '@acx-ui/utils'

import { closeActivitySocket, initActivitySocket } from './activitySocket'

const mockedSocket = {
  on: jest.fn(),
  off: jest.fn(),
  disconnected: false,
  close: jest.fn()
}

jest.mock('./initialSocket', () => ({
  getIndependentSocket: () => mockedSocket
}))

describe('activitySocket', () => {
  jest.spyOn(utils, 'getJwtToken').mockImplementationOnce(() => 'JWT123')
  jest.spyOn(utils, 'getTenantId').mockImplementationOnce(() => 'TENANT123')

  it('initActivitySocket', () => {
    mockedSocket.on.mockImplementation((event: string, handler: () => void) => {
      if (event === 'activityChangedEvent') handler()
    })
    const handler = jest.fn()
    const socket = initActivitySocket(handler)

    expect(handler).toHaveBeenCalledTimes(1)

    closeActivitySocket(socket)

    expect(mockedSocket.off).toHaveBeenCalledTimes(1)
    expect(mockedSocket.close).toHaveBeenCalledTimes(1)
  })
})
