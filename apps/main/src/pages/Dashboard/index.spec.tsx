import '@testing-library/jest-dom'
import { useEffect } from 'react'

import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'


import { useIsSplitOn }                               from '@acx-ui/feature-toggle'
import { useIsEdgeReady }                             from '@acx-ui/rc/components'
import { BrowserRouter }                              from '@acx-ui/react-router-dom'
import { Provider }                                   from '@acx-ui/store'
import { fireEvent, render, screen, within, waitFor } from '@acx-ui/test-utils'
import { DateRange }                                  from '@acx-ui/utils'

import Dashboard, { DashboardFilterProvider, useDashBoardUpdatedFilter } from '.'

/* eslint-disable max-len */
jest.mock('@acx-ui/analytics/components', () => ({
  ConnectedClientsOverTime: () => <div data-testid={'analytics-ConnectedClientsOverTime'} title='ConnectedClientsOverTime' />,
  IncidentsDashboardv2: () => <div data-testid={'analytics-IncidentsDashboardv2'} title='IncidentsDashboard' />,
  NetworkHistory: () => <div data-testid={'analytics-NetworkHistory'} title='NetworkHistory' />,
  SwitchesTrafficByVolume: () => <div data-testid={'analytics-SwitchesTrafficByVolume'} title='SwitchesTrafficByVolume' />,
  TopAppsByTraffic: () => <div data-testid={'analytics-TopAppsByTraffic'} title='TopAppsByTraffic' />,
  TopSSIDsByClient: () => <div data-testid={'analytics-TopSSIDsByClient'} title='TopSSIDsByClient' />,
  TopWiFiNetworks: () => <div data-testid={'analytics-TopWiFiNetworks'} title='TopWiFiNetworks' />,
  TopSwitchesByError: () => <div data-testid={'analytics-TopSwitchesByError'} title='TopSwitchesByError' />,
  TopSwitchesByPoEUsage: () => <div data-testid={'analytics-TopSwitchesByPoEUsage'} title='TopSwitchesByPoEUsage' />,
  TopSwitchesByTraffic: () => <div data-testid={'analytics-TopSwitchesByTraffic'} title='TopSwitchesByTraffic' />,
  TopSwitchModels: () => <div data-testid={'analytics-TopSwitchModels'} title='TopSwitchModels' />,
  TrafficByVolume: () => <div data-testid={'analytics-TrafficByVolume'} title='TrafficByVolume' />,
  DidYouKnow: () => <div data-testid={'analytics-DidYouKnow'} title='DidYouKnow' />,
  ClientExperience: () => <div data-testid={'analytics-ClientExperience'} title='ClientExperience' />,
  TopEdgesByTraffic: () => <div data-testid={'analytics-TopEdgesByTraffic'} title='TopEdgesByTraffic' />,
  TopEdgesByResources: () => <div data-testid={'analytics-TopEdgesByResources'} title='TopEdgesByResources' />
}))
jest.mock('@acx-ui/rc/components', () => ({
  AlarmWidgetV2: () => <div data-testid={'rc-AlarmWidgetV2'} title='AlarmWidgetV2' />,
  ClientsWidgetV2: () => <div data-testid={'rc-ClientsWidgetV2'} title='ClientsWidgetV2' />,
  DevicesDashboardWidgetV2: () => <div data-testid={'rc-DevicesDashboardWidgetV2'} title='DevicesDashboardWidgetV2' />,
  MapWidgetV2: () => <div data-testid={'rc-MapWidgetV2'} title='MapWidgetV2' />,
  VenuesDashboardWidgetV2: () => <div data-testid={'rc-VenuesDashboardWidgetV2'} title='VenuesDashboardWidgetV2' />,
  useIsEdgeReady: jest.fn().mockReturnValue(true)
}))
jest.mock('@acx-ui/main/components', () => ({
  VenueFilter: () => <div data-testid={'rc-VenueFilter'} title='VenueFilter' />
}))

jest.mock('@acx-ui/main/components', () => ({
  VenueFilter: () => <div data-testid={'rc-VenueFilter'} title='VenueFilter' />
}))
/* eslint-enable */

jest.mock(
  'rc/Widgets',
  () => ({ name }: { name: string }) => <div data-testid={`networks-${name}`} title={name} />,
  { virtual: true })

jest.mock('./mockData', () => {
  return {
    ...jest.requireActual('./mockData'),
    mockCanvas: [{
      id: '65bcb4d334ec4a47b21ae5e062de279f',
      name: 'Dashboard Canvas',
      content: `[{
        "id":"default_section",
        "type":"section",
        "hasTab":false,
        "groups":[{"id":"default_group","sectionId":"default_section","type":"group","cards": []}]
      }]`
    }]
  }
})

describe('Dashboard', () => {
  it('renders correctly', async () => {
    render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)

    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(7)
    expect(await screen.findAllByTestId(/^rc/)).toHaveLength(6)
  })

  it('switches between tabs', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
    expect(localStorage.getItem('dashboard-devices-content-switcher')).toBe(undefined)

    const wifiWidgets = [
      'TrafficByVolume',
      'ConnectedClientsOverTime',
      'TopAppsByTraffic'
    ]
    wifiWidgets.forEach(widget => expect(screen.getByTitle(widget)).toBeVisible())

    fireEvent.click(screen.getByRole('radio', { name: 'Switch' }))
    expect(localStorage.getItem('dashboard-devices-content-switcher')).toBe('switch')

    const switchWidgets = [
      'SwitchesTrafficByVolume',
      'TopSwitchesByPoEUsage',
      'TopSwitchesByTraffic',
      'TopSwitchesByError',
      'TopSwitchModels'
    ]
    switchWidgets.forEach(widget => expect(screen.getByTitle(widget)).toBeVisible())

    fireEvent.click(screen.getByRole('radio', { name: 'RUCKUS Edge' }))
    expect(localStorage.getItem('dashboard-devices-content-switcher')).toBe('edge')

    const edgeWidgets = [
      'TopEdgesByTraffic',
      'TopEdgesByResources'
    ]
    edgeWidgets.forEach(widget => expect(screen.getByTitle(widget)).toBeVisible())
  })

  it('should switch tab correctly', async () => {
    render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
    fireEvent.click(await screen.findByText('Switch'))
    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(8)
    expect(await screen.findAllByTestId(/^rc/)).toHaveLength(6)
  })

  it('should show report link correctly', async () => {
    render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
    expect(screen.getByText('See more reports')).toBeVisible()
  })

  it('should hide edge tab when FF is off', async () => {
    jest.mocked(useIsEdgeReady).mockReturnValue(false)
    render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
    expect(await screen.findAllByRole('radio')).toHaveLength(2)
  })

  it('DashboardFilterProvider provides default value', async () => {
    const TestComponent = () => {
      const { dashboardFilters } = useDashBoardUpdatedFilter()
      return <div>{dashboardFilters.range}</div>
    }
    render(
      <BrowserRouter>
        <DashboardFilterProvider>
          <TestComponent />
        </DashboardFilterProvider>
      </BrowserRouter>
      ,{ wrapper: Provider })
    expect(screen.getByText(DateRange.last8Hours)).toBeInTheDocument()
  })
  it('DashboardFilterProvider provides selected date range for custom range', async () => {
    const TestComponent = () => {
      const { dashboardFilters, setDateFilterState } = useDashBoardUpdatedFilter()
      useEffect(()=>{
        setDateFilterState({
          range: DateRange.custom,
          startDate: '2021-12-31T00:01:00+00:00',
          endDate: '2022-01-01T00:01:00+00:00'
        })
      },[])
      return <div>{dashboardFilters.startDate}</div>
    }
    render(
      <BrowserRouter>
        <DashboardFilterProvider>
          <TestComponent />
        </DashboardFilterProvider>
      </BrowserRouter>
      ,{ wrapper: Provider })
    expect(await screen.findByText('2021-12-31T00:01:00+00:00')).toBeInTheDocument()
  })

  describe('Dashboard canvas', () => { //TODO
    beforeEach(async () => {
      Modal.destroyAll()
    })
    it('should render correctly', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
      expect(await screen.findByText('RUCKUS One Default Dashboard')).toBeVisible()

      await userEvent.click(await screen.findByTestId('setting-button'))
      const dashboardDrawer = await screen.findByRole('dialog')
      expect(dashboardDrawer).toBeVisible()
      expect(await within(dashboardDrawer).findByText('My Dashboards (4)')).toBeVisible()

      const dashboardMoreBtn = await screen.findAllByTestId('dashboard-more-btn')
      await userEvent.click(dashboardMoreBtn[0])
      await userEvent.click(await screen.findByRole('menuitem', { name: 'View' }))
      expect(await screen.findByText('Dashboard Canvas')).toBeVisible()
      expect(await screen.findByTestId('expanded-button')).toBeVisible()
      await userEvent.click(await screen.findByTestId('close-button'))
    })

    it('should set dashboard as landing Page correctly', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
      expect(await screen.findByText('RUCKUS One Default Dashboard')).toBeVisible()

      await userEvent.click(await screen.findByTestId('setting-button'))
      const dashboardDrawer = await screen.findByRole('dialog')
      expect(dashboardDrawer).toBeVisible()
      expect(await within(dashboardDrawer).findByText('My Dashboards (4)')).toBeVisible()

      let dashboardMoreBtn = await screen.findAllByTestId('dashboard-more-btn')
      expect(dashboardMoreBtn).toHaveLength(3)
      await userEvent.click(dashboardMoreBtn[0])
      await userEvent.click(await screen.findByRole('menuitem', { name: 'Set as Landing Page' }))
      dashboardMoreBtn = await screen.findAllByTestId('dashboard-more-btn')
      expect(dashboardMoreBtn).toHaveLength(4)
    })

    it('should switch dashboard correctly', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
      expect(await screen.findByText('RUCKUS One Default Dashboard')).toBeVisible()

      await userEvent.click(await screen.findByText(/RUCKUS One Default Dashboard/))
      await userEvent.click(await screen.findByText(/Dashboard 1/))
      expect(await screen.findByText('Dashboard 1 longlonglonglonglonglonglonglong')).toBeVisible()
    })

    it('should render Import Dashboards Drawer correctly', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
      expect(await screen.findByText('RUCKUS One Default Dashboard')).toBeVisible()

      await userEvent.click(await screen.findByTestId('setting-button'))
      const dashboardDrawer = await screen.findByRole('dialog')
      expect(dashboardDrawer).toBeVisible()
      expect(await within(dashboardDrawer).findByText('My Dashboards (4)')).toBeVisible()

      await userEvent.click(
        await within(dashboardDrawer).findByText('Import Dashboard')
      )
      const drawers = await screen.findAllByRole('dialog')
      const canvasDrawer = drawers[1]
      expect(await within(canvasDrawer).findByText('My canvases')).toBeVisible()

      const canvasMoreBtn = await screen.findAllByTestId('canvas-more-btn')
      await userEvent.click(canvasMoreBtn[0])
      await userEvent.click(await screen.findByRole('menuitem', { name: 'View' }))

      await waitFor(async ()=>{
        expect(await screen.findAllByRole('dialog')).toHaveLength(3)
      })

      //preview modal
      expect(await screen.findByText('Dashboard Canvas')).toBeVisible()
      expect(await screen.findByTestId('expanded-button')).toBeVisible()
      await userEvent.click(await screen.findByTestId('expanded-button'))
      await userEvent.click(await screen.findByTestId('collapsed-button'))
      expect(screen.queryByTestId('collapsed-button')).toBeNull()
      await userEvent.click(await screen.findByTestId('close-button'))
    })

    it('should delate canvas correctly', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
      expect(await screen.findByText('RUCKUS One Default Dashboard')).toBeVisible()

      await userEvent.click(await screen.findByTestId('setting-button'))
      const dashboardDrawer = await screen.findByRole('dialog')
      expect(dashboardDrawer).toBeVisible()
      expect(await within(dashboardDrawer).findByText('My Dashboards (4)')).toBeVisible()

      await userEvent.click(
        await within(dashboardDrawer).findByText('Import Dashboard')
      )
      const drawers = await screen.findAllByRole('dialog')
      const canvasDrawer = drawers[1]
      expect(await within(canvasDrawer).findByText('My canvases')).toBeVisible()

      let canvasMoreBtn = await screen.findAllByTestId('canvas-more-btn')
      await userEvent.click(canvasMoreBtn[1])

      await userEvent.click(await screen.findByRole('menuitem', { name: 'Delete' }))
      expect(await screen.findByText('Delete Canvas')).toBeVisible()
    })

  })
})
