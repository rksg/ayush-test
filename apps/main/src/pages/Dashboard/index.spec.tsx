import '@testing-library/jest-dom'
import { useEffect } from 'react'

import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import { useIsEdgeReady }                                         from '@acx-ui/rc/components'
import { ruckusAiChatApi }                                        from '@acx-ui/rc/services'
import { RuckusAiChatUrlInfo }                                    from '@acx-ui/rc/utils'
import { BrowserRouter }                                          from '@acx-ui/react-router-dom'
import { Provider, store }                                        from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, within, waitFor } from '@acx-ui/test-utils'
import { DateRange }                                              from '@acx-ui/utils'

import { canvasData, canvasList, dashboardList } from './__tests__/fixture'

import Dashboard, { DashboardFilterProvider, useDashBoardUpdatedFilter } from '.'

const mockGetCanvasesUnwrap = jest.fn()
const mockGetCanvases = jest.fn(() => ({ unwrap: mockGetCanvasesUnwrap }))
const mockGetCanvasesState = { isLoading: false, isSuccess: true }

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

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useLazyGetCanvasesQuery: () => [mockGetCanvases, mockGetCanvasesState]
}))

jest.mock('../AICanvas', () => () => {
  return <div data-testid='canvas-editor' />
})

jest.mock(
  'rc/Widgets',
  () => ({ name }: { name: string }) => <div data-testid={`networks-${name}`} title={name} />,
  { virtual: true })

describe('Dashboard', () => {
  it('renders correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.CANVAS_Q2)
    render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)

    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(7)
    expect(await screen.findAllByTestId(/^rc/)).toHaveLength(6)
  })

  it('switches between tabs', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.CANVAS_Q2)
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
    const mockCloneCanvas = jest.fn()
    const mockDeleteCanvas = jest.fn()
    mockGetCanvasesUnwrap.mockResolvedValue(canvasList)

    beforeEach(async () => {
      store.dispatch(ruckusAiChatApi.util.resetApiState())
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      mockServer.use(
        rest.get(
          RuckusAiChatUrlInfo.getDashboards.url,
          (req, res, ctx) => res(ctx.json(dashboardList))
        ),
        rest.put(
          RuckusAiChatUrlInfo.reorderDashboards.url,
          (req, res, ctx) => res(ctx.json({}))
        ),
        rest.delete(
          RuckusAiChatUrlInfo.removeDashboards.url,
          (req, res, ctx) => res(ctx.json({}))
        ),
        // rest.post(
        //   RuckusAiChatUrlInfo.getCanvases.url,
        //   (req, res, ctx) => res(ctx.json(canvasList))
        // ),
        rest.get(
          RuckusAiChatUrlInfo.getCanvasById.url,
          (req, res, ctx) => res(ctx.json(canvasData))
        ),
        rest.post(
          RuckusAiChatUrlInfo.cloenCanvas.url,
          (req, res, ctx) => {
            mockCloneCanvas()
            return res(ctx.json({}))
          }
        ),
        rest.delete(
          RuckusAiChatUrlInfo.deleteCanvas.url,
          (req, res, ctx) => {
            mockDeleteCanvas()
            return res(ctx.json({}))
          }
        )
      )
    })
    afterEach(async () => {
      mockCloneCanvas.mockClear()
      mockDeleteCanvas.mockClear()
      Modal.destroyAll()
    })

    it('should render correctly', async () => {
      render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
      await waitFor(async ()=>{
        expect(await screen.findByText('RUCKUS One Default Dashboard')).toBeVisible()
      })

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
      expect(await within(canvasDrawer).findByText('Public Canvases')).toBeVisible()

      await userEvent.click(
        await within(canvasDrawer).findByRole('button', { name: 'Back' })
      )
      await userEvent.click(
        await within(dashboardDrawer).findByRole('button', { name: 'Close' })
      )
    })

    it('should view dashboard canvas correctly', async () => {
      render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
      await waitFor(async ()=>{
        expect(await screen.findByText('RUCKUS One Default Dashboard')).toBeVisible()
      })

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

    it('should edit dashboard canvas correctly', async () => {
      render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
      await waitFor(async ()=>{
        expect(await screen.findByText('RUCKUS One Default Dashboard')).toBeVisible()
      })

      await userEvent.click(await screen.findByTestId('setting-button'))
      const dashboardDrawer = await screen.findByRole('dialog')
      expect(dashboardDrawer).toBeVisible()
      expect(await within(dashboardDrawer).findByText('My Dashboards (4)')).toBeVisible()

      const dashboardMoreBtn = await screen.findAllByTestId('dashboard-more-btn')
      await userEvent.click(dashboardMoreBtn[0])
      await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit in Canvas Editor' }))
      expect(await screen.findByTestId('canvas-editor')).toBeVisible()
    })

    it('should remove dashboard canvas correctly', async () => {
      render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
      await waitFor(async ()=>{
        expect(await screen.findByText('RUCKUS One Default Dashboard')).toBeVisible()
      })

      await userEvent.click(await screen.findByTestId('setting-button'))
      const dashboardDrawer = await screen.findByRole('dialog')
      expect(dashboardDrawer).toBeVisible()
      expect(await within(dashboardDrawer).findByText('My Dashboards (4)')).toBeVisible()

      const dashboardMoreBtn = await screen.findAllByTestId('dashboard-more-btn')
      await userEvent.click(dashboardMoreBtn[0])
      await userEvent.click(await screen.findByRole('menuitem', { name: 'Remove from Dashboard' }))
      await waitFor(async ()=>{
        expect(await within(dashboardDrawer).findByText('My Dashboards (3)')).toBeVisible()
      })
    })

    it('should limit the number of dachboard canvas correctly', async () => {
      mockServer.use(
        rest.get(
          RuckusAiChatUrlInfo.getDashboards.url,
          (req, res, ctx) => res(ctx.json([
            dashboardList[0],
            ...Array.from({ length: 9 }).map((_, index) => {
              return {
                ...dashboardList[1],
                id: index
              }
            })
          ]))
        )
      )
      render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
      await waitFor(async ()=>{
        expect(await screen.findByText('RUCKUS One Default Dashboard')).toBeVisible()
      })

      await userEvent.click(await screen.findByTestId('setting-button'))
      const dashboardDrawer = await screen.findByRole('dialog')
      expect(dashboardDrawer).toBeVisible()
      expect(await within(dashboardDrawer).findByText('My Dashboards (10)')).toBeVisible()

      const importBtn = await screen.findByRole('button', { name: 'Import Dashboard' })
      expect(importBtn).toBeDisabled()
      await userEvent.hover(importBtn)
      expect(
        await screen.findByRole('tooltip')
      ).toHaveTextContent(/Maximum of 10 dashboards reached/)
    })

    it('should set dashboard as landing Page correctly', async () => {
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
      await waitFor(async ()=>{
        dashboardMoreBtn = await screen.findAllByTestId('dashboard-more-btn')
        expect(dashboardMoreBtn).toHaveLength(4)
      })
    })

    it('should switch dashboard correctly', async () => {
      render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
      expect(await screen.findByText('RUCKUS One Default Dashboard')).toBeVisible()

      await userEvent.click(await screen.findByText(/RUCKUS One Default Dashboard/))
      await userEvent.click(await screen.findByText(/Dashboard 1/))
      expect(await screen.findByText('Dashboard 1 longlonglonglonglonglonglonglong')).toBeVisible()
    })

    it('should render Import Dashboards Drawer correctly', async () => {
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

      const tabPanel = screen.getByRole('tabpanel', { hidden: false })
      const canvasMoreBtn = await within(tabPanel).findAllByTestId('canvas-more-btn')
      expect(canvasMoreBtn).toHaveLength(2)
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

    it('should open canvas editor correctly', async () => {
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

      await userEvent.click(
        await within(canvasDrawer).findByRole('button', { name: 'Canvas Editor' })
      )
      expect(await screen.findByTestId('canvas-editor')).toBeVisible()
    })

    it('should edit canvas correctly', async () => {
      mockGetCanvasesUnwrap
        .mockResolvedValueOnce(canvasList)
        .mockResolvedValue({
          data: canvasList.data.filter((item, index) => index !== 1)
        })

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

      const tabPanel = screen.getByRole('tabpanel', { hidden: false })
      await userEvent.click(await within(tabPanel).findByText('Newcanvas 1'))
      let canvasMoreBtn = await within(tabPanel).findAllByTestId('canvas-more-btn')
      expect(canvasMoreBtn).toHaveLength(2)
      await userEvent.click(canvasMoreBtn[1])

      await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit in Canvas Editor' }))
      expect(await screen.findByTestId('canvas-editor')).toBeVisible()
    })

    it('should clone canvas correctly', async () => {
      mockGetCanvasesUnwrap
        .mockResolvedValueOnce(canvasList)
        .mockResolvedValue({
          data: canvasList.data.filter((item, index) => index !== 1)
        })

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

      await userEvent.click(await screen.findByRole('tab', { name: 'Public Canvases' }))
      const tabPanel = screen.getByRole('tabpanel', { hidden: false })

      let canvasMoreBtn = await within(tabPanel).findAllByTestId('canvas-more-btn')
      expect(canvasMoreBtn).toHaveLength(2)
      await userEvent.click(canvasMoreBtn[1])

      await userEvent.click(await screen.findByRole('menuitem', { name: 'Clone as Private Copy' }))
      expect(mockCloneCanvas).toBeCalled()
      await waitFor(async ()=>{
        const ownedTab = await screen.findByRole('tab', { name: 'My canvases' })
        expect(ownedTab.getAttribute('aria-selected')).toBeTruthy()
      })
    })

    it('should delate canvas correctly', async () => {
      mockGetCanvasesUnwrap
        .mockResolvedValueOnce(canvasList)
        .mockResolvedValue({
          data: canvasList.data.filter((item, index) => index !== 1)
        })

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

      const tabPanel = screen.getByRole('tabpanel', { hidden: false })
      await userEvent.click(await within(tabPanel).findByText('Newcanvas 1'))
      let canvasMoreBtn = await within(tabPanel).findAllByTestId('canvas-more-btn')
      expect(canvasMoreBtn).toHaveLength(2)
      await userEvent.click(canvasMoreBtn[1])

      await userEvent.click(await screen.findByRole('menuitem', { name: 'Delete' }))
      expect(await screen.findByText('Delete Canvas')).toBeVisible()
      await userEvent.click(await screen.findByText('Delete Canvas'))

      expect(mockDeleteCanvas).toBeCalledTimes(1)
      await waitFor(async ()=>{
        expect(within(tabPanel).queryAllByRole('checkbox', { checked: true })).toHaveLength(0)
      })
    })

  })
})
