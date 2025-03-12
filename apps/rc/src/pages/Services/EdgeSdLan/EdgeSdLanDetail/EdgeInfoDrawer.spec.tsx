import { rest } from 'msw'

import { EdgeGeneralFixtures, EdgeSdLanFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                             from '@acx-ui/store'
import { mockServer, render, screen }                           from '@acx-ui/test-utils'

import { EdgeInfoDrawer } from './EdgeInfoDrawer'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockedMvSdLanDataList } = EdgeSdLanFixtures
const mockedDmzSdLanData = mockedMvSdLanDataList[0]
const targetClusterInfo = mockEdgeClusterList.data[0]

const mockedCurrentEdgeInfoDmz = {
  clusterId: 'cluster-1',
  clusterName: 'Cluster 1',
  isDmzCluster: true
}

const mockedCurrentEdgeInfoDc = {
  clusterId: 'cluster-2',
  clusterName: 'Cluster 2',
  isDmzCluster: false
}

describe('Edge SD-LAN Detail - EdgeInfoDrawer', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_, res, ctx) => res(ctx.json(mockEdgeClusterList))
      )
    )
  })

  it('should render cluster info with DC setting correctly', async () => {
    render(
      <Provider>
        <EdgeInfoDrawer
          visible
          setVisible={() => {}}
          currentEdgeInfo={mockedCurrentEdgeInfoDc}
          edgeClusterTunnelInfo={mockedDmzSdLanData.edgeClusterTunnelInfo}
          guestEdgeClusterTunnelInfo={mockedDmzSdLanData.guestEdgeClusterTunnelInfo}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLan/:serviceId/detail' }
      }
    )

    expect(screen.getByText('Cluster 2: RUCKUS Edges')).toBeVisible()
    expect(await screen.findByText('Active APs')).toBeVisible()
    expect(await screen.findByText('Primary APs')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('row', { name: 'Smart Edge 1 Operational Active 3 10' })).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('row', { name: 'Smart Edge 2 Operational Active 6 10' })).toBeVisible()
    // eslint-disable-next-line max-len
    expect((screen.getByRole('link', { name: 'Smart Edge 1' }) as HTMLAnchorElement).href).toContain(`devices/edge/${targetClusterInfo.edgeList[0].serialNumber}/details/overview`)
    // eslint-disable-next-line max-len
    expect((screen.getByRole('link', { name: 'Smart Edge 2' }) as HTMLAnchorElement).href).toContain(`devices/edge/${targetClusterInfo.edgeList[1].serialNumber}/details/overview`)
  })

  it('should render cluster info with DMZ setting correctly', async () => {
    render(
      <Provider>
        <EdgeInfoDrawer
          visible
          setVisible={() => {}}
          currentEdgeInfo={mockedCurrentEdgeInfoDmz}
          edgeClusterTunnelInfo={mockedDmzSdLanData.edgeClusterTunnelInfo}
          guestEdgeClusterTunnelInfo={mockedDmzSdLanData.guestEdgeClusterTunnelInfo}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLan/:serviceId/detail' }
      }
    )

    expect(screen.getByText('Cluster 1: RUCKUS Edges')).toBeVisible()
    expect(await screen.findByText('Active Edges')).toBeVisible()
    expect(await screen.findByText('Primary Edges')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('row', { name: 'Smart Edge 1 Operational Active 2 2' })).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('row', { name: 'Smart Edge 2 Operational Active 1 2' })).toBeVisible()
    // eslint-disable-next-line max-len
    expect((screen.getByRole('link', { name: 'Smart Edge 1' }) as HTMLAnchorElement).href).toContain(`devices/edge/${targetClusterInfo.edgeList[0].serialNumber}/details/overview`)
    // eslint-disable-next-line max-len
    expect((screen.getByRole('link', { name: 'Smart Edge 2' }) as HTMLAnchorElement).href).toContain(`devices/edge/${targetClusterInfo.edgeList[1].serialNumber}/details/overview`)
  })
})