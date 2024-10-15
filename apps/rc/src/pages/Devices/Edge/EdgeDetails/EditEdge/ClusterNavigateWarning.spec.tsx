/* eslint-disable max-len */
import { render, screen } from '@acx-ui/test-utils'

import { ClusterNavigateWarning }                       from './ClusterNavigateWarning'
import { EditEdgeDataContext, EditEdgeDataContextType } from './EditEdgeDataProvider'

describe('EditEdge - ClusterNavigateWarning', () => {
  let params = {
    tenantId: 't-tenantId',
    serialNumber: 't-serialNumber',
    activeTab: 'ports'
  }
  it('Should render successfully', async () => {
    const { container } = render(
      <EditEdgeDataContext.Provider value={{
        clusterInfo: {
          clusterId: 't-clusterId',
          name: 't-clusterName'
        }
      } as EditEdgeDataContextType}>
        <ClusterNavigateWarning />
      </EditEdgeDataContext.Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab' }
      })
    expect(container).toHaveTextContent('This node has already been a part of the cluster')
    const link = screen.getByRole('link', { name: 'Cluster & RUCKUS Edge configuration wizard' }) as HTMLAnchorElement
    expect(link.href).toContain('/devices/edge/cluster/t-clusterId/configure')
  })
})