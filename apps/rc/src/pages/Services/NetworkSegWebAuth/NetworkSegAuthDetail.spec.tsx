import { rest } from 'msw'

import {
  AccessSwitch,
  NetworkSegmentationUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render
} from '@acx-ui/test-utils'

import NetworkSegAuthDetail from './NetworkSegAuthDetail'

const list = {
  totalCount: 1,
  page: 1,
  data: [{
    id: 'zxzz',
    name: 'Mock Template name',
    webAuth_password_label: 'DPSK Password',
    webAuth_custom_title: 'Enter your Password below and press the button',
    webAuth_custom_top: 'Welcome to Ruckus Networks Web Authentication Homepage',
    webAuth_custom_login_button: 'Login',
    webAuth_custom_bottom: `This network is restricted to authorized users only.
      Violators may be subjected to legal prosecution.
      Acitvity on this network is monitored and may be used as evidence in a court of law.
      Copyright 2022 Ruckus Networks`,
    switches: [] as AccessSwitch[],
    tag: 'abc, 123'
  }]
}

describe( 'NetworkSegAuthDetail', () => {
  const params = { tenantId: 'tenant-id', serviceId: 'service-id' }

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        NetworkSegmentationUrls.getWebAuthTemplateList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
  })

  it( 'should render successfully', async () => {
    const { asFragment } = render(
      <Provider>
        <NetworkSegAuthDetail />
      </Provider>, { route: { params, path: '/:tenantId/services/webAuth/:serviceId/detail' } }
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
