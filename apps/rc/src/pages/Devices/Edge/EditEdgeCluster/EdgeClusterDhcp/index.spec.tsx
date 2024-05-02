import { rest } from 'msw'

import { useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import { edgeApi }                                              from '@acx-ui/rc/services'
import { EdgeClusterStatus, EdgeDhcpUrls, EdgeGeneralFixtures } from '@acx-ui/rc/utils'
import { Provider, store }                                      from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                  from '@acx-ui/test-utils'

import { mockDhcpPoolStatsData, mockEdgeDhcpDataList } from '../../../../Services/DHCP/Edge/__tests__/fixtures'

import { EdgeClusterDhcp } from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edge Cluster DHCP Tab', () => {
  let params: { tenantId: string, clusterId: string, activeTab?: string }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    store.dispatch(edgeApi.util.resetApiState())

    params = {
      tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
      clusterId: '1',
      activeTab: 'dhcp'
    }
    mockServer.use(
      rest.get(
        EdgeDhcpUrls.getDhcpList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpDataList))
      ),
      rest.patch(
        EdgeDhcpUrls.patchDhcpService.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        EdgeDhcpUrls.getDhcpPoolStats.url,
        (req, res, ctx) => res(ctx.json(mockDhcpPoolStatsData))
      )
    )
  })

  it('toggle should be off when no pool returned', async () => {
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpPoolStats.url,
        (req, res, ctx) => res(ctx.json({
          data: []
        }))
      )
    )

    render(
      <Provider>
        <EdgeClusterDhcp currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('toggle should be ON when pools returned', async () => {
    render(
      <Provider>
        <EdgeClusterDhcp currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })


    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeChecked()
    })
    expect(await screen.findByRole('combobox')).toBeInTheDocument()
  })

  it('should show DHCP selection form when switch is toggled on', async () => {
    render(
      <Provider>
        <EdgeClusterDhcp currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })
    expect(await screen.findByText('TestDhcp-1')).toBeVisible()
  })
})
