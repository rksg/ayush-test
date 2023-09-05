import { rest } from 'msw'

import { ToastProps }                               from '@acx-ui/components'
import { CommonUrlsInfo, WifiUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                                 from '@acx-ui/store'
import { act, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { ApContextProvider } from '../ApContextProvider'

import { mockedAp, mockedApRfNeighbors, mockedSocket, tabPath } from './__tests__/fixtures'
import ApRfNeighbors, { compareChannelAndSnr, emtpyRenderer }   from './ApRfNeighbors'

const mockedInitPokeSocketFn = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  initPokeSocket: (subscriptionId: string, handler: () => void) => {
    return mockedInitPokeSocketFn(subscriptionId, handler)
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
  const params = {
    tenantId: 'fe8d6c89c852473ea343c9a0fa66829b',
    apId: mockedAp.data[0].serialNumber,
    activeSubTab: 'rf'
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
    mockedInitPokeSocketFn.mockImplementation((requestId: string, handler: () => void) => {
      setTimeout(handler, 0) // Simulate receving the message from websocket
      return mockedSocket
    })

    render(<ApRfNeighbors />, {
      wrapper,
      route: { params, path: tabPath }
    })

    await waitFor(() => expect(mockedInitPokeSocketFn).toHaveBeenCalled())

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
    const mockedError = {
      errors: [
        {
          code: 'WIFI-10496',
          message: 'error occurs'
        }
      ],
      requestId: 'REQUEST_ID'
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
        content: 'The version of AP firmware is not supported',
        type: 'error'
      }))
    })
  })
})
