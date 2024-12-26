import { useContext, useEffect } from 'react'

import userEvent from '@testing-library/user-event'

import { render, screen, waitFor } from '@acx-ui/test-utils'

import {
  getLoadTimeStatus,
  getPageType,
  getTrackingItemsCount,
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
    expect(getPageType(TrackingPages.VENUES, 'Overview')).toBe('Dashboard')
    expect(getPageType(TrackingPages.VENUES, 'Test')).toBe('')
    expect(getPageType(TrackingPages.WIRELESS_CLIENTS)).toBe('Table')
    expect(getPageType(TrackingPages.WIRED_CLIENTS)).toBe('Table')
    expect(getPageType(TrackingPages.TIMELINE)).toBe('Table')
    expect(getPageType('Test')).toBe('')
  })

  it('test getTrackingItemsCount', () => {
    expect(getTrackingItemsCount(TrackingPages.DASHBOARD)).toBe(13)
    expect(getTrackingItemsCount(TrackingPages.VENUES, 'Overview')).toBe(11)
    expect(getTrackingItemsCount(TrackingPages.VENUES, 'Test')).toBe(0)
    expect(getTrackingItemsCount(TrackingPages.WIRED_CLIENTS)).toBe(1)
    expect(getTrackingItemsCount('Test')).toBe(0)

    localStorage.setItem('dashboard-tab', 'switch')
    expect(getTrackingItemsCount(TrackingPages.DASHBOARD)).toBe(14)
    localStorage.setItem('dashboard-tab', 'edge')
    expect(getTrackingItemsCount(TrackingPages.DASHBOARD)).toBe(11)
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
    const TestTabComponent = () => {
      const { onPageTabChange } = useContext(LoadTimeContext)
      const handleTabChange = () => {
        onPageTabChange()
      }
      return (
        <div>
          <button onClick={handleTabChange}>Change Tab</button>
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
        <TestTabComponent />
        <TestFilterComponent />
      </div>
    }

    it('should render correctly', async () => {
      const mockPendoTrack = jest.fn()
      window.pendo = {
        initialize: jest.fn(),
        identify: jest.fn(),
        track: mockPendoTrack
      }
      render(
        <LoadTimeProvider page={TrackingPages.WIRED_CLIENTS}>
          <TestComponent />
        </LoadTimeProvider>
      )

      expect(screen.getByText('Test Component')).toBeInTheDocument()

      await waitFor(() => expect(mockPendoTrack).toBeCalledTimes(1))
      expect(mockPendoTrack).toHaveBeenCalledWith('testPageloadtime', {
        active_tab: '',
        components_load_time_ms: expect.any(String),
        filters: { filterValues: {}, searchValue: '' },
        load_time_ms: expect.any(Number),
        load_time_text: 'Normal',
        page_title: 'Wired Clients List',
        page_type: 'Table',
        time: expect.any(String)
      })

      await userEvent.click(screen.getByText('Change Filter'))
      await waitFor(() => expect(mockPendoTrack).toBeCalledTimes(2))
      await userEvent.click(screen.getByText('Change Tab'))
      await waitFor(() => expect(mockPendoTrack).toBeCalledTimes(2))
    })
  })

})