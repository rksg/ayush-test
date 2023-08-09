import { rest } from 'msw'

import {
  NetworkSegmentationUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import NetworkSegAuthDetail from './NetworkSegAuthDetail'

const data = {
  webAuthPasswordLabel: 'DPSK Password',
  webAuthCustomTitle: 'Enter your Password below and press the button',
  id: 'zxzz',
  name: 'Mock Template name'
}

describe( 'NetworkSegAuthDetail', () => {
  const params = { tenantId: 'tenant-id', serviceId: 'service-id' }

  beforeEach(async () => {
    mockServer.use(
      rest.get(
        NetworkSegmentationUrls.getWebAuthTemplate.url,
        (req, res, ctx) => res(ctx.json(data))
      ),
      rest.get(
        NetworkSegmentationUrls.getWebAuthTemplateSwitches.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it( 'should render successfully', async () => {
    render(
      <Provider>
        <NetworkSegAuthDetail />
      </Provider>, { route: { params, path: '/:tenantId/t/services/webAuth/:serviceId/detail' } }
    )

    await waitFor(() => expect(screen.getByText('DPSK Password')).toBeVisible())
    await waitFor(() =>
      expect(screen.getByText('Enter your Password below and press the button')).toBeVisible())
  })
})
