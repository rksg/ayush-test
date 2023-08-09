import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { EdgeDhcpUrls }                        from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { mockDhcpPoolStatsData, mockEdgeDhcpDataList } from '../../../../Services/DHCP/Edge/__tests__/fixtures'
import { mockEdgeDhcpHostStats }                       from '../../__tests__/fixtures'

import { EdgeDhcp } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/rc/components', () => ({
  EdgeDhcpLeaseTable: () => <div data-testid='edge-dhcp-lease-table' />,
  EdgeDhcpPoolTable: () => <div data-testid='edge-dhcp-pool-table' />
}))

describe('Edge DHCP no initial data', () => {

  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'dhcp'
    }
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpPoolStats.url,
        (req, res, ctx) => res(ctx.json({ totalCount: 0, data: [] }))
      ),
      rest.post(
        EdgeDhcpUrls.getDhcpHostStats.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpHostStats))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcpList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpDataList))
      ),
      rest.patch(
        EdgeDhcpUrls.patchDhcpService.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('open apply DHCP drawer', async () => {
    params.activeSubTab = 'pools'
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeDhcp />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/details/:activeTab/:activeSubTab'
        }
      })
    await user.click(screen.getByRole('switch'))
    await screen.findByText('Manage DHCP for SmartEdge Service')
  })
})

describe('Edge DHCP', () => {

  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'dhcp'
    }

    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpPoolStats.url,
        (req, res, ctx) => res(ctx.json(mockDhcpPoolStatsData))
      ),
      rest.post(
        EdgeDhcpUrls.getDhcpHostStats.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpHostStats))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcpList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpDataList))
      ),
      rest.patch(
        EdgeDhcpUrls.patchDhcpService.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('Active Pools tab successfully', async () => {
    params.activeSubTab = 'pools'
    render(
      <Provider>
        <EdgeDhcp />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/details/:activeTab/:activeSubTab'
        }
      })
    const poolsTab = screen.getByRole('tab', { name: 'Pools' })
    expect(poolsTab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('Active Leases tab successfully', async () => {
    params.activeSubTab = 'leases'
    render(
      <Provider>
        <EdgeDhcp />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/details/:activeTab/:activeSubTab'
        }
      })
    const leasesTab = await screen.findByRole('tab', { name: 'Leases ( 2 online )' })
    expect(leasesTab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('switch tab', async () => {
    params.activeSubTab = 'pools'
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeDhcp />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/details/:activeTab/:activeSubTab'
        }
      })
    await user.click(await screen.findByRole('tab', { name: 'Leases ( 2 online )' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/devices/edge/${params.serialNumber}/details/dhcp/leases`,
      hash: '',
      search: ''
    })
  })

  it('update DHCP service', async () => {
    params.activeSubTab = 'pools'
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeDhcp />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/details/:activeTab/:activeSubTab'
        }
      })
    const settingIcon = screen.getByTestId('setting-icon')
    await waitFor(() => expect(settingIcon).not.toBeDisabled())
    await user.click(screen.getByTestId('setting-icon'))
    await screen.findByText('Manage DHCP for SmartEdge Service')
    await user.click(screen.getByRole('combobox'))
    await user.click((await screen.findAllByText('TestDhcp-1'))[0])
    await user.click(screen.getByRole('button', { name: 'Apply' }))
  })

  it('deactivate DHCP service', async () => {
    params.activeSubTab = 'pools'
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeDhcp />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/details/:activeTab/:activeSubTab'
        }
      })
    const dhcpSwitch = screen.getByRole('switch')
    await waitFor(() => expect(dhcpSwitch).toBeChecked())
    await user.click(screen.getByRole('switch'))
    await screen.findByText('Deactive DHCP Service')
    await user.click(screen.getByRole('button', { name: 'OK' }))
  })
})
