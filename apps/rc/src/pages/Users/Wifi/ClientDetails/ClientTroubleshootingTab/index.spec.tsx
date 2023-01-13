
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ClientTroubleshootingTab } from './index'

describe('ClientTroubleshootingTab', () => {
  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'client-mac',
      activeTab: 'troubleshooting'
    }
    const { asFragment } = render(<Provider><ClientTroubleshootingTab /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/:clientId/details/:activeTab' }
    })
    expect(await screen.findByText('All Categories')).toBeVisible()
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
      .forEach((node:Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    expect(fragment).toMatchSnapshot()
  })
})