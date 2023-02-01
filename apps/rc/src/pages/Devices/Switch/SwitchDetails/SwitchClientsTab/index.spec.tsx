import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { SwitchClientDetailsPage } from './SwitchClientDetailsPage'

describe('SwitchConfigurationTab', () => {
  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenantId',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview'
    }
    render(<Provider><SwitchClientDetailsPage /></Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber'
      }
    })
  })
})