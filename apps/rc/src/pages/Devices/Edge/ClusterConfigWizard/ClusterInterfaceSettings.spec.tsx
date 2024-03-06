import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { ClusterInterfaceSettings } from './ClusterInterfaceSettings'

describe('ClusterInterfaceSettings', () => {
  let params: { tenantId: string, clusterId:string, settingType:string }
  beforeEach(() => {
    params = {
      tenantId: 'mocked_t_id',
      clusterId: 'mocked_cluster_id',
      settingType: 'clusterInterface'
    }
  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <ClusterInterfaceSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })
    expect(screen.getByText('Cluster Interface Settings')).toBeInTheDocument()
  })
})
