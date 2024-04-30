import { rest } from 'msw'

import { WifiUrlsInfo }                from '@acx-ui/rc/utils'
import { Provider }                    from '@acx-ui/store'
import { mockServer, render, waitFor } from '@acx-ui/test-utils'

import { mockCcdDataAnotherAp, mockCcdDataFail, mockCcdDataNoAp, mockCcdDataSuccess, mockedSocket } from './__tests__/fixtures'
import { CcdResultViewer }                                                                          from './CcdResultViewer'


const mockedInitCcdSocketFn = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  initCcdSocket: (subscriptionId: string, handler: (msg: string) => void) => {
    return mockedInitCcdSocketFn(subscriptionId, handler)
  },
  closeCcdSocket: () => jest.fn()
}))


describe('CcdResultViewer', () => {
  const venueId = '_VENUE_ID_'
  const clientMac = '11:11:11:11:11:11'
  const aps = ['22:22:22:22:22:22']

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    mockedInitCcdSocketFn.mockRestore()
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  beforeEach(() => {
    mockServer.use(
      rest.post(
        WifiUrlsInfo.runCcd.url,
        (_, res, ctx) => res(ctx.json({ requestId: '123456789' }))
      )
    )
  })

  it('Get Success CCD data after clicking Start', async () => {
    const state = 'START'
    const payload = {
      state,
      clientMac,
      aps
    }

    mockedInitCcdSocketFn.mockImplementation((requestId: string,
      handler: (msg: string) => void) => {
      const fakeMsg = {
        message: JSON.stringify(mockCcdDataSuccess)
      }
      setTimeout(handler, 0, JSON.stringify(fakeMsg)) // Simulate receving the message from websocket
      return mockedSocket
    })

    render(
      <Provider>
        <CcdResultViewer
          state={state}
          venueId={venueId}
          payload={payload}
        />
      </Provider>
    )

    await waitFor(() => expect(mockedInitCcdSocketFn).toHaveBeenCalled())
  })

  it('Get Fail CCD data after clicking Start', async () => {
    const state = 'START'
    const payload = {
      state,
      clientMac,
      aps
    }

    mockedInitCcdSocketFn.mockImplementation((requestId: string,
      handler: (msg: string) => void) => {
      const fakeMsg = {
        message: JSON.stringify(mockCcdDataFail)
      }
      setTimeout(handler, 0, JSON.stringify(fakeMsg)) // Simulate receving the message from websocket
      return mockedSocket
    })

    render(
      <Provider>
        <CcdResultViewer
          state={state}
          venueId={venueId}
          payload={payload}
        />
      </Provider>
    )

    await waitFor(() => expect(mockedInitCcdSocketFn).toHaveBeenCalled())
  })

  it('Get Another AP CCD data after clicking Start', async () => {
    const state = 'START'
    const payload = {
      state,
      clientMac,
      aps
    }

    mockedInitCcdSocketFn.mockImplementation((requestId: string,
      handler: (msg: string) => void) => {
      const fakeMsg = {
        message: JSON.stringify(mockCcdDataAnotherAp)
      }
      setTimeout(handler, 0, JSON.stringify(fakeMsg)) // Simulate receving the message from websocket
      return mockedSocket
    })

    render(
      <Provider>
        <CcdResultViewer
          state={state}
          venueId={venueId}
          payload={payload}
        />
      </Provider>
    )

    await waitFor(() => expect(mockedInitCcdSocketFn).toHaveBeenCalled())
  })

  it('Get no AP MAC CCD data after clicking Start', async () => {
    const state = 'START'
    const payload = {
      state,
      clientMac,
      aps
    }

    mockedInitCcdSocketFn.mockImplementation((requestId: string,
      handler: (msg: string) => void) => {
      const fakeMsg = {
        message: JSON.stringify(mockCcdDataNoAp)
      }
      setTimeout(handler, 0, JSON.stringify(fakeMsg)) // Simulate receving the message from websocket
      return mockedSocket
    })

    render(
      <Provider>
        <CcdResultViewer
          state={state}
          venueId={venueId}
          payload={payload}
        />
      </Provider>
    )

    await waitFor(() => expect(mockedInitCcdSocketFn).toHaveBeenCalled())
  })


  it('should render correctly after clicking Stop', async () => {
    const state = 'STOP'
    const payload = {
      state,
      clientMac,
      aps
    }

    mockedInitCcdSocketFn.mockImplementation((requestId: string,
      handler: (msg: string) => void) => {
      setTimeout(handler, 0) // Simulate receving the message from websocket
      return mockedSocket
    })

    render(
      <Provider>
        <CcdResultViewer
          state={state}
          venueId={venueId}
          payload={payload}
        />
      </Provider>
    )

    await waitFor(() => expect(mockedInitCcdSocketFn).not.toHaveBeenCalled())
  })

  it('should render correctly after clicking Clear', async () => {
    const state = 'CLEAR'
    const mockCleanCcdAps = jest.fn()

    render(
      <Provider>
        <CcdResultViewer
          state={state}
          venueId={venueId}
          cleanCcdAps={mockCleanCcdAps}
        />
      </Provider>
    )

    await waitFor(() => expect(mockCleanCcdAps).toHaveBeenCalled())
  })
})
