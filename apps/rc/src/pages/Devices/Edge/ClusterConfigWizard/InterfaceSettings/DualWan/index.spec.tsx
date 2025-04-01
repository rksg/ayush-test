import { StepsForm }                              from '@acx-ui/components'
import { EdgeClusterStatus, EdgeGeneralFixtures } from '@acx-ui/rc/utils'
import { render, screen }                         from '@acx-ui/test-utils'

import { ClusterConfigWizardContext } from '../../ClusterConfigWizardDataProvider'

import { DualWanForm } from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const mockedClusterInfo = mockEdgeClusterList.data[0] as EdgeClusterStatus

jest.mock('./DualWanSettingsForm', () => ({
  DualWanSettingsForm: () => <div data-testid='DualWanSettingsForm'>
  </div>
}))

describe('InterfaceSettings - DualWanForm', () => {
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
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockedClusterInfo,
        isLoading: false,
        isFetching: false
      }}>
        <StepsForm>
          <StepsForm.StepForm>
            <DualWanForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    expect(screen.getByText('Dual WAN Settings')).toBeVisible()
    expect(await screen.findByTestId('DualWanSettingsForm')).toBeVisible()
  })
})