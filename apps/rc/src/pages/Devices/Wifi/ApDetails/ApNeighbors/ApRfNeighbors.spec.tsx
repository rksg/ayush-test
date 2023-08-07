import { rest } from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo }    from '@acx-ui/rc/utils'
import { Provider }                        from '@acx-ui/store'
import { act, mockServer, render, screen } from '@acx-ui/test-utils'

import { ApContextProvider } from '../ApContextProvider'

import { mockedAp, mockedApRfNeighbors }                      from './__tests__/fixtures'
import ApRfNeighbors, { compareChannelAndSnr, emtpyRenderer } from './ApRfNeighbors'
import { mockedSocket }                                       from './useApNeighbors.spec'

const mockedInitPokeSocketFn = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  initPokeSocket: (requestId: string, handler: () => void) => {
    return mockedInitPokeSocketFn(requestId, handler)
  },
  closePokeSocket: () => jest.fn()
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
    mockedInitPokeSocketFn.mockRestore()

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
    jest.useFakeTimers()

    mockedInitPokeSocketFn.mockImplementation((requestId: string, handler: () => void) => {
      setTimeout(handler, 10) // Simulate triggering the handler when receving the message from websocket
      return mockedSocket
    })

    render(<ApRfNeighbors />, {
      wrapper,
      route: { params, path: tabPath }
    })

    await act(() => {
      jest.advanceTimersByTime(10)
    })

    const targetApName = new RegExp(mockedApRfNeighbors.neighbors[0].deviceName)
    expect(await screen.findByRole('row', { name: targetApName })).toBeVisible()

    jest.useRealTimers()
  })
})
