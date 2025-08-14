import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { apApi }                                                    from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo, SwitchRbacUrlsInfo, WifiRbacUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                          from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within }              from '@acx-ui/test-utils'
import type { ToastProps }                                          from '@acx-ui/utils'

import { ApContextProvider } from '../ApContextProvider'

import { mockedAp, mockedApLldpNeighbors, mockedSocket, tabPath } from './__tests__/fixtures'
import ApLldpNeighbors                                            from './ApLldpNeighbors'

const mockedInitPokeSocketFn = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  initPokeSocket: (subscriptionId: string, handler: () => void) => {
    return mockedInitPokeSocketFn(subscriptionId, handler)
  },
  closePokeSocket: () => jest.fn(),
  useApContext: () => ({
    serialNumber: mockedAp.data[0].serialNumber,
    venueId: 'venue-id'
  })
}))

const mockedShowToast = jest.fn()
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: (config: ToastProps) => mockedShowToast(config)
}))

const wrapper = (props: { children: JSX.Element }) => <Provider>
  <ApContextProvider {...props} />
</Provider>
describe('ApLldpNeighbors', () => {
  const params = {
    tenantId: 'fe8d6c89c852473ea343c9a0fa66829b',
    apId: mockedAp.data[0].serialNumber,
    activeSubTab: 'lldp'
  }

  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())

    mockServer.use(
      rest.post(
        CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ ...mockedAp }))
      ),
      rest.post(
        WifiRbacUrlsInfo.getApNeighbors.url,
        (_, res, ctx) => res(ctx.json({ ...mockedApLldpNeighbors }))
      ),
      rest.patch(
        WifiRbacUrlsInfo.detectApNeighbors.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123456789' }))
      ),
      rest.get(
        WifiRbacUrlsInfo.getApValidChannel.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        SwitchRbacUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json({ data: [], totalCount: 0 }))
      )
    )
  })

  beforeEach(() => {
    mockedInitPokeSocketFn.mockImplementation(() => mockedSocket)
  })

  afterEach(() => {
    mockedInitPokeSocketFn.mockRestore()
  })

  it('should render LLDP Neighbors view', async () => {
    mockedInitPokeSocketFn.mockImplementation((requestId: string, handler: () => void) => {
      setTimeout(handler, 0) // Simulate receiving the message from websocket
      return mockedSocket
    })

    render(<ApLldpNeighbors />, {
      wrapper,
      route: { params, path: tabPath }
    })

    await waitFor(() => expect(mockedInitPokeSocketFn).toHaveBeenCalled())

    const targetInterface = new RegExp(mockedApLldpNeighbors.neighbors[0].lldpInterface)
    const targetInterfaceButton = await screen.findByRole('button', { name: targetInterface })
    expect(targetInterfaceButton).toBeVisible()

    const managedNeighborSysName = new RegExp(mockedApLldpNeighbors.neighbors[1].lldpSysName)
    const managedNeighborLink = await screen.findByRole('link', { name: managedNeighborSysName })
    expect(managedNeighborLink).toBeVisible()

    await userEvent.click(targetInterfaceButton)

    const detailsDrawer = await screen.findByRole('dialog')
    expect(detailsDrawer).toBeVisible()

    await userEvent.click(within(detailsDrawer).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(detailsDrawer).not.toBeVisible())
  })

  it('should handle error correctly', async () => {
    const detectFn = jest.fn()

    mockServer.use(
      rest.patch(
        WifiRbacUrlsInfo.detectApNeighbors.url,
        (req, res, ctx) => {
          detectFn()

          return res(ctx.status(400), ctx.json({
            errors: [
              {
                code: 'WIFI-56789',
                message: 'error occurs'
              }
            ],
            requestId: 'REQUEST_ID'
          }))
        }
      )
    )

    render(<ApLldpNeighbors />, {
      wrapper,
      route: { params, path: tabPath }
    })

    await waitFor(() => expect(detectFn).toHaveBeenCalled())

    await waitFor(() => expect(screen.getByRole('button', { name: 'Detect' })).toBeEnabled())

    await userEvent.click(screen.getByRole('button', { name: 'Detect' }))

  })

  it('should render PSEAllocPower with unit', async () => {
    mockedInitPokeSocketFn.mockImplementation((requestId: string, handler: () => void) => {
      setTimeout(handler, 0) // Simulate receiving the message from websocket
      return mockedSocket
    })

    render(<ApLldpNeighbors />, {
      wrapper,
      route: { params, path: tabPath }
    })

    await waitFor(() => expect(mockedInitPokeSocketFn).toHaveBeenCalled())

    expect(await screen.findByText('26 W')).toBeInTheDocument()
  })
})
