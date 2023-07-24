import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo }   from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
import { mockServer, render, screen }     from '@acx-ui/test-utils'
import { RolesEnum }                      from '@acx-ui/types'
import { getUserProfile, setUserProfile } from '@acx-ui/user'

import NetworkDetails from './NetworkDetails'

jest.mock('./NetworkIncidentsTab', () => ({
  NetworkIncidentsTab: () => <div data-testid='rc-NetworkIncidentsTab'>incidents</div>
}))
jest.mock('./NetworkOverviewTab', () => ({ NetworkOverviewTab: () => <div>overview</div> }))

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

jest.mock('socket.io-client')

const mockedVenuesResult = {
  totalCount: 1,
  page: 1,
  data: [{
    id: 'v1',
    name: 'My Venue'
  }]
}

describe('NetworkDetails', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        CommonUrlsInfo.getNetworksDetailHeader.url,
        (_, res, ctx) => res(ctx.json(networkDetailHeaderData))
      ),
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (req, res, ctx) => res(ctx.json(mockedVenuesResult))
      )
    )
  })

  it('renders a tab', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
      activeTab: 'overview'
    }
    render(<Provider><NetworkDetails /></Provider>, {
      route: { params, path: '/:tenantId/:networkId/:activeTab' }
    })

    expect(await screen.findByText('overview')).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(5)
  })

  it('renders another tab', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
      activeTab: 'incidents'
    }
    render(<Provider><NetworkDetails /></Provider>, {
      route: { params, path: '/:tenantId/:networkId/:activeTab' }
    })

    expect(await screen.findByText('incidents')).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(5)
  })

  it('should hide incidents when role is READ_ONLY', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: { ...getUserProfile().profile, roles: [RolesEnum.READ_ONLY] }
    })
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
      activeTab: 'incidents'
    }
    render(<Provider><NetworkDetails /></Provider>, {
      route: { params, path: '/:tenantId/:networkId/:activeTab' }
    })
    expect(screen.queryByTestId('rc-NetworkIncidentsTab')).toBeNull()
  })
})
