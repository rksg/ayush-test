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

import PortalScopeForm from './PortalScopeForm'

const list = {
  totalCount: 2,
  page: 1,
  data: [
    {
      name: '!!!New_Evolink!!!',
      id: 'efef32751d854e2ea2bfce4b367c330c',
      nwSubType: 'guest',
      captiveType: 'SelfSignIn',
      venues: {
        count: 2,
        names: [
          'Sindhuja-Venue',
          'Govind'
        ]
      }
    },
    {
      name: '!!!SANWPA2!!!',
      id: '1d88235da9504a98847fb5ed2b971052',
      nwSubType: 'psk',
      venues: {
        count: 1,
        names: [
          'Sandeep-R550'
        ]
      }
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

describe('Create Portal: Networks Step', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
    })
  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(<PortalScopeForm />, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    await screen.findByText('!!!SANWPA2!!!')
    expect(asFragment()).toMatchSnapshot()
  })

  it('Activate and Deactivate Networks by toogleButton', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<PortalScopeForm />, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    const toogleButton = rows[1]
    fireEvent.click(toogleButton)
    await waitFor(() => expect(toogleButton).toBeChecked())
    fireEvent.click(toogleButton)
    await waitFor(() => expect(toogleButton).not.toBeChecked())
  })

  it('Table action bar activate Network', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<PortalScopeForm />, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText('!!!New_Evolink!!!'))
    const activateButton = screen.getByRole('button', { name: 'Activate' })
    fireEvent.click(activateButton)

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    const selectRow = rows[0]
    await waitFor(() => expect(selectRow).toBeChecked())
  })

  it('Table action bar deactivate Network', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<PortalScopeForm />, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText('!!!New_Evolink!!!'))
    const deactivateButton = screen.getByRole('button', { name: 'Deactivate' })
    fireEvent.click(deactivateButton)

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    await waitFor(() => rows.forEach(row => expect(row).not.toBeChecked()))
  })

})
