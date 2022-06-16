import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo }             from '@acx-ui/rc/utils'
import { generatePath }               from '@acx-ui/react-router-dom'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import NetworkTabs from './NetworkTabs'

const networkDetailHeaderData = {
  activeVenueCount: 1,
  aps: {
    totalApCount: 1
  }
}
describe('NetworkTabs', () => {
  it('should render correctly', async () => {
    const params = { networkId: 'network-id', tenantId: 'tenant-id' }
    const url = generatePath(CommonUrlsInfo.getNetworksDetailHeader.url, params)
    mockServer.use(
      rest.get(url, (req, res, ctx) => res(ctx.json(networkDetailHeaderData)))
    )

    const { asFragment } = render(<NetworkTabs />, {
      route: { params },
      store: true
    })

    expect(asFragment()).toMatchSnapshot()
    await screen.findByText('Overview')
    await screen.findByText('APs (0)')
    await screen.findByText('Venues (0)')
    await screen.findByText('Services (0)')
    await screen.findByText('Events')
    await screen.findByText('Incidents')
  })
})
