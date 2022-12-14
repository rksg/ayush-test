import '@testing-library/jest-dom'
import { Form } from 'antd'
import { rest } from 'msw'

import { networkApi }      from '@acx-ui/rc/services'
import { CommonUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { Venues } from './Venues'

jest.mock('socket.io-client')

const list = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'd7b1a9a350634115a92ee7b0f11c7e75',
      name: 'network-venue-1',
      description: '',
      city: 'Melbourne, Victoria',
      country: 'Australia',
      latitude: '-37.8145092',
      longitude: '144.9704868',
      networks: { count: 1, names: ['03'], vlans: [1] },
      aggregatedApStatus: { '1_01_NeverContactedCloud': 1 },
      status: '1_InSetupPhase',
      mesh: { enabled: false },
      allApDisabled: false
    },
    {
      id: '02e2ddbc88e1428987666d31edbc3d9a',
      name: 'My-Venue',
      description: 'My-Venue',
      city: 'New York',
      country: 'United States',
      latitude: '40.7691341',
      longitude: '-73.94297689999999',
      switchClients: 2,
      switches: 1,
      status: '1_InSetupPhase',
      mesh: { enabled: false },
      wlan: { wlanSecurity: 'WPA3' }
    }
  ]
}

function wrapper ({ children }: { children: React.ReactElement }) {
  return <Provider>
    <Form>
      {children}
    </Form>
  </Provider>
}

describe('Create Network: Venues Step', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
    })
  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(<Venues />, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    await screen.findByText('network-venue-1')
    expect(asFragment()).toMatchSnapshot()
  })

  it('Activate and Deactivate Network by toogleButton', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<Venues />, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    const toogleButton = rows[0]
    fireEvent.click(toogleButton)
    await waitFor(() => expect(toogleButton).toBeChecked())
    fireEvent.click(toogleButton)
    await waitFor(() => expect(toogleButton).not.toBeChecked())
  })

  it('Table action bar activate Network', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<Venues />, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!

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
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<Venues />, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!

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
