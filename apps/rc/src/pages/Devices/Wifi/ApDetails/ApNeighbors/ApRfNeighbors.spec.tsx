import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                                 from '@acx-ui/store'
import { act, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { ApContextProvider } from '../ApContextProvider'

import { mockedAp, mockedApRfNeighbors, mockedSocket, tabPath } from './__tests__/fixtures'
import ApRfNeighbors, { compareChannelAndSnr }                  from './ApRfNeighbors'
import { defaultSocketTimeout }                                 from './constants'

import { apNeighborValueRender } from '.'

const mockedInitPokeSocketFn = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  initPokeSocket: (subscriptionId: string, handler: () => void) => {
    return mockedInitPokeSocketFn(subscriptionId, handler)
  },
  closePokeSocket: () => jest.fn()
}))

const wrapper = (props: { children: JSX.Element }) => <Provider>
  <ApContextProvider {...props} />
</Provider>
describe('ApRfNeighbors', () => {
  const params = {
    tenantId: 'fe8d6c89c852473ea343c9a0fa66829b',
    apId: mockedAp.data[0].serialNumber,
    activeSubTab: 'rf'
  }

  beforeEach(() => {
    mockedInitPokeSocketFn.mockImplementation(() => mockedSocket)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ ...mockedAp }))
      ),
      rest.get(
        WifiUrlsInfo.getApRfNeighbors.url,
        (_, res, ctx) => res(ctx.json({ ...mockedApRfNeighbors }))
      ),
      rest.patch(
        WifiUrlsInfo.detectApNeighbors.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123456789' }))
      ),
      rest.get(
        WifiUrlsInfo.getApValidChannel.url,
        (_, res, ctx) => res(ctx.json({}))
      )
    )
  })
  it('should be sorted for Channel and SNR', () => {
    expect(compareChannelAndSnr('6 (20MHz)', '11 (30MHz)')).toBe(-1)
    expect(compareChannelAndSnr('15 dB', '37 (30MHz)')).toBe(-1)
  })

  it('should render empty column', () => {
    expect(apNeighborValueRender()).toBe('N/A')
    expect(apNeighborValueRender('TEST')).toBe('TEST')
  })

  it('should show error when timeout', async () => {
    jest.useFakeTimers()

    render(<ApRfNeighbors />, {
      wrapper,
      route: { params, path: tabPath }
    })

    await waitFor(() => expect(mockedInitPokeSocketFn).toHaveBeenCalled())

    await act(async () => {
      jest.advanceTimersByTime(defaultSocketTimeout) // Simulate websocket timeout
    })

    // Will not show error when the timeout of the detection is caused by the system instead of user trigger
    await waitFor(() => {
      expect(screen.queryByText('The AP is not reachable')).toBeNull()
    })

    // To make the click event execute immediately instead of waiting for a timeout when using the fake timer, we should include the delay: null option
    await userEvent.click(screen.getByRole('button', { name: 'Detect' }), { delay: null })

    await act(async () => {
      jest.advanceTimersByTime(defaultSocketTimeout) // Simulate websocket timeout
    })

    await waitFor(() => {
      expect(screen.queryByText('The AP is not reachable')).toBeVisible()
    })

    jest.runOnlyPendingTimers()
    jest.useRealTimers()

    await userEvent.click(screen.getByRole('img', { name: 'close' }))
    await waitFor(() => {
      expect(screen.queryByText('The AP is not reachable')).toBeNull()
    })
  })

  xit('should handle error correctly', async () => {
    const detectFn = jest.fn()

    mockServer.use(
      rest.patch(
        WifiUrlsInfo.detectApNeighbors.url,
        (req, res, ctx) => {
          detectFn()

          return res(ctx.status(400), ctx.json({
            errors: [
              {
                code: 'WIFI-10496',
                message: 'error occurs'
              }
            ],
            requestId: 'REQUEST_ID'
          }))
        }
      )
    )

    render(<ApRfNeighbors />, {
      wrapper,
      route: { params, path: tabPath }
    })

    await waitFor(() => expect(detectFn).toHaveBeenCalledTimes(1))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Detect' })).toBeEnabled())

    await userEvent.click(screen.getByRole('button', { name: 'Detect' }))
    await waitFor(() => expect(detectFn).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Detect' })).toBeEnabled())
    await waitFor(() => {
      expect(screen.queryAllByText('The version of AP firmware is not supported').length).toBe(1)
    })

    // should destroy the previous error toast when the new error occurs
    await userEvent.click(screen.getByRole('button', { name: 'Detect' }))
    await waitFor(() => expect(detectFn).toHaveBeenCalledTimes(3))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Detect' })).toBeEnabled())
    await waitFor(() => {
      expect(screen.queryAllByText('The version of AP firmware is not supported').length).toBe(1)
    })
  })

  // TODO flaky
  it.skip('should render RF Neighbors view', async () => {
    const websocketDelay = 1000
    mockedInitPokeSocketFn.mockImplementation((requestId: string, handler: () => void) => {
      setTimeout(handler, websocketDelay) // Simulate receving the message from websocket
      return mockedSocket
    })

    jest.useFakeTimers()

    render(<ApRfNeighbors />, {
      wrapper,
      route: { params, path: tabPath }
    })

    await waitFor(() => expect(mockedInitPokeSocketFn).toHaveBeenCalled())

    await act(async () => {
      jest.advanceTimersByTime(websocketDelay)
    })

    const targetApName = new RegExp(mockedApRfNeighbors.neighbors[0].deviceName)
    expect(await screen.findByRole('row', { name: targetApName })).toBeVisible()

    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })
})
