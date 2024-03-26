import { StepsForm }                              from '@acx-ui/components'
import { EdgeClusterStatus, EdgeGeneralFixtures } from '@acx-ui/rc/utils'
import { render, screen }                         from '@acx-ui/test-utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { VirtualIpForm } from './VirtualIpForm'


const { mockEdgeClusterList } = EdgeGeneralFixtures

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeClusterVirtualIpSettingForm: () => <div data-testid='virtual-ip-seeting-form' />
}))

describe('InterfaceSettings - VirtualIpForm', () => {
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
        clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
        isLoading: false,
        isFetching: false
      }}>
        <StepsForm>
          <StepsForm.StepForm>
            <VirtualIpForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    expect(screen.getByText('Cluster Virtual IP')).toBeVisible()
    expect(await screen.findByTestId('virtual-ip-seeting-form')).toBeVisible()
  })
})