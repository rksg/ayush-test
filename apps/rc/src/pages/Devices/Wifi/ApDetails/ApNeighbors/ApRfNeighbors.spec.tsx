import { rest } from 'msw'

import { ToastProps }                                       from '@acx-ui/components'
import { CatchErrorResponse, CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                         from '@acx-ui/store'
import { act, mockServer, render, screen, waitFor }         from '@acx-ui/test-utils'

import { ApContextProvider } from '../ApContextProvider'

import { mockedAp, mockedApRfNeighbors }                      from './__tests__/fixtures'
import ApRfNeighbors, { compareChannelAndSnr, emtpyRenderer } from './ApRfNeighbors'

const mockedSocket = {
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
  showToast: (config: ToastProps) => mockedShowToast(config)
}))

const wrapper = (props: { children: JSX.Element }) => <Provider>
  <ApContextProvider {...props} />
</Provider>
describe('ApRfNeighbors', () => {
  const tabPath = '/:tenantId/t/devices/wifi/:apId/details/neighbors/:activeSubTab'
  const params = {
    tenantId: 'fe8d6c89c852473ea343c9a0fa66829b',
    apId: mockedAp.data[0].serialNumber,
    activeSubTab: 'lldp'
  }

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
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
      )
    )
  })
  it('should be sorted for Channel and SNR', () => {
    expect(compareChannelAndSnr('6 (20MHz)', '11 (30MHz)')).toBe(-1)
    expect(compareChannelAndSnr('15 dB', '37 (30MHz)')).toBe(-1)
  })

  it('should render empty column', () => {
    expect(emtpyRenderer()).toBe('N/A')
    expect(emtpyRenderer(<div>Test</div>)).toStrictEqual(<div>Test</div>)
  })

  it('should render RF Neighbors view', async () => {
    const simDelayForWebsocket = 10
    mockedInitPokeSocketFn.mockImplementation((requestId: string, handler: () => void) => {
      setTimeout(handler, simDelayForWebsocket)
      return mockedSocket
    })

    render(<ApRfNeighbors />, {
      wrapper,
      route: { params, path: tabPath }
    })

    await act(() => {
      jest.advanceTimersByTime(simDelayForWebsocket) // Simulate receving the message from websocket
    })

    const targetApName = new RegExp(mockedApRfNeighbors.neighbors[0].deviceName)
    expect(await screen.findByRole('row', { name: targetApName })).toBeVisible()

    mockedInitPokeSocketFn.mockRestore()
  })

  it('should show error when timeout', async () => {
    render(<ApRfNeighbors />, {
      wrapper,
      route: { params, path: tabPath }
    })

    await waitFor(() => {
      expect(mockedInitPokeSocketFn).toHaveBeenCalled()
    })

    await act(() => {
      jest.runAllTimers() // Simulate websocket timeout
    })

    expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({
      content: 'The AP is not reachable',
      type: 'error'
    }))
  })

  it('should handle error correctly', async () => {
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
      status: 400
    }

    mockServer.use(
      rest.patch(
        WifiUrlsInfo.detectApNeighbors.url,
        (req, res, ctx) => res(ctx.status(400), ctx.json(mockedError))
      )
    )

    render(<ApRfNeighbors />, {
      wrapper,
      route: { params, path: tabPath }
    })

    await waitFor(() => {
      expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({
        content: 'Error occurred while detecting AP',
        type: 'error'
      }))
    })
  })
})
