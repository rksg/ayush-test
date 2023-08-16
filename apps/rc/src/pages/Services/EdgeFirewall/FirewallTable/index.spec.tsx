import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                                         from '@acx-ui/feature-toggle'
import { EdgeFirewallUrls, EdgeUrlsInfo, ServiceOperation, ServiceType, getServiceDetailsLink } from '@acx-ui/rc/utils'
import { Provider }                                                                             from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, within }                        from '@acx-ui/test-utils'

import { mockEdgeList }           from '../../../Devices/Edge/__tests__/fixtures'
import { mockedFirewallDataList } from '../__tests__/fixtures'

import FirewallTable from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Firewall Table', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

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
    const row = await screen.findAllByRole('row', { name: /TestFirewall/i })
    expect(row.length).toBe(2)
    // eslint-disable-next-line max-len
    await screen.findByRole('row', { name: 'TestFirewall1 2 Inbound: 2 Outbound: 2 3 Poor No 1.0.0.100, 1.0.0.210' })
    await screen.findByRole('row', { name: 'TestFirewall2 -- -- 0 -- No --' })
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

  it('should render breadcrumb correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <FirewallTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/firewall/list' }
      }
    )
    expect(await screen.findByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.queryByText('Network Control')).toBeNull()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <FirewallTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/firewall/list' }
      }
    )
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
    const row = await screen.findByRole('row', { name: /TestFirewall1/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText('Delete "TestFirewall1"?')
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
    const row1 = await screen.findByRole('row', { name: /TestFirewall1/i })
    const row2 = await screen.findByRole('row', { name: /TestFirewall2/i })
    await user.click(within(row1).getByRole('checkbox'))
    await user.click(within(row2).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText('Delete "2 Firewall"?')
    await user.click(screen.getByRole('button', { name: 'Delete Firewall' }))
    await waitForElementToBeRemoved(dialogTitle)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
