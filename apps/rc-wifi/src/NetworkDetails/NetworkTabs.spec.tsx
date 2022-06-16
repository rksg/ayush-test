import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo }                      from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import NetworkTabs from './NetworkTabs'

const networkDetailHeaderData = {
  activeVenueCount: 1,
  aps: {
    totalApCount: 1
  }
}
describe('NetworkTabs', () => {
  it('should render correctly', async () => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getNetworksDetailHeader.url,
        (_, res, ctx) => res(ctx.json(networkDetailHeaderData))
      )
    )

    const { asFragment } = render(<Provider><NetworkTabs /></Provider>, {
      route: { params: { networkId: 'network-id', tenantId: 'tenant-id' } }
    })

    expect(asFragment()).toMatchSnapshot()
    await screen.findByText('Overview')
    await screen.findByText('APs (0)')
    await screen.findByText('Venues (0)')
    await screen.findByText('Services (0)')
    await screen.findByText('Events')
    await screen.findByText('Incidents')
    await waitFor(() => screen.findByText('APs (1)'))
    await waitFor(() => screen.findByText('Venues (1)'))
  })
})
