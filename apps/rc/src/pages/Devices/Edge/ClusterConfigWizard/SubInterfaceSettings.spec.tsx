import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { SubInterfaceSettings } from './SubInterfaceSettings'

describe('SubInterfaceSettings', () => {
  let params: { tenantId: string, clusterId:string, settingType:string }
  beforeEach(() => {
    params = {
      tenantId: 'mocked_t_id',
      clusterId: 'mocked_cluster_id',
      settingType: 'subInterface'
    }
  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <SubInterfaceSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })
    expect(screen.getByText('Sub-interface Settings')).toBeInTheDocument()
  })
})
