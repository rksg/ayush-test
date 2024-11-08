import '@testing-library/jest-dom'
import { rest } from 'msw'

import { get }                                from '@acx-ui/config'
import { useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { venueApi }                           from '@acx-ui/rc/services'
import { CommonUrlsInfo, CommonRbacUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                    from '@acx-ui/store'
import { mockServer, render, screen }         from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions }  from '@acx-ui/user'

import { venueDetailHeaderData } from '../__tests__/fixtures'

import { VenueDetails } from '.'

jest.mock('@acx-ui/analytics/components', () => {
  const sets = Object.keys(jest.requireActual('@acx-ui/analytics/components'))
    .map(key => [key, () => <div data-testid={`analytics-${key}`} title={key} />])
  return Object.fromEntries(sets)
})

jest.mock('@acx-ui/rc/components', () => {
  const sets = Object.keys(jest.requireActual('@acx-ui/rc/components'))
    .map(key => [key, () => <div data-testid={`rc-${key}`} title={key} />])
  return Object.fromEntries(sets)
})
jest.mock('./VenueOverviewTab', () => ({
  VenueOverviewTab: () => <div data-testid={'rc-VenueOverviewTab'} title='VenueOverviewTab' />
}))
jest.mock('./VenueAnalyticsTab', () => ({
  VenueAnalyticsTab: () => <div data-testid={'rc-VenueAnalyticsTab'} title='VenueAnalyticsTab' />
}))
jest.mock('./VenueClientsTab', () => ({
  VenueClientsTab: () => <div data-testid={'rc-VenueClientsTab'} title='VenueClientsTab' />
}))
jest.mock('./VenueDevicesTab', () => ({
  VenueDevicesTab: () => <div data-testid={'rc-VenueDevicesTab'} title='VenueDevicesTab' />
}))
jest.mock('./VenueNetworksTab', () => ({
  VenueNetworksTab: () => <div data-testid={'rc-VenueNetworksTab'} title='VenueNetworksTab' />
}))
jest.mock('./VenueServicesTab', () => ({
  VenueServicesTab: () => <div data-testid={'rc-VenueServicesTab'} title='VenueServicesTab' />
}))
jest.mock('./VenueTimelineTab', () => ({
  VenueTimelineTab: () => <div data-testid={'rc-VenueTimelineTab'} title='VenueTimelineTab' />
}))

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))
const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  ...jest.requireActual('@acx-ui/config'),
  get: jest.fn()
}))

describe('VenueDetails', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })

    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenueDetailsHeader.url,
        (req, res, ctx) => res(ctx.json(venueDetailHeaderData))
      ),
      rest.post(
        CommonRbacUrlsInfo.getRwgListByVenueId.url,
        (req, res, ctx) => res(ctx.json({ response: { data: [] } }))
      )
    )
  })

  afterEach(() => {
    mockedUseConfigTemplate.mockRestore()
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'overview'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/:venueId/venue-details/:activeTab' }
    })
    expect(await screen.findByText('testVenue')).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(7)
    expect(await screen.findByTestId('rc-VenueOverviewTab')).toBeVisible()
  })

  it('should navigate to analytic tab correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'analytics'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/t/venue-details/:activeTab' }
    })
    expect(await screen.findByTestId('rc-VenueAnalyticsTab')).toBeVisible()
  })

  it('should navigate to client tab correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'clients'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/t/venue-details/:activeTab' }
    })
    expect(await screen.findByTestId('rc-VenueClientsTab')).toBeVisible()
  })

  it('should navigate to device tab correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'devices'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/:venueId/venue-details/:activeTab' }
    })
    expect(await screen.findByTestId('rc-VenueDevicesTab')).toBeVisible()
  })

  it('should navigate to network tab correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'networks'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/:venueId/venue-details/:activeTab' }
    })
    expect(await screen.findByTestId('rc-VenueNetworksTab')).toBeVisible()
  })

  it('should navigate to service tab correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'services'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/:venueId/venue-details/:activeTab' }
    })
    expect(await screen.findByTestId('rc-VenueServicesTab')).toBeVisible()
  })

  it('should navigate to timeline tab correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'timeline'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/:venueId/venue-details/:activeTab' }
    })
    expect(await screen.findByTestId('rc-VenueTimelineTab')).toBeVisible()
  })

  it('should not navigate to non-existent tab', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'not-exist'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/:venueId/venue-details/:activeTab' }
    })

    expect(screen.getAllByRole('tab').filter(x => x.getAttribute('aria-selected') === 'true'))
      .toHaveLength(0)
  })

  it('should hide incidents when READ_INCIDENTS permission is false', async () => {
    mockGet.mockReturnValue('true')
    setRaiPermissions({ READ_INCIDENTS: false } as RaiPermissions)
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'analytics'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/venue-details/:activeTab' }
    })
    expect(screen.queryByTestId('rc-VenueAnalyticsTab')).toBeNull()
  })

  it('should navigate to network tab correctly with isTemplate equal to true', async () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'networks'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/v/:venueId/venue-details/:activeTab' }
    })
    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })

})
