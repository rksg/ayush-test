import { StepsForm }                                                                                              from '@acx-ui/components'
import { EdgeClusterStatus, EdgeGeneralFixtures, EdgePortConfigFixtures, EdgeSdLanFixtures, EdgeSdLanViewDataP2 } from '@acx-ui/rc/utils'
import { render, screen }                                                                                         from '@acx-ui/test-utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { PortForm }                   from './PortForm'
import { transformFromApiToFormData } from './utils'

const { mockEdgeClusterList, mockedHaNetworkSettings } = EdgeGeneralFixtures
const { mockedPortsStatus } = EdgePortConfigFixtures
const { mockedSdLanServiceP2Dmz } = EdgeSdLanFixtures
// eslint-disable-next-line max-len
const mockedHaWizardNetworkSettings = transformFromApiToFormData(mockedHaNetworkSettings, mockEdgeClusterList.data[0] as EdgeClusterStatus)

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgePortsGeneralBase: (
  ) => <div data-testid='rc-EdgePortsGeneralBase'>
  </div>
}))

const defaultCxtData = {
  clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
  portsStatus: mockedPortsStatus,
  edgeSdLanData: mockedSdLanServiceP2Dmz as EdgeSdLanViewDataP2,
  isLoading: false,
  isFetching: false
}
describe('InterfaceSettings - PortForm', () => {
  let params: { tenantId: string, clusterId:string, settingType:string }
  beforeEach(() => {
    params = {
      tenantId: 'mocked_t_id',
      clusterId: 'mocked_cluster_id',
      settingType: 'interface'
    }
  })

  it('should correctly render', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <StepsForm initialValues={mockedHaWizardNetworkSettings}>
          <StepsForm.StepForm>
            <PortForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    expect(screen.getByText('Port General Settings')).toBeVisible()
    const infoTitle = screen.getByText(/all SmartEdges in this cluster/)
    expect(infoTitle).toHaveTextContent('(Edge Cluster 1)')
    expect(screen.getAllByRole('tab').length).toBe(2)
    const tab = screen.getByRole('tab', { name: 'Smart Edge 1' })
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
    expect(await screen.findByTestId('rc-EdgePortsGeneralBase')).toBeVisible()
  })
})