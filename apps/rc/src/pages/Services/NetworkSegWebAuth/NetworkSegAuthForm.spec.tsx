import { rest } from 'msw'

import {
  NetworkSegmentationUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render
} from '@acx-ui/test-utils'

import NetworkSegAuthForm from './NetworkSegAuthForm'


describe( 'NetworkSegAuthForm', () => {
  const params = { tenantId: 'tenant-id', serviceId: 'service-id' }

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        NetworkSegmentationUrls.getWebAuthTemplateList.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it( 'should render successfully', async () => {
    const { asFragment } = render(
      <Provider>
        <NetworkSegAuthForm />
      </Provider>, { route: { params, path: '/:tenantId/services/webAuth/add' } }
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
