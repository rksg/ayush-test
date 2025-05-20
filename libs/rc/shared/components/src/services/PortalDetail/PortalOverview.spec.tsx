import { rest } from 'msw'

import { serviceApi }      from '@acx-ui/rc/services'
import { Demo }            from '@acx-ui/rc/utils'
import { PortalUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockDetailResult } from './__tests__/fixtures'
import { PortalOverview }   from './PortalOverview'

jest.mock('../PortalDemo', () => ({
  ...jest.requireActual('../PortalDemo'),
  PortalPreviewModal: () => <div>Preview</div>
}))

describe('Portal Overview', () => {

  beforeEach(() => {
    store.dispatch(serviceApi.util.resetApiState())
    mockServer.use(
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ acceptTermsLink: 'terms & conditions',
            acceptTermsMsg: 'I accept the' }))
        })
    )
  })
  it('should render detail page', async () => {
    const params = {
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
      serviceId: '373377b0cb6e46ea8982b1c80aabe1fa' }
    render(<Provider>
      <PortalOverview demoValue={mockDetailResult.content as Demo} />
    </Provider>, {
      route: { params, path: '/:tenantId/t/services/portal/:serviceId/detail' }
    })
    expect(await screen.findByText('WiFi4EU Snippet')).toBeVisible()
    expect(await screen.findByText('Language')).toBeVisible()
    expect(await screen.findByText('OFF')).toBeVisible()
    expect(await screen.findByText('English')).toBeVisible()
    expect(await screen.findByText('Preview')).toBeVisible()
  })
})
