import { rest } from 'msw'

import { useIsSplitOn }                                                            from '@acx-ui/feature-toggle'
import { AdministrationUrlsInfo, CommonUrlsInfo }                                  from '@acx-ui/rc/utils'
import { Provider }                                                                from '@acx-ui/store'
import { render, screen, mockRestApiQuery, waitForElementToBeRemoved, mockServer } from '@acx-ui/test-utils'

import { MapWidget, MapWidgetV2 } from '.'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useDashboardFilter: () => ({
    filters: {
      filter: {
        networkNodes: [
          {
            0: {
              name: 'Venue A',
              id: 'venue_a'
            },
            1: {
              name: 'Subnet 1',
              id: 'subnet_1'
            }
          }
        ]
      }
    }
  })
}))

describe('Map', () => {
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getDashboardOverview.url, 'get', {})

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json({ global: {
          mapRegion: 'TW'
        } }))
      )
    )
  })
  it('should not render map if feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<Provider><MapWidget /></Provider>)
    await screen.findByText('Map is not enabled')
  })
  it('should render map if feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const { asFragment } = render(<Provider><MapWidget /></Provider>, {
      route: { params }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
})


describe('Map v2', () => {
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getDashboardV2Overview.url, 'post', {})
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json({ global: {
          mapRegion: 'TW'
        } }))
      )
    )
  })
  it('should not render map if feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<Provider><MapWidgetV2 /></Provider>)
    await screen.findByText('Map is not enabled')
  })
  it('should render map if feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const { asFragment } = render(<Provider><MapWidgetV2 /></Provider>, {
      route: { params }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
})