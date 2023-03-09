import { rest } from 'msw'

import {
  NetworkSegmentationUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import NetworkSegAuthTable from './NetworkSegAuthTable'

const data = [{
  webAuthPasswordLabel: 'DPSK Password',
  webAuthCustomTitle: 'Enter your Password below and press the button',
  id: 'zxzz',
  name: 'Mock Template name'
}]

describe( 'NetworkSegAuthTable', () => {
  const params = { tenantId: 'tenant-id', serviceId: 'service-id' }

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        NetworkSegmentationUrls.getWebAuthTemplateList.url,
        (req, res, ctx) => res(ctx.json({ data, page: 1, totalCount: 1, totalPages: 1 }))
      )
    )
  })

  it( 'should render successfully', async () => {
    render(
      <Provider>
        <NetworkSegAuthTable />
      </Provider>, { route: { params, path: '/:tenantId/services/webAuth/list' } }
    )

    await screen.findAllByRole('row', { name: /Mock Template name/i })
  })
})
