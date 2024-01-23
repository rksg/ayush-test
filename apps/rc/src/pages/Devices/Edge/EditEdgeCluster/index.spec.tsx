import userEvent from '@testing-library/user-event'

import { CommonOperation, Device, activeTab, getUrl } from '@acx-ui/rc/utils'
import { render, screen }                             from '@acx-ui/test-utils'

import EditEdgeCluster from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edit Edge Cluster', () => {
  let params: { tenantId: string, clusterId: string, activeTab: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      clusterId: 'testClusterId',
      activeTab: 'cluster-details'
    }
  })

  it('should render EditEdgeCluster successfully', async () => {
    render(
      <EditEdgeCluster />, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    expect((await screen.findAllByRole('tab')).length).toBe(4)
    expect(await screen.findByText('cluster-details')).toBeVisible()
  })

  it('should change tab correctly', async () => {
    render(
      <EditEdgeCluster />, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    await userEvent.click(await screen.findByRole('tab', { name: 'Cluster Interface' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t${getUrl({
        feature: Device.EdgeCluster,
        oper: CommonOperation.Edit,
        after: [activeTab],
        params: {
          id: params.clusterId,
          activeTab: 'cluster-interface'
        } })}`,
      hash: '',
      search: ''
    })
  })
})