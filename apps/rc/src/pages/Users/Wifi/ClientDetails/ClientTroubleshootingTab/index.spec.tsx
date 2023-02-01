
import { dataApiURL }         from '@acx-ui/analytics/services'
import { Provider }           from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { ClientTroubleshootingTab } from './index'

describe('ClientTroubleshootingTab', () => {
  beforeEach(() => {
    mockGraphqlQuery(dataApiURL, 'ClientInfo', {
      data: {
        client: {
          connectionDetailsByAp: [],
          connectionEvents: [],
          connectionQualities: [],
          incidents: []
        }
      }
    })
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'client-mac',
      activeTab: 'troubleshooting'
    }

    mockGraphqlQuery(dataApiURL, 'ClientInfo', { data: {
      client: {
        connectionDetailsByAp: [],
        connectionEvents: [],
        connectionQualities: [],
        incidents: []
      }
    } })

    const { asFragment } = render(<Provider><ClientTroubleshootingTab /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/:clientId/details/:activeTab' }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('All Categories')).toBeVisible()
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
      .forEach((node:Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    expect(fragment).toMatchSnapshot()
  })
})