import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }           from '@acx-ui/feature-toggle'
import { edgeApi, edgeDhcpApi }   from '@acx-ui/rc/services'
import {
  EdgeCompatibilityFixtures,
  EdgeDhcpUrls,
  EdgeGeneralFixtures,
  EdgeUrlsInfo,
  getServiceDetailsLink,
  getServiceRoutePath,
  ServiceOperation, ServiceType
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { mockDhcpStatsData } from '../__tests__/fixtures'

import DHCPTable from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockEdgeDhcpCompatibilities } = EdgeCompatibilityFixtures
const mockedGetClusterList = jest.fn()
const mockedUsedNavigate = jest.fn()
const mockedUpdateFn = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('@acx-ui/rc/components', () => ({
  // eslint-disable-next-line max-len
  EdgeTableCompatibilityWarningTooltip: () => <div data-testid='EdgeTableCompatibilityWarningTooltip' />,
  SimpleListTooltip: ({ displayText }: { displayText: string }) =>
    <div data-testid='SimpleListTooltip' >{displayText}</div>,
  EdgeServiceStatusLight: () => <div data-testid='EdgeServiceStatusLight' />,
  useEdgeDhcpCompatibilityData: () => ({
    compatibilities: mockEdgeDhcpCompatibilities,
    isLoading: false
  }),
  useEdgeDhcpActions: () => ({
    upgradeEdgeDhcp: mockedUpdateFn,
    isEdgeDhcpUpgrading: false
  })
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
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockedGetClusterList.mockReset()
    store.dispatch(edgeApi.util.resetApiState())
    store.dispatch(edgeDhcpApi.util.resetApiState())
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (req, res, ctx) => res(ctx.json(mockDhcpStatsData))
      ),
      rest.delete(
        EdgeDhcpUrls.deleteDhcpService.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => {
          mockedGetClusterList()
          return res(ctx.json(mockEdgeClusterList))
        }
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
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await waitFor(() => expect(mockedGetClusterList).toBeCalled())
    const row = await screen.findAllByRole('row', { name: /TestDHCP-/i })
    expect(row.length).toBe(4)
    await screen.findAllByTestId('EdgeTableCompatibilityWarningTooltip')
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <DHCPTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
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
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
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
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /TestDHCP-1/i })).toBeVisible()
    await user.click(within(rows[1]).getByRole('radio'))
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

  it('should delete selected row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <DHCPTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /TestDHCP-1/i })).toBeVisible()
    await user.click(within(rows[1]).getByRole('radio'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "TestDHCP-1"?')
    const dialog = screen.queryByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Delete DHCP' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
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
  //   const dialog = await screen.findByRole('dialog')
  //   await user.click(screen.getByRole('button', { name: 'Delete DHCP' }))
  //   await waitFor(() => expect(dialog).not.toBeVisible())
  // })

  it('should show update modal (single)', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <DHCPTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /DHCP-1/i })).toBeVisible()
    await user.click(within(rows[1]).getByRole('radio'))
    await user.click(screen.getByRole('button', { name: 'Update Now' }))
    const dialog = await screen.findByRole('dialog')
    screen.getByText('Service Update')
    // eslint-disable-next-line max-len
    await screen.findByText('Are you sure you want to update this service to the latest version immediately?')
    await user.click(screen.getByRole('button', { name: 'Update' }))
    await waitFor(() => expect(mockedUpdateFn).toHaveBeenCalled())
    await waitFor(() => expect(dialog).not.toBeVisible())
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

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /TestDHCP-1/i })).toBeVisible()
    expect(await within(rows[1]).findByText('Yes')).toBeValid() //TestDHCP-1
    expect(within(rows[2]).getByRole('cell', { name: /TestDHCP-2/i })).toBeVisible()
    expect(await within(rows[2]).findByText('Yes')).toBeValid() //TestDHCP-2
    expect(await within(rows[2]).findByText('1.0.1, 1.0.2')).toBeValid() //TestDHCP-2
    expect(within(rows[3]).getByRole('cell', { name: /TestDHCP-3/i })).toBeVisible()
    expect(await within(rows[3]).findByText('No')).toBeValid() //TestDHCP-3
    expect(within(rows[4]).getByRole('cell', { name: /TestDHCP-4/i })).toBeVisible()
    expect(await within(rows[4]).findByText('No')).toBeValid() //TestDHCP-4
  })

  it('Should render EdgeDhcpTable data as expected', async () => {
    render(
      <Provider>
        <DHCPTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    await waitFor(() => expect(mockedGetClusterList).toBeCalled())
    const row = await screen.findAllByRole('row', { name: /TestDHCP-1/i })

    const receivedClusterCount = within(row[0]).getAllByRole('cell')[3].textContent
    const expectedClusterCount = mockDhcpStatsData.data[0].edgeClusterIds.length.toString()
    expect(receivedClusterCount).toEqual(expectedClusterCount)

    expect(await within(row[0]).findByTestId('SimpleListTooltip')).toBeVisible()
  })
})
