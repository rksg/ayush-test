import { Form } from 'antd'
import { rest } from 'msw'

import { useIsSplitOn, Features }              from '@acx-ui/feature-toggle'
import { venueApi }                            from '@acx-ui/rc/services'
import { WifiRbacUrlsInfo }                    from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, waitFor, screen } from '@acx-ui/test-utils'

import { ApIpMode } from '.'

const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id',
  activeTab: 'wifi',
  activeSubTab: 'networking'
}

describe('Venue AP IP Mode', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(WifiRbacUrlsInfo.getVenueApIpMode.url,
        (_, res, ctx) => res(ctx.json({ mode: 'IPV6' })))
    )
  })
  it('should render correctly', async () => {
    jest.mocked(useIsSplitOn)
      .mockImplementation(ff => ff === Features.WIFI_EDA_IP_MODE_CONFIG_TOGGLE)

    render(
      <Provider>
        <Form>
          <ApIpMode />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitFor(() => screen.findByText('AP IP Mode'))
    expect(await screen.findByTestId('ipv4-radio-option')).toBeVisible()
    expect(await screen.findByTestId('ipv6-radio-option')).toBeVisible()
    expect(await screen.findByTestId('dual-radio-option')).toBeVisible()
  })
})