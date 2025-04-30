/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features }                                          from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                             from '@acx-ui/rc/components'
import { edgeApi }                                           from '@acx-ui/rc/services'
import { CommonUrlsInfo, EdgeGeneralFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                   from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { EdgeClusterTable } from './EdgeClusterTable'

const mockedDeleteFn = jest.fn()
const mockedRebootFn = jest.fn()
const mockedShutdownFn = jest.fn()

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useEdgeClusterActions: () => ({
    deleteNodeAndCluster: mockedDeleteFn,
    reboot: mockedRebootFn,
    shutdown: mockedShutdownFn
  }),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./HaStatusBadge', () => ({
  HaStatusBadge: () => <div data-testid='ha-status-badge' />
}))

const { mockEdgeClusterList } = EdgeGeneralFixtures

describe('Edge Cluster Table', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    store.dispatch(edgeApi.util.resetApiState())
    mockedUsedNavigate.mockReset()
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_req, res, ctx) => res(ctx.json({ data: [] }))
      )
    )
  })

  it('should render EdgeClusterTable successfully', async () => {
    render(
      <Provider>
        <EdgeClusterTable />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const rows = await screen.findAllByRole('row', { name: /Edge Cluster/i })
    expect(rows.length).toBe(5)

    await userEvent.click(within(rows[0]).getByRole('button'))
    const subRows = screen.getAllByRole('row', { name: /Smart Edge/i })
    expect(subRows.length).toBe(2)

    expect((await screen.findAllByText('Active-Active')).length).toBe(1)
    expect((await screen.findAllByText('Active-Standby')).length).toBe(2)
    expect((await screen.findAllByText('N/A')).length).toBe(2)
    expect((await screen.findAllByText('Single Node')).length).toBe(1)
    expect((await screen.findAllByText('Ready (2/2)')).length).toBe(1)
    expect((await screen.findAllByText('Cluster Forming')).length).toBe(1)
    expect((await screen.findAllByText('Disconnected')).length).toBe(1)
    expect((await screen.findAllByText('Cluster Setup Required')).length).toBe(1)
  })

  it('should delete selected items successfully', async () => {
    render(
      <Provider>
        <EdgeClusterTable />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row1 = await screen.findByRole('row', { name: /Edge Cluster 1/i })
    await userEvent.click(within(row1).getByRole('button'))
    const subRow = screen.getByRole('row', { name: /Smart Edge 1/i })
    await userEvent.click(within(subRow).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(mockedDeleteFn).toBeCalled()
  })

  it('should reboot selected items successfully', async () => {
    render(
      <Provider>
        <EdgeClusterTable />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /Edge Cluster 1/i })
    await userEvent.click(within(row).getByRole('button'))
    const subRow = screen.getByRole('row', { name: /Smart Edge 1/i })
    await userEvent.click(within(subRow).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Reboot' }))
    expect(mockedRebootFn).toBeCalled()
  })

  it('should shutdown selected items successfully', async () => {
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(true)
    render(
      <Provider>
        <EdgeClusterTable />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /Edge Cluster 1/i })
    await userEvent.click(within(row).getByRole('button'))
    const subRow = screen.getByRole('row', { name: /Smart Edge 1/i })
    await userEvent.click(within(subRow).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Shutdown' }))
    expect(mockedShutdownFn).toBeCalled()
  })

  it('should navigate to correct path while clicking edit button (Node)', async () => {
    render(
      <Provider>
        <EdgeClusterTable />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /Edge Cluster 1/i })
    await userEvent.click(within(row).getByRole('button'))
    const subRow = screen.getByRole('row', { name: /Smart Edge 1/i })
    await userEvent.click(within(subRow).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(mockedUsedNavigate).toBeCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge/${mockEdgeClusterList.data[0].edgeList[0].serialNumber}/edit/general-settings`,
      hash: '',
      search: ''
    })
  })

  it('should navigate to correct path while clicking edit button (Cluster)', async () => {
    render(
      <Provider>
        <EdgeClusterTable />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /Edge Cluster 1/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(mockedUsedNavigate).toBeCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge/cluster/${mockEdgeClusterList.data[0].clusterId}/edit/cluster-details`,
      hash: '',
      search: ''
    })
  })

  it('the link of detail page should be correct', async () => {
    render(
      <Provider>
        <EdgeClusterTable />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /Edge Cluster 1/i })
    await userEvent.click(within(row).getByRole('button'))
    const subRow = screen.getByRole('row', { name: /Smart Edge 1/i })
    const edgeNodeLink = (within(subRow).getByRole('link', { name: 'Smart Edge 1' }) as HTMLAnchorElement).href
    const venueLink = (within(subRow).getByRole('link', { name: 'Venue 1' }) as HTMLAnchorElement).href
    expect(edgeNodeLink).toContain(`/${params.tenantId}/t/devices/edge/${mockEdgeClusterList.data[0].edgeList[0].serialNumber}/details/overview`)
    expect(venueLink).toContain(`/${params.tenantId}/t/venues/${mockEdgeClusterList.data[0].edgeList[0].venueId}/venue-details/overview`)
  })

  it('should navigate to configuration wizard when clicking cluster', async () => {
    render(
      <Provider>
        <EdgeClusterTable />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /Edge Cluster 1/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    const configWizardBtn = screen.getByRole('button', { name: 'Run Cluster & RUCKUS Edge configuration wizard' })
    expect(configWizardBtn).not.toBeDisabled()
    await userEvent.click(configWizardBtn)
    expect(mockedUsedNavigate).toBeCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge/cluster/${mockEdgeClusterList.data[0].clusterId}/configure`,
      hash: '',
      search: ''
    })
  })
  it('should grey out configure wizard while clicking node', async () => {
    render(
      <Provider>
        <EdgeClusterTable />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /Edge Cluster 1/i })
    await userEvent.click(within(row).getByRole('button'))
    const subRow = screen.getByRole('row', { name: /Smart Edge 1/i })
    await userEvent.click(within(subRow).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Run Cluster & RUCKUS Edge configuration wizard' })).toBeNull()
  })

  describe('support cluster overview', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_DUAL_WAN_TOGGLE)
    })

    it('should navigate to cluster overview when click on first level', async () => {
      render(
        <Provider>
          <EdgeClusterTable />
        </Provider>, {
          route: { params, path: '/:tenantId/devices/edge' }
        })

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      const targetRow = await screen.findByRole('row', { name: /Edge Cluster 1/i })
      const clusterNameBtn = await within(targetRow).findByRole('link', { name: /Edge Cluster 1/i })
      expect(clusterNameBtn).toHaveAttribute('href', `/${params.tenantId}/t/devices/edge/cluster/${mockEdgeClusterList.data[0].clusterId}/details/overview`)
    })
  })
})