import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { edgeApi, edgeFirewallApi }                                                                                  from '@acx-ui/rc/services'
import { EdgeFirewallUrls, EdgeUrlsInfo, ServiceOperation, ServiceType, getServiceDetailsLink, EdgeGeneralFixtures } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                           from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved, within }                                  from '@acx-ui/test-utils'

import { mockedFirewallDataList } from '../__tests__/fixtures'

import FirewallTable from '.'

const { mockEdgeList } = EdgeGeneralFixtures
const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Firewall Table', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    store.dispatch(edgeApi.util.resetApiState())
    store.dispatch(edgeFirewallApi.util.resetApiState())
    mockServer.use(
      rest.post(
        EdgeFirewallUrls.getEdgeFirewallViewDataList.url,
        (req, res, ctx) => res(ctx.json(mockedFirewallDataList))
      ),
      rest.delete(
        EdgeFirewallUrls.batchDeleteEdgeFirewall.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.delete(
        EdgeFirewallUrls.deleteEdgeFirewall.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      )
    )
  })

  it('should create FirewallTable successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <FirewallTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/firewall/list' }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const rows = await screen.findAllByRole('row', { name: /TestFirewall/i })
    expect(rows.length).toBe(3)

    // eslint-disable-next-line max-len
    expect(rows[0]).toHaveTextContent(/TestFirewall1\s*2\s*Inbound:\s*2\s*Outbound:\s*2\s*3\s*Poor\s*No\s*1\.0\.0\.100,\s*1\.0\.0\.210/i)
    expect(rows[1]).toHaveTextContent(/TestFirewall2\s*--\s*--\s*0\s*--\s*No\s*--/i)
    expect(rows[2]).toHaveTextContent(/TestFirewall3\s*--\s*--\s*0\s*--\s*No\s*--/i)

    const ddosInfo = await screen.findByTestId('ddos-info-1')
    await user.hover(ddosInfo)
    await screen.findByText('All: 220')
    await screen.findByText('ICMP: 200')

    const edgeNumStr = await screen.findByTestId('edge-names-1')
    await user.hover(edgeNumStr)
    await screen.findByText('Smart Edge 1')
  })

  it('should go edit page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <FirewallTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/firewall/list' }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /TestFirewall1/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    const editPath = getServiceDetailsLink({
      type: ServiceType.EDGE_FIREWALL,
      oper: ServiceOperation.EDIT,
      serviceId: '1'
    })

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/${editPath}`,
      hash: '',
      search: ''
    })
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <FirewallTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/firewall/list' }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
  })

  it('edit button will remove when select above 1 row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <FirewallTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/firewall/list' }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const row = await screen.findAllByRole('row', { name: /TestFirewall/i })
    await user.click(within(row[0]).getByRole('checkbox'))
    await user.click(within(row[1]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })

  it('should delete selected row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <FirewallTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/firewall/list' }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /TestFirewall2/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText('Delete "TestFirewall2"?')
    await user.click(screen.getByRole('button', { name: 'Delete Firewall' }))
    await waitForElementToBeRemoved(dialogTitle)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('should delete selected row(multiple)', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <FirewallTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/firewall/list' }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const rows = await screen.findAllByRole('row')

    expect(within(rows[2]).getByRole('cell', { name: /TestFirewall2/i })).toBeVisible()
    await user.click(within(rows[2]).getByRole('checkbox'))
    expect(within(rows[3]).getByRole('cell', { name: /TestFirewall3/i })).toBeVisible()
    await user.click(within(rows[3]).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText('Delete "2 Firewall"?')
    await user.click(screen.getByRole('button', { name: 'Delete Firewall' }))
    await waitForElementToBeRemoved(dialogTitle)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('should disable delete button and show tooltip', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <FirewallTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/firewall/list' }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const rows = await screen.findAllByRole('row', { name: /TestFirewall/i })
    expect(within(rows[0]).getByRole('cell', { name: /TestFirewall1/i })).toBeVisible()
    await user.click(within(rows[0]).getByRole('checkbox'))
    expect(within(rows[1]).getByRole('cell', { name: /TestFirewall2/i })).toBeVisible()
    await user.click(within(rows[1]).getByRole('checkbox'))

    const deleteBtn = await screen.findByRole('button', { name: 'Delete' })
    expect(deleteBtn).toBeDisabled()

    fireEvent.mouseOver(deleteBtn)
    expect(await screen.findByRole('tooltip'))
      .toHaveTextContent('Please deactivate the RUCKUS Edge Firewall Service')
  })

})
