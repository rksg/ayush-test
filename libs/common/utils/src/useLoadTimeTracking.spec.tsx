import { useContext, useEffect } from 'react'

import userEvent from '@testing-library/user-event'

import { render, screen, waitFor } from '@acx-ui/test-utils'

import {
  flattenRoutes,
  getLoadTimeStatus,
  getPageType,
  getPageLoadStartTime,
  // getPageWidgetCount,
  LoadTimeContext,
  LoadTimeProvider,
  TrackingPages,
  TrackingPageConfig,
  useLoadTimeTracking
} from './useLoadTimeTracking'

describe('useLoadTimeTracking', () => {
  it ('test flattenRoutes', () => {
    // expect(flattenRoutes(pageRoutes)).toEqual({
    //   '^venues/([^/]+)/venue-details/overview$': {key: 'VENUES', subTab: 'OVERVIEW', isRegex: true},
    //   '^venues/([^/]+)/venue-details/test$': {key: 'VENUES', subTab: 'TEST', isRegex: true},
    //   'analytics/incidents': {key: 'AI', subTab: 'INCIDENTS', isRegex: false},
    //   'analytics/intentAI': {key: 'AI', subTab: 'INTENT_AI', isRegex: false},
    //   'dashboard': {key: 'DASHBOARD', subTab: '', isRegex: false},
    //   'devices/wifi': {key: 'AP', subTab: 'LIST', isRegex: false},
    //   'devices/wifi/apgroups': {key: 'AP', subTab: 'GROUP_LIST', isRegex: false},
    //   'networks/wireless': {key: 'NETWORKS', subTab: 'LIST', isRegex: false},
    //   'timeline/events': {key: 'TIMELINE', subTab: 'EVENTS', isRegex: false},
    //   'users/identity-management/identity' : {key: 'IDENTITY', subTab: 'LIST', isRegex: false},
    //   'users/identity-management/identity-group': {key: 'IDENTITY', subTab: 'GROUP_LIST', isRegex: false},
    //   'users/switch/clients': {key: 'WIRED_CLIENTS', subTab: '', isRegex: false},
    //   'users/wifi/clients': {key: 'WIRELESS_CLIENTS', subTab: 'CLIENTS', isRegex: false}
    // })

    // expect(flattenRoutes(TrackingPageConfig)).toEqual({
    //   '^venues/([^/]+)/venue-details/overview$': {
    //     key: 'VENUES', subTab: 'OVERVIEW', isRegex: true
    //   },
    //   '^venues/([^/]+)/venue-details/test$': { key: 'VENUES', subTab: 'TEST', isRegex: true },
    //   'analytics/incidents': { key: 'AI', subTab: 'INCIDENTS', isRegex: false },
    //   'analytics/intentAI': { key: 'AI', subTab: 'INTENT_AI', isRegex: false },
    //   'dashboard': { key: 'DASHBOARD', subTab: '', isRegex: false },
    //   'devices/wifi': { key: 'AP', subTab: 'LIST', isRegex: false },
    //   'devices/wifi/apgroups': { key: 'AP', subTab: 'GROUP_LIST', isRegex: false },
    //   'networks/wireless': { key: 'NETWORKS', subTab: 'LIST', isRegex: false },
    //   'timeline/events': { key: 'TIMELINE', subTab: 'EVENTS', isRegex: false },
    //   'users/identity-management/identity': { key: 'IDENTITY', subTab: 'LIST', isRegex: false },
    //   'users/identity-management/identity-group': {
    //     key: 'IDENTITY', subTab: 'GROUP_LIST', isRegex: false
    //   },
    //   'users/switch/clients': { key: 'WIRED_CLIENTS', subTab: '', isRegex: false },
    //   'users/wifi/clients': { key: 'WIRELESS_CLIENTS', subTab: 'CLIENTS', isRegex: false }
    // })

    expect(flattenRoutes(TrackingPageConfig)).toEqual(
      expect.objectContaining({
        '^venues/([^/]+)/venue-details/overview$': expect.objectContaining({
          key: 'VENUES', subTab: 'OVERVIEW', isRegex: true, widgetCount: 11
        }),
        '^venues/([^/]+)/venue-details/test$': expect.objectContaining({
          key: 'VENUES', subTab: 'TEST', isRegex: true, widgetCount: 0
        }),
        'analytics/incidents': expect.objectContaining({
          key: 'AI', subTab: 'INCIDENTS', isRegex: false, widgetCount: 4
        }),
        'analytics/intentAI': expect.objectContaining({
          key: 'AI', subTab: 'INTENT_AI', isRegex: false, widgetCount: 1
        }),
        'dashboard': expect.objectContaining({
          key: 'DASHBOARD', subTab: '', isRegex: false, widgetCount: 13
        }),
        'devices/wifi': expect.objectContaining({
          key: 'AP', subTab: 'LIST', isRegex: false, widgetCount: 1
        }),
        'devices/wifi/apgroups': expect.objectContaining({
          key: 'AP', subTab: 'GROUP_LIST', isRegex: false, widgetCount: 1
        }),
        'networks/wireless': expect.objectContaining({
          key: 'NETWORKS', subTab: 'LIST', isRegex: false, widgetCount: 1
        }),
        'timeline/events': expect.objectContaining({
          key: 'TIMELINE', subTab: 'EVENTS', isRegex: false, widgetCount: 1
        }),
        'users/identity-management/identity': expect.objectContaining({
          key: 'IDENTITY', subTab: 'LIST', isRegex: false, widgetCount: 1
        }),
        'users/identity-management/identity-group': expect.objectContaining({
          key: 'IDENTITY', subTab: 'GROUP_LIST', isRegex: false, widgetCount: 1
        }),
        'users/switch/clients': expect.objectContaining({
          key: 'WIRED_CLIENTS', subTab: '', isRegex: false, widgetCount: 1
        }),
        'users/wifi/clients': expect.objectContaining({
          key: 'WIRELESS_CLIENTS', subTab: 'CLIENTS', isRegex: false, widgetCount: 1
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

  it('test getPageType', () => {
    expect(getPageType(TrackingPages.DASHBOARD)).toBe('Dashboard')
    expect(getPageType(TrackingPages.VENUES, 'OVERVIEW')).toBe('Dashboard')
    expect(getPageType(TrackingPages.VENUES, 'Test')).toBe('')
    expect(getPageType(TrackingPages.WIRELESS_CLIENTS)).toBe('Table')
    expect(getPageType(TrackingPages.WIRED_CLIENTS)).toBe('Table')
    expect(getPageType(TrackingPages.TIMELINE)).toBe('Table')
    expect(getPageType('Test')).toBe('')
  })

  it('test getPageLoadStartTime', () => {
    const loadTimes = {
      WiredClientsTable: { time: 2424, startTime: 1735539469319, isUnfulfilled: false }
    }
    expect(getPageLoadStartTime(1735539468537, loadTimes)).toBe(1735539468537)
    expect(getPageLoadStartTime(1735539469389, loadTimes)).toBe(1735539469319)
  })

  // it('test getPageWidgetCount', () => {
  //   expect(getPageWidgetCount(TrackingPages.DASHBOARD, undefined, true)).toBe(13)
  //   expect(getPageWidgetCount(TrackingPages.VENUES, 'OVERVIEW', true)).toBe(11)
  //   expect(getPageWidgetCount(TrackingPages.VENUES, 'Test', true)).toBe(0)
  //   expect(getPageWidgetCount(TrackingPages.WIRED_CLIENTS, undefined, true)).toBe(1)
  //   expect(getPageWidgetCount('Test')).toBe(0)

  //   localStorage.setItem('dashboard-tab', 'switch')
  //   expect(getPageWidgetCount(TrackingPages.DASHBOARD, undefined, true)).toBe(14)
  //   localStorage.setItem('dashboard-tab', 'edge')
  //   expect(getPageWidgetCount(TrackingPages.DASHBOARD, undefined, true)).toBe(11)
  // })

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
      useLoadTimeTracking({
        itemName: 'testItem',
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
        filters: '{"filterValues":{},"searchValue":""}',
        load_time_ms: expect.any(Number),
        load_time_text: 'Normal',
        page_title: 'Wired Clients List',
        page_type: 'Table',
        time: expect.any(String)
      })

      await userEvent.click(screen.getByText('Change Filter'))
      await waitFor(() => expect(mockPendoTrack).toBeCalledTimes(1))
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