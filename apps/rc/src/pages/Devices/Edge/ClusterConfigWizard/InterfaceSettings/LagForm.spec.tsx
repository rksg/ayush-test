import { StepsForm }                                       from '@acx-ui/components'
import { EdgeClusterStatus, EdgeGeneralFixtures, EdgeLag } from '@acx-ui/rc/utils'
import { render, screen }                                  from '@acx-ui/test-utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { LagForm } from './LagForm'


const { mockEdgeClusterList } = EdgeGeneralFixtures

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeLagTable: (
    { onAdd, onEdit, onDelete }:
    {
      onAdd: (serialNumber: string, data: EdgeLag) => Promise<void>,
      onEdit: (serialNumber: string, data: EdgeLag) => Promise<void>,
      onDelete: (serialNumber: string, id: string) => Promise<void>
    }
  ) => <div data-testid='lag-table'>
    <button onClick={() => onAdd('1', {} as EdgeLag)}>TestAdd</button>
    <button onClick={() => onEdit('1', {} as EdgeLag)}>TestEdit</button>
    <button onClick={() => onDelete('1', '2')}>TestDelete</button>
  </div>
}))

describe('InterfaceSettings - LagForm', () => {
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
        clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus
      }}>
        <StepsForm>
          <StepsForm.StepForm>
            <LagForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    expect(screen.getByText('LAG Settings')).toBeVisible()
    expect(await screen.findByTestId('lag-table')).toBeVisible()
  })
})