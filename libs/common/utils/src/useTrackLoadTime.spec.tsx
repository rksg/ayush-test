import { useContext, useEffect } from 'react'

import userEvent from '@testing-library/user-event'

import { render, screen, waitFor } from '@acx-ui/test-utils'

import {
  flattenRoutes,
  getLoadTimeStatus,
  getPageLoadStartTime,
  LoadTimeContext,
  LoadTimeProvider,
  TrackingPageConfig,
  useTrackLoadTime,
  widgetsMapping
} from './useTrackLoadTime'

describe('useTrackLoadTime', () => {
  it ('test flattenRoutes', () => {
    expect(flattenRoutes(TrackingPageConfig)).toEqual(
      expect.objectContaining({
        '^venues/([^/]+)/venue-details/overview$': expect.objectContaining({
          key: 'VENUES_DETAILS', subTab: 'Overview', isRegex: true, widgetCount: 12
        }),
        'analytics/incidents': expect.objectContaining({
          key: 'AI', subTab: 'Incidents', isRegex: false, widgetCount: 4
        }),
        'analytics/intentAI': expect.objectContaining({
          key: 'AI', subTab: 'IntentAI', isRegex: false, widgetCount: 1
        }),
        'dashboard': expect.objectContaining({
          key: 'DASHBOARD', subTab: '', isRegex: false, widgetCount: 13
        }),
        'devices/wifi': expect.objectContaining({
          key: 'AP', subTab: 'AP List', isRegex: false, widgetCount: 1
        }),
        'devices/wifi/apgroups': expect.objectContaining({
          key: 'AP', subTab: 'AP Group List', isRegex: false, widgetCount: 1
        }),
        'networks/wireless': expect.objectContaining({
          key: 'NETWORKS', subTab: 'Network List', isRegex: false, widgetCount: 1
        }),
        'timeline/events': expect.objectContaining({
          key: 'TIMELINE', subTab: 'Events', isRegex: false, widgetCount: 1
        }),
        'users/identity-management/identity': expect.objectContaining({
          key: 'IDENTITY', subTab: 'Identities', isRegex: false, widgetCount: 1
        }),
        'users/identity-management/identity-group': expect.objectContaining({
          key: 'IDENTITY', subTab: 'Identity Groups', isRegex: false, widgetCount: 1
        }),
        'users/switch/clients': expect.objectContaining({
          key: 'WIRED_CLIENTS', subTab: '', isRegex: false, widgetCount: 1
        }),
        'users/wifi/clients': expect.objectContaining({
          key: 'WIRELESS_CLIENTS', subTab: 'Clients List', isRegex: false, widgetCount: 1
        })
      })
    )

    localStorage.setItem('dashboard-tab', 'switch')
    expect(flattenRoutes(TrackingPageConfig)).toEqual(
      expect.objectContaining({
        dashboard: expect.objectContaining({
          key: 'DASHBOARD', subTab: '', isRegex: false, widgetCount: 14
        })
      })
    )
    localStorage.setItem('dashboard-tab', 'edge')
    expect(flattenRoutes(TrackingPageConfig)).toEqual(
      expect.objectContaining({
        dashboard: expect.objectContaining({
          key: 'DASHBOARD', subTab: '', isRegex: false, widgetCount: 11
        })
      })
    )
  })
  it('test getLoadTimeStatus', () => {
    expect(getLoadTimeStatus(999)).toBe('Normal')
    expect(getLoadTimeStatus(1599)).toBe('Slow')
    expect(getLoadTimeStatus(9999)).toBe('Unacceptable')
    expect(getLoadTimeStatus(99999)).toBe('Unacceptable')
  })

  it('test getPageLoadStartTime', () => {
    const loadTimes = {
      WiredClientsTable: { time: 2424, startTime: 1735539469319, isUnfulfilled: false }
    }
    expect(getPageLoadStartTime(1735539468537, loadTimes)).toBe(1735539468537)
    expect(getPageLoadStartTime(1735539469389, loadTimes)).toBe(1735539469319)
  })

  describe('LoadTimeProvider', () => {
    const TestFilterComponent = () => {
      const { onPageFilterChange } = useContext(LoadTimeContext)
      const handleFilterChange = () => {
        onPageFilterChange({ filterValues: { key: 'value' }, searchValue: 'search' })
      }
      return (
        <div>
          <button onClick={handleFilterChange}>Change Filter</button>
        </div>
      )
    }

    const TestComponent = () => {
      const { onPageFilterChange } = useContext(LoadTimeContext)
      useTrackLoadTime({
        itemName: widgetsMapping.WIRED_CLIENTS_TABLE,
        isEnabled: true,
        states: [{ isLoading: false, isSuccess: true, isFetching: false }]
      })

      useEffect(()=>{
        onPageFilterChange({ filterValues: {}, searchValue: '' }, true)
      },[])

      return <div>
        Test Component
        <TestFilterComponent />
      </div>
    }

    it('should render correctly', async () => {
      const mockPendoTrack = jest.fn()
      const params = { tenantId: 'tenant-id' }
      window.pendo = {
        initialize: jest.fn(),
        identify: jest.fn(),
        track: mockPendoTrack
      }

      render(
        <LoadTimeProvider>
          <TestComponent />
        </LoadTimeProvider>, {
          route: { path: '/:tenantId/t/users/switch/clients', params }
        })

      expect(screen.getByText('Test Component')).toBeInTheDocument()

      await waitFor(() => expect(mockPendoTrack).toBeCalledTimes(1))
      expect(mockPendoTrack).toHaveBeenCalledWith('testPageloadtime', {
        active_tab: '',
        components_load_time_ms: expect.any(String),
        criteria: expect.any(String),
        load_time_ms: expect.any(Number),
        load_time_text: 'Normal',
        page_title: 'Wired Clients List',
        page_type: 'Table',
        time: expect.any(String)
      })

      await userEvent.click(screen.getByText('Change Filter'))
      expect(mockPendoTrack).toBeCalledTimes(1)
    })

    it('should render unsupported page correctly', async () => {
      const mockPendoTrack = jest.fn()
      const params = { tenantId: 'tenant-id' }
      window.pendo = {
        initialize: jest.fn(),
        identify: jest.fn(),
        track: mockPendoTrack
      }

      render(
        <LoadTimeProvider>
          <TestComponent />
        </LoadTimeProvider>, {
          route: { path: '/:tenantId/t/users/switch/test', params }
        })

      expect(screen.getByText('Test Component')).toBeInTheDocument()
      await userEvent.click(screen.getByText('Change Filter'))
      expect(mockPendoTrack).not.toBeCalled()
    })
  })

})