import { useContext, useEffect, useState } from 'react'

import userEvent from '@testing-library/user-event'

import { render, screen, waitFor } from '@acx-ui/test-utils'

import {
  flattenRoutes,
  getLoadTimeStatus,
  getPageLoadStartTime,
  LoadTimeContext,
  LoadTimeProvider,
  trackingPageConfig,
  useTrackLoadTime,
  widgetsMapping
} from './useTrackLoadTime'

describe('useTrackLoadTime', () => {
  it ('test flattenRoutes', () => {
    expect(flattenRoutes(trackingPageConfig)).toEqual(
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
    expect(flattenRoutes(trackingPageConfig)).toEqual(
      expect.objectContaining({
        dashboard: expect.objectContaining({
          key: 'DASHBOARD', subTab: '', isRegex: false, widgetCount: 14
        })
      })
    )
    localStorage.setItem('dashboard-tab', 'edge')
    expect(flattenRoutes(trackingPageConfig)).toEqual(
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

    const TestComponent = ({ isEnabled = true }) => {
      const { onPageFilterChange } = useContext(LoadTimeContext)
      const [queryState, setQueryState] = useState({
        isLoading: true,
        isSuccess: false,
        isError: false,
        isFetching: false,
        payload: { filters: {}, searchString: '' }
      })

      useEffect(() => {
        const timer = setTimeout(() => {
          setQueryState({
            isLoading: false,
            isSuccess: true,
            isError: false,
            isFetching: false,
            payload: { filters: {}, searchString: '' }
          })
          onPageFilterChange({ filterValues: {}, searchValue: '' }, true)
        }, 200)

        return () => clearTimeout(timer)
      }, [])

      useTrackLoadTime({
        itemName: widgetsMapping.WIRED_CLIENTS_TABLE,
        isEnabled,
        states: [queryState]
      })

      return <div>
        Test Component
        <TestFilterComponent />
      </div>
    }

    const TestUnfulfilledComponent = () => {
      const { onPageFilterChange } = useContext(LoadTimeContext)
      const [queryState, setQueryState] = useState({
        isLoading: true,
        isSuccess: false,
        isError: false,
        isFetching: false
      })

      useEffect(() => {
        const timer = setTimeout(() => {
          setQueryState({
            isLoading: false,
            isSuccess: false,
            isError: true,
            isFetching: false
          })
        }, 200)

        return () => clearTimeout(timer)
      }, [])

      useTrackLoadTime({
        itemName: widgetsMapping.AP_TABLE,
        isEnabled: true,
        states: [queryState]
      })

      useEffect(() => {
        onPageFilterChange({ filterValues: {}, searchValue: '' }, true)
      }, [onPageFilterChange])

      return (
        <div>
          Test Unfulfilled Component
          <TestFilterComponent />
        </div>
      )
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
      expect(mockPendoTrack).toHaveBeenCalledWith('pageloadtime', {
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
      await waitFor(() => expect(mockPendoTrack).toBeCalledTimes(2))
    })

    it('should handle unsupported page correctly', async () => {
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
      expect(mockPendoTrack).not.toBeCalled()
    })

    it('should handle correctly when the FF is turned off', async () => {
      const mockPendoTrack = jest.fn()
      const params = { tenantId: 'tenant-id' }
      window.pendo = {
        initialize: jest.fn(),
        identify: jest.fn(),
        track: mockPendoTrack
      }

      render(
        <LoadTimeProvider>
          <TestComponent isEnabled={false} />
        </LoadTimeProvider>, {
          route: { path: '/:tenantId/t/users/switch/clients', params }
        })

      expect(screen.getByText('Test Component')).toBeInTheDocument()
      expect(mockPendoTrack).not.toBeCalled()
    })

    it('should handle unfulfilled query correctly', async () => {
      const mockPendoTrack = jest.fn()
      const params = { tenantId: 'tenant-id' }
      window.pendo = {
        initialize: jest.fn(),
        identify: jest.fn(),
        track: mockPendoTrack
      }

      render(
        <LoadTimeProvider>
          <TestUnfulfilledComponent />
        </LoadTimeProvider>, {
          route: { path: '/:tenantId/t/devices/wifi', params }
        })

      expect(screen.getByText('Test Unfulfilled Component')).toBeInTheDocument()
      await waitFor(() => expect(mockPendoTrack).toBeCalledTimes(1))
      expect(mockPendoTrack).toHaveBeenCalledWith('pageloadtime', {
        active_tab: '',
        components_load_time_ms: expect.stringContaining('**'),
        criteria: expect.any(String),
        load_time_ms: expect.any(Number),
        load_time_text: 'Normal',
        page_title: 'Access Points - AP List',
        page_type: 'Table',
        time: expect.any(String)
      })
    })

  })
})