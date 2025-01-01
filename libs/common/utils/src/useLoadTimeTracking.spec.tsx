import { useContext, useEffect } from 'react'

import userEvent from '@testing-library/user-event'

import { render, screen, waitFor } from '@acx-ui/test-utils'

import {
  getLoadTimeStatus,
  getPageType,
  getPageLoadStartTime,
  getPageWidgetCount,
  LoadTimeContext,
  LoadTimeProvider,
  TrackingPages,
  useLoadTimeTracking
} from './useLoadTimeTracking'

describe('useLoadTimeTracking', () => {
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

  it('test getPageWidgetCount', () => {
    expect(getPageWidgetCount(TrackingPages.DASHBOARD, undefined, true)).toBe(13)
    expect(getPageWidgetCount(TrackingPages.VENUES, 'OVERVIEW', true)).toBe(11)
    expect(getPageWidgetCount(TrackingPages.VENUES, 'Test', true)).toBe(0)
    expect(getPageWidgetCount(TrackingPages.WIRED_CLIENTS, undefined, true)).toBe(1)
    expect(getPageWidgetCount('Test')).toBe(0)

    localStorage.setItem('dashboard-tab', 'switch')
    expect(getPageWidgetCount(TrackingPages.DASHBOARD, undefined, true)).toBe(14)
    localStorage.setItem('dashboard-tab', 'edge')
    expect(getPageWidgetCount(TrackingPages.DASHBOARD, undefined, true)).toBe(11)
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