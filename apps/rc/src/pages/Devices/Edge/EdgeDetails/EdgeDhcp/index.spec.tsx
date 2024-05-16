import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                                  from '@acx-ui/feature-toggle'
import { EdgeDHCPFixtures, EdgeDhcpUrls, EdgeGeneralFixtures, EdgeStatus, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                      from '@acx-ui/store'
import { mockServer, render, screen }                                                    from '@acx-ui/test-utils'

import { mockDhcpPoolStatsData }  from '../../../../Services/DHCP/Edge/__tests__/fixtures'
import { EdgeDetailsDataContext } from '../EdgeDetailsDataProvider'

import { EdgeDhcp } from '.'

const { mockEdgeDhcpHostStats, mockDhcpStatsData } = EdgeDHCPFixtures
const { mockEdgeList } = EdgeGeneralFixtures
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeDhcpLeaseTable: () => <div data-testid='edge-dhcp-lease-table' />,
  EdgeDhcpPoolTable: () => <div data-testid='edge-dhcp-pool-table' />
}))

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
      rest.delete(
        EdgeDhcpUrls.deactivateDhcpService.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (req, res, ctx) => res(ctx.json(mockDhcpStatsData))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeServiceList.url,
        (req, res, ctx) => res(ctx.json({
          data: []
        }))
      ),
      rest.put(
        EdgeDhcpUrls.activateDhcpService.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('Active Pools tab successfully', async () => {
    params.activeSubTab = 'pools'
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            isEdgeStatusLoading: false
          }}
        >
          <EdgeDhcp />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/details/:activeTab/:activeSubTab'
        }
      })
    const poolsTab = screen.getByRole('tab', { name: 'Pools' })
    expect(poolsTab.getAttribute('aria-selected')).toBeTruthy()
    expect(await screen.findByTestId('edge-dhcp-pool-table')).toBeVisible()
  })

  it('Active Leases tab successfully', async () => {
    params.activeSubTab = 'leases'
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            isEdgeStatusLoading: false
          }}
        >
          <EdgeDhcp />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/details/:activeTab/:activeSubTab'
        }
      })
    const leasesTab = await screen.findByRole('tab', { name: 'Leases ( 2 online )' })
    expect(leasesTab.getAttribute('aria-selected')).toBeTruthy()
    expect(await screen.findByTestId('edge-dhcp-lease-table')).toBeVisible()
  })

  it('switch tab', async () => {
    params.activeSubTab = 'pools'
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            isEdgeStatusLoading: false
          }}
        >
          <EdgeDhcp />
        </EdgeDetailsDataContext.Provider>
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
})
