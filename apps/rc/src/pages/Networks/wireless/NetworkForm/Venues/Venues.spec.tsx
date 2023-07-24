import '@testing-library/jest-dom'
import { Form } from 'antd'
import { rest } from 'msw'

import { networkApi }      from '@acx-ui/rc/services'
import { CommonUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  findTBody,
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import {
  network,
  list,
  networkVenue_allAps,
  networkVenue_apgroup
} from '../../NetworkDetails/NetworkVenuesTab/__tests__/fixtures'
import NetworkFormContext from '../NetworkFormContext'

import { Venues } from './Venues'

jest.mock('socket.io-client')

function wrapper ({ children }: { children: React.ReactElement }) {
  return <Provider>
    <NetworkFormContext.Provider value={{
      editMode: false, cloneMode: false, data: { venues: [] }, setData: ()=>{}
    }}>
      <Form>
        {children}
      </Form>
    </NetworkFormContext.Provider>
  </Provider>
}

const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

describe.skip('Create Network: Venues Step', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
    })
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json({ response: [networkVenue_allAps, networkVenue_apgroup] }))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (req, res, ctx) => res(ctx.json({ response: [network] }))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider>
      <NetworkFormContext.Provider value={{
        editMode: false, cloneMode: false,
        data: { venues: [networkVenue_allAps, networkVenue_apgroup] }
      }}>
        <Form>
          <Venues />
        </Form>
      </NetworkFormContext.Provider>
    </Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    const row = await screen.findByRole('row', { name: /network-venue-1/i })
    fireEvent.click(within(row).getByText('All APs'))
    const dialog = await screen.findByRole('dialog', { name: /Select APs/i })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    fireEvent.click(within(row).getByText('2.4 GHz, 5 GHz'))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Apply' }))
  })

  it('should render clone mode correctly', async () => {
    render(<Provider>
      <NetworkFormContext.Provider value={{
        editMode: false, cloneMode: true,
        data: { venues: [networkVenue_allAps, networkVenue_apgroup] }
      }}>
        <Form>
          <Venues />
        </Form>
      </NetworkFormContext.Provider>
    </Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    const row = await screen.findByRole('row', { name: /network-venue-1/i })
    fireEvent.click(within(row).getByText('24/7'))

    const dialog = await screen.findByRole('dialog', { name: /Schedule for Network/i })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Apply' }))
  })

  it('Activate and Deactivate Network by toogleButton', async () => {
    render(<Venues />, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    const tbody = await findTBody()
    const rows = await within(tbody).findAllByRole('switch')
    expect(rows).toHaveLength(2)
    const toogleButton = rows[0]
    fireEvent.click(toogleButton)
    await waitFor(() => expect(toogleButton).toBeChecked())
    fireEvent.click(toogleButton)
    await waitFor(() => expect(toogleButton).not.toBeChecked())
  })

  it('Table action bar activate Network', async () => {
    render(<Venues />, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText('My-Venue'))
    const activateButton = screen.getByRole('button', { name: 'Activate' })
    fireEvent.click(activateButton)

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    const selectRow = rows[1]
    await waitFor(() => expect(selectRow).toBeChecked())
  })

  it('Table action bar deactivate Network', async () => {
    render(<Venues />, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText('My-Venue'))
    const deactivateButton = screen.getByRole('button', { name: 'Deactivate' })
    fireEvent.click(deactivateButton)

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    await waitFor(() => rows.forEach(row => expect(row).not.toBeChecked()))
  })
})
