import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo, websocketServerUrl, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                         from '@acx-ui/store'
import { mockServer, render, screen }                       from '@acx-ui/test-utils'

import { NetworkDetails } from './NetworkDetails'

const network = {
  type: 'aaa',
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  venues: [
    {
      venueId: 'd7b1a9a350634115a92ee7b0f11c7e75',
      dual5gEnabled: true,
      tripleBandEnabled: false,
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
      allApGroupsRadio: 'Both',
      isAllApGroups: true,
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      id: '7a97953dc55f4645b3cdbf1527f3d7cb'
    }
  ],
  name: 'testNetwork',
  enableAuthProxy: false,
  enableAccountingProxy: false,
  id: '373377b0cb6e46ea8982b1c80aabe1fa'
}

const networkDetailHeaderData = {
  activeVenueCount: 1,
  aps: {
    totalApCount: 1
  }
}

describe('NetworkDetails', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        CommonUrlsInfo.getNetworksDetailHeader.url,
        (req, res, ctx) => res(ctx.json(networkDetailHeaderData))
      ),
      rest.get(`http://localhost${websocketServerUrl}/`,
        (_, res, ctx) => res(ctx.json([])))
    )
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
      activeTab: 'overview'
    }
    const { asFragment } = render(<Provider><NetworkDetails /></Provider>, {
      route: { params, path: '/:tenantId/:networkId/:activeTab' }
    })

    expect(await screen.findByText('testNetwork')).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(6)

    expect(asFragment()).toMatchSnapshot()
  })

  it('should not have active tab if it does not exist', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
      activeTab: 'not-exist'
    }
    render(<Provider><NetworkDetails /></Provider>, {
      route: { params, path: '/:tenantId/:networkId/:activeTab' }
    })

    expect(screen.getAllByRole('tab').filter(x => x.getAttribute('aria-selected') === 'true'))
      .toHaveLength(0)
  })
})
