import { rest } from 'msw'

import { EdgeClusterStatus, EdgeGeneralFixtures, EdgeLagFixtures, EdgePortConfigFixtures, EdgeSdLanFixtures, EdgeSdLanViewDataP2, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, within }                                                                         from '@acx-ui/test-utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { InterfaceSettings } from '.'

const { mockEdgeCluster, mockEdgeClusterList } = EdgeGeneralFixtures
const { mockedEdgeLagList } = EdgeLagFixtures
const { mockedPortsStatus, mockEdgePortConfig } = EdgePortConfigFixtures
const { mockedSdLanServiceP2Dmz } = EdgeSdLanFixtures

jest.mock('./LagForm', () => ({
  ...jest.requireActual('./LagForm'),
  LagForm: () => <div data-testid='rc-LagForm'>
  </div>
}))
jest.mock('./PortForm', () => ({
  ...jest.requireActual('./PortForm'),
  PortForm: () => <div data-testid='rc-PortForm'>
  </div>
}))
jest.mock('./Summary', () => ({
  ...jest.requireActual('./Summary'),
  Summary: () => <div data-testid='rc-Summary'>
  </div>
}))

const defaultCxtData = {
  clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
  portsStatus: mockedPortsStatus,
  edgeSdLanData: mockedSdLanServiceP2Dmz as EdgeSdLanViewDataP2,
  isLoading: false,
  isFetching: false
}

describe('InterfaceSettings', () => {
  let params: { tenantId: string, clusterId:string, settingType:string }
  beforeEach(() => {
    params = {
      tenantId: 'mocked_t_id',
      clusterId: 'mocked_cluster_id',
      settingType: 'interface'
    }

    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getEdgeCluster.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeCluster))
      ),
      rest.get(
        EdgeUrlsInfo.getEdgeLagList.url,
        (_req, res, ctx) => res(ctx.json(mockedEdgeLagList))
      ),
      rest.get(
        EdgeUrlsInfo.getPortConfig.url,
        (_req, res, ctx) => res(ctx.json(mockEdgePortConfig))
      )
    )
  })

  it('should correctly render', async () => {
    render(<Provider>
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <InterfaceSettings />
      </ClusterConfigWizardContext.Provider>
    </Provider>,
    {
      route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const form = await screen.findByTestId('steps-form')
    within(form).getByRole('button', { name: 'LAG' })
    expect(await screen.findByTestId('rc-LagForm')).toBeVisible()
  })

  // TODO: on value change
  // TODO: compatibility check
})