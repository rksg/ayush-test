import { CatchErrorResponse } from '@acx-ui/rc/utils'
import { act, renderHook }    from '@acx-ui/test-utils'

import { DetectionStatus, useApNeighbors } from './useApNeighbors'

export const mockedSocket = {
  on: jest.fn(),
  off: jest.fn(),
  disconnect: jest.fn(),
  disconnected: false
}

const mockedInitPokeSocketFn = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  initPokeSocket: (requestId: string, handler: () => void) => {
    return mockedInitPokeSocketFn(requestId, handler)
  },
  closePokeSocket: () => jest.fn()
}))

const mockedShowToast = jest.fn()
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: (message: string) => mockedShowToast(message)
}))

describe('useApNeighbors', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should trigger the handler when receiving the message from websocket', async () => {
    const clearTimeoutFn = jest.spyOn(global, 'clearTimeout')
    const tempHandlerFn = jest.fn()
    mockedInitPokeSocketFn.mockImplementation((requestId: string, handler: () => void) => {
      tempHandlerFn.mockImplementation(handler)
      return mockedSocket
    })

    const handlerFn = jest.fn()
    const { result } = renderHook(() => useApNeighbors('', handlerFn))

    expect(result.current.detectionStatus).toBe(DetectionStatus.IDLE)

    await act(() => result.current.setRequestId('REQUEST_ID'))

    expect(result.current.detectionStatus).toBe(DetectionStatus.FETCHING)

    await act(() => tempHandlerFn()) // Simulate receving the message from ws and trigger the handler
    expect(handlerFn).toHaveBeenCalledTimes(1)
    expect(clearTimeoutFn).toHaveBeenCalled()
    expect(result.current.detectionStatus).toBe(DetectionStatus.COMPLETEED)
  })

  it('should trigger the handler when timeout', async () => {
    const handlerFn = jest.fn()
    const { result } = renderHook(() => useApNeighbors('', handlerFn))

    jest.useFakeTimers()

    await act(() => {
      result.current.setRequestId('REQUEST_ID')
    })

    act(() => {
      jest.runAllTimers()
    })

    expect(handlerFn).toHaveBeenCalledTimes(0)
    expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({
      content: 'The AP is not reachable',
      type: 'error'
    }))
    expect(result.current.detectionStatus).toBe(DetectionStatus.TIMEOUT)

    jest.useRealTimers()
  })

  it('should handle error correctly', () => {
    const mockedError: CatchErrorResponse = {
      data: {
        errors: [
          {
            code: 'WIFI-99999',
            message: 'error occurs'
          }
        ],
        requestId: 'REQUEST_ID'
      },
      status: 404
    }
    const { result } = renderHook(() => useApNeighbors('', jest.fn()))

    result.current.handleError(mockedError)
    expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({
      content: 'Error occurred while detecting AP',
      type: 'error'
    }))
  })
})
