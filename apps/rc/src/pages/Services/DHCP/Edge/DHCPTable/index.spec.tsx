import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  EdgeDhcpUrls,
  EdgeUrlsInfo,
  getServiceDetailsLink,
  getServiceRoutePath,
  ServiceOperation, ServiceType
} from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { mockServer, render, screen, within } from '@acx-ui/test-utils'

import { mockEdgeList }      from '../../../../Devices/Edge/__tests__/fixtures'
import { mockDhcpStatsData } from '../__tests__/fixtures'

import DHCPTable from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('EdgeDhcpTable', () => {
  let params: { tenantId: string }
  const tablePath = '/:tenantId/t/' + getServiceRoutePath({
    type: ServiceType.EDGE_DHCP,
    oper: ServiceOperation.LIST
  })
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (req, res, ctx) => res(ctx.json(mockDhcpStatsData))
      ),
      rest.delete(
        EdgeDhcpUrls.deleteDhcpService.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.delete(
        EdgeDhcpUrls.bulkDeleteDhcpServices.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.patch(
        EdgeDhcpUrls.patchDhcpService.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('Should render EdgeDhcpTable successfully', async () => {
    render(
      <Provider>
        <DHCPTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findAllByRole('row', { name: /TestDHCP-/i })
    expect(row.length).toBe(4)
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <DHCPTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
  })

  it('edge dhcp service detail page link should be correct', async () => {
    render(
      <Provider>
        <DHCPTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const edgeDhcpServiceDetailLink = await screen.findByRole('link',
      { name: 'TestDHCP-1' }) as HTMLAnchorElement
    expect(edgeDhcpServiceDetailLink.href)
      .toContain(`/${params.tenantId}/t/${getServiceDetailsLink({
        type: ServiceType.EDGE_DHCP,
        oper: ServiceOperation.DETAIL,
        serviceId: '1'
      })}`)
  })

  it('should go edit page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <DHCPTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findByRole('row', { name: /TestDHCP-1/i })
    await user.click(within(row).getByRole('radio'))
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/${getServiceDetailsLink({
        type: ServiceType.EDGE_DHCP,
        oper: ServiceOperation.EDIT,
        serviceId: '1'
      })}`,
      hash: '',
      search: ''
    })
  })

  // it('edit button will remove when select above 1 row', async () => {
  //   const user = userEvent.setup()
  //   render(
  //     <Provider>
  //       <DHCPTable />
  //     </Provider>, {
  //       route: { params, path: tablePath }
  //     })
  //   const row = await screen.findAllByRole('row', { name: /TestDHCP-/i })
  //   await user.click(within(row[0]).getByRole('checkbox'))
  //   await user.click(within(row[1]).getByRole('checkbox'))
  //   expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  // })

  it.skip('should delete selected row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <DHCPTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findByRole('row', { name: /TestDHCP-1/i })
    await user.click(within(row).getByRole('radio'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "TestDHCP-1"?')
    await user.click(screen.getByRole('button', { name: 'Delete DHCP' }))
  })

  // it('should delete selected row(multiple)', async () => {
  //   const user = userEvent.setup()
  //   render(
  //     <Provider>
  //       <DHCPTable />
  //     </Provider>, {
  //       route: { params, path: tablePath }
  //     })
  //   const row1 = await screen.findByRole('row', { name: /TestDHCP-1/i })
  //   const row2 = await screen.findByRole('row', { name: /TestDHCP-2/i })
  //   await user.click(within(row1).getByRole('checkbox'))
  //   await user.click(within(row2).getByRole('checkbox'))
  //   await user.click(screen.getByRole('button', { name: 'Delete' }))
  //   await screen.findByText('Delete "2 DHCP"?')
  //   await user.click(screen.getByRole('button', { name: 'Delete DHCP' }))
  // })

  it.skip('should show update modal (single)', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <DHCPTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findByRole('row', { name: /DHCP-1/i })
    await user.click(within(row).getByRole('radio'))
    await user.click(screen.getByRole('button', { name: 'Update Now' }))
    await screen.findByText('Service Update')
    // eslint-disable-next-line max-len
    await screen.findByText('Are you sure you want to update this service to the latest version immediately?')
    await user.click(screen.getByRole('button', { name: 'Update' }))
  })

  // it('should show update modal (multiple)', async () => {
  //   const user = userEvent.setup()
  //   render(
  //     <Provider>
  //       <DHCPTable />
  //     </Provider>, {
  //       route: { params, path: tablePath }
  //     })
  //   const row1 = await screen.findByRole('row', { name: /DHCP-1/i })
  //   await user.click(within(row1).getByRole('checkbox'))
  //   const row2 = await screen.findByRole('row', { name: /DHCP-2/i })
  //   await user.click(within(row2).getByRole('checkbox'))
  //   await user.click(screen.getByRole('button', { name: 'Update Now' }))
  //   await screen.findByText('Service Update')
  //   // eslint-disable-next-line max-len
  //   await screen.findByText('Are you sure you want to update these services to the latest version immediately?')
  //   await user.click(screen.getByRole('button', { name: 'OK' }))
  // })

  it('should show [Update Available] correctly', async () => {
    render(
      <Provider>
        <DHCPTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findByRole('row', { name: /TestDHCP-1/i })
    expect(await within(row).findByText('Yes')).toBeValid()
    const row1 = await screen.findByRole('row', { name: /TestDHCP-2/i })
    expect(await within(row1).findByText('Yes')).toBeValid()
    expect(await within(row1).findByText('1.0.1, 1.0.2')).toBeValid()
    const row2 = await screen.findByRole('row', { name: /TestDHCP-3/i })
    expect(await within(row2).findByText('No')).toBeValid()
    const row3 = await screen.findByRole('row', { name: /TestDHCP-4/i })
    expect(await within(row3).findByText('No')).toBeValid()
  })
})
