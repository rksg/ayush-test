import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { ToastProps }                                  from '@acx-ui/components'
import { CommonUrlsInfo, WifiUrlsInfo }                from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { ApContextProvider } from '../ApContextProvider'

import { mockedAp, mockedApLldpNeighbors, mockedSocket, tabPath } from './__tests__/fixtures'
import ApLldpNeighbors                                            from './ApLldpNeighbors'

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
describe('ApLldpNeighbors', () => {
  const params = {
    tenantId: 'fe8d6c89c852473ea343c9a0fa66829b',
    apId: mockedAp.data[0].serialNumber,
    activeSubTab: 'lldp'
  }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ ...mockedAp }))
      ),
      rest.get(
        WifiUrlsInfo.getApLldpNeighbors.url,
        (_, res, ctx) => res(ctx.json({ ...mockedApLldpNeighbors }))
      ),
      rest.patch(
        WifiUrlsInfo.detectApNeighbors.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123456789' }))
      )
    )
  })

  it('should render LLDP Neighbors view', async () => {
    mockedInitPokeSocketFn.mockImplementation((requestId: string, handler: () => void) => {
      setTimeout(handler, 0) // Simulate receving the message from websocket
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

    mockedInitPokeSocketFn.mockRestore()
  })

  it('should handle error correctly', async () => {
    const mockedError = {
      errors: [
        {
          code: 'WIFI-56789',
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

    render(<ApLldpNeighbors />, {
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
