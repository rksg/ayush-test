import '@testing-library/jest-dom'
import { useEffect } from 'react'

import userEvent from '@testing-library/user-event'

import { useIsSplitOn }              from '@acx-ui/feature-toggle'
import { useIsEdgeReady }            from '@acx-ui/rc/components'
import { BrowserRouter }             from '@acx-ui/react-router-dom'
import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'
import { DateRange }                 from '@acx-ui/utils'

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

const mockedGetCanvas = jest.fn(() => ({
  unwrap: jest.fn().mockResolvedValue([
    {
      id: '65bcb4d334ec4a47b21ae5e062de279f',
      name: 'Canvas',
      content: `[{
        "id":"default_section",
        "type":"section",
        "hasTab":false,
        "groups":[]
      }]`
    }
  ])
}))

jest.mock('@acx-ui/rc/services', () => {
  return {
    useGetWidgetQuery: jest.fn().mockReturnValue({}),
    useLazyGetCanvasQuery: () => ([ mockedGetCanvas ]),
    useCreateWidgetMutation: () => [
      jest.fn(() => ({
        then: jest.fn().mockResolvedValue({
          id: '123'
        })
      }))
    ]
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
    expect(localStorage.getItem('dashboard-tab')).toBe(undefined)

    const wifiWidgets = [
      'TrafficByVolume',
      'ConnectedClientsOverTime',
      'TopAppsByTraffic'
    ]
    wifiWidgets.forEach(widget => expect(screen.getByTitle(widget)).toBeVisible())

    fireEvent.click(screen.getByRole('radio', { name: 'Switch' }))
    expect(localStorage.getItem('dashboard-tab')).toBe('switch')

    const switchWidgets = [
      'SwitchesTrafficByVolume',
      'TopSwitchesByPoEUsage',
      'TopSwitchesByTraffic',
      'TopSwitchesByError',
      'TopSwitchModels'
    ]
    switchWidgets.forEach(widget => expect(screen.getByTitle(widget)).toBeVisible())

    fireEvent.click(screen.getByRole('radio', { name: 'RUCKUS Edge' }))
    expect(localStorage.getItem('dashboard-tab')).toBe('edge')

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
    it('should render correctly', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
      expect(await screen.findByText('RUCKUS One Default Dashboard')).toBeVisible()

      await userEvent.click(await screen.findByTestId('setting-button'))
      expect(await screen.findByText('My Dashboards (4)')).toBeVisible()

      await userEvent.click(await screen.findByText('Import dashboards from available canvases'))
      expect(await screen.findByText('Import Dashboards')).toBeVisible()

      const canvasMoreBtn = await screen.findAllByTestId('canvas-more-btn')
      await userEvent.click(canvasMoreBtn[0])
      // await waitFor(async ()=>{
      //   expect(await screen.findByText(/Clone as Private Copy/)).toBeVisible()
      // })

      await userEvent.click(await screen.findByText(/Back/))
      const dashboardMoreBtn = await screen.findAllByTestId('dashboard-more-btn')
      await userEvent.click(dashboardMoreBtn[0])
      // expect(await screen.findByText('Set as Landing Page')).toBeVisible()

    })

    it('should switch dashboard correctly', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
      expect(await screen.findByText('RUCKUS One Default Dashboard')).toBeVisible()

      await userEvent.click(await screen.findByText(/RUCKUS One Default Dashboard/))
      await userEvent.click(await screen.findByText(/Dashboard 1/))
      expect(await screen.findByText('Dashboard 1 longlonglonglonglonglonglonglong')).toBeVisible()
    })
  })
})
