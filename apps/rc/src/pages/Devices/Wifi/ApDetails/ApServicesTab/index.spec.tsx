import '@testing-library/jest-dom'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ApServicesTab } from './index'


describe('ApServicesTab', () => {
  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'services'
    }

    render(
      <Provider>
        <ApServicesTab />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/details/:activeTab' }
      })

    expect(await screen.findByText('Services')).toBeVisible()
  })
})
