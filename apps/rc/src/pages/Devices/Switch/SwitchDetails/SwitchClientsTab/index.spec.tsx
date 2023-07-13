/* eslint-disable align-import/align-import */
import { rest } from 'msw'

import { SwitchUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import { screen,mockServer, render } from '@acx-ui/test-utils'

import { SwitchClientDetailsPage } from './SwitchClientDetailsPage'


describe('SwitchConfigurationTab', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(SwitchUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json([]))
      )
    )
  })
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
    expect(await screen.findByText('Device Type')).toBeVisible()
  })
})
