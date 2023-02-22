import { RefObject } from 'react'

import { cleanup }     from '@testing-library/react'
import { EChartsType } from 'echarts'

import { Incident }                  from '@acx-ui/analytics/utils'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { connectionEvents }                                        from './__tests__/fixtures'
import { DisplayEvent }                                            from './config'
import { FormattedEvent, getSelectedEvent, History, onPanelClick } from './EventsHistory'

import { Filters } from '.'

const incidents = [{
  id: '9cf271f8-fe98-4725-9ee3-baf89119164a',
  path: [{
    type: 'zone',
    name: 'cliexp4'
  }
  ],
  severity: 0.179645778294647,
  startTime: '2022-11-14T06:36:00.000Z',
  sliceType: 'zone',
  sliceValue: 'cliexp4',
  endTime: '2022-11-14T06:42:00.000Z',
  code: 'ttc',
  slaThreshold: 2000
}] as Incident[]
describe('EventsHistory', () => {
  it('should render correctly without data', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'clientMac',
      activeTab: 'troubleshooting'
    }
    const data = {
      connectionEvents: [],
      incidents: [] as Incident[],
      connectionDetailsByAp: [],
      connectionQualities: []
    }
    const setEventState = jest.fn()
    const setVisible = jest.fn()
    const visible = false
    const eventState = {} as DisplayEvent
    const popoverRef = {} as RefObject<HTMLDivElement>
    const chartsRef = { current: [] } as RefObject<EChartsType[]>
    render(
      <Provider>
        <History
          data={data}
          filters={null}
          historyContentToggle
          setHistoryContentToggle={jest.fn()}
          setEventState={setEventState}
          setVisible={setVisible}
          visible={visible}
          eventState={eventState}
          popoverRef={popoverRef}
          chartsRef={chartsRef}
        />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/wifi/clients/:clientId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByText('History')).toBeVisible()
  })
  it('should render with data', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'clientMac',
      activeTab: 'troubleshooting'
    }
    const data = {
      connectionEvents,
      incidents,
      connectionDetailsByAp: [],
      connectionQualities: []
    }
    const setEventState = jest.fn()
    const setVisible = jest.fn()
    const visible = false
    const eventState = {} as DisplayEvent
    const popoverRef = {} as RefObject<HTMLDivElement>
    const chartsRef = { current: [] } as RefObject<EChartsType[]>
    render(
      <Provider>
        <History
          data={data}
          filters={{}}
          historyContentToggle
          setHistoryContentToggle={jest.fn()}
          setEventState={setEventState}
          setVisible={setVisible}
          visible={visible}
          eventState={eventState}
          popoverRef={popoverRef}
          chartsRef={chartsRef}
        />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/wifi/clients/:clientId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByText('History')).toBeVisible()
    expect(screen.getByText('Nov 14 2022 06:33:31')).toBeVisible()
    expect(screen.getByText('Connection (Time To Connect)')).toBeVisible()
  })
  it('should render with data and filters', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'clientMac',
      activeTab: 'troubleshooting'
    }
    const data = {
      connectionEvents,
      incidents,
      connectionDetailsByAp: [],
      connectionQualities: []
    }
    const filters = {
      category: ['performance'],
      type: ['roamed']
    } as unknown as Filters
    const setEventState = jest.fn()
    const setVisible = jest.fn()
    const visible = false
    const eventState = {} as DisplayEvent
    const popoverRef = {} as RefObject<HTMLDivElement>
    const chartsRef = { current: [] } as RefObject<EChartsType[]>
    render(
      <Provider>
        <History
          data={data}
          filters={filters}
          historyContentToggle
          setHistoryContentToggle={jest.fn()}
          setEventState={setEventState}
          setVisible={setVisible}
          visible={visible}
          eventState={eventState}
          popoverRef={popoverRef}
          chartsRef={chartsRef}
        />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/wifi/clients/:clientId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByText('History')).toBeVisible()
    expect(screen.getByText('Nov 14 2022 06:33:31')).toBeVisible()
    expect(screen.queryByText('Connection (Time To Connect)')).toBeNull()
    cleanup()
    render(
      <Provider>
        <History
          data={data}
          filters={{ ...filters, type: ['incident'], category: [] } as unknown as Filters}
          historyContentToggle
          setHistoryContentToggle={jest.fn()}
          setEventState={setEventState}
          setVisible={setVisible}
          visible={visible}
          eventState={eventState}
          popoverRef={popoverRef}
          chartsRef={chartsRef}
        />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/wifi/clients/:clientId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByText('History')).toBeVisible()
    expect(screen.queryByText('Nov 14 2022 06:33:31')).toBeNull()
    expect(screen.getByText('Connection (Time To Connect)')).toBeVisible()
  })
  it('should toggle history panel', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'clientMac',
      activeTab: 'troubleshooting'
    }
    const data = {
      connectionEvents: [],
      incidents: [] as Incident[],
      connectionDetailsByAp: [],
      connectionQualities: []
    }
    const setHistoryContentToggle = jest.fn()
    const setEventState = jest.fn()
    const setVisible = jest.fn()
    const visible = false
    const eventState = {} as DisplayEvent
    const popoverRef = {} as RefObject<HTMLDivElement>
    const chartsRef = { current: [] } as RefObject<EChartsType[]>
    render(
      <Provider>
        <History
          data={data}
          filters={null}
          historyContentToggle
          setHistoryContentToggle={setHistoryContentToggle}
          setEventState={setEventState}
          setVisible={setVisible}
          visible={visible}
          eventState={eventState}
          popoverRef={popoverRef}
          chartsRef={chartsRef}
        />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/wifi/clients/:clientId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByText('History')).toBeVisible()
    const collapse = screen.getByTestId('history-collapse')
    fireEvent.click(collapse)
    expect(setHistoryContentToggle).toBeCalledWith(false)
  })

  describe('getSelectedEvent', () => {
    it('should return true for matching selected events', () => {
      const val = getSelectedEvent(
        true,
        { key: 'test' } as DisplayEvent,
        { event: { key: 'test' } }as unknown as FormattedEvent
      )
      expect(val).toBeTruthy()
    })

    it('should return true for non-matching selected events', () => {
      const val = getSelectedEvent(
        true,
        { key: 'no-test' } as DisplayEvent,
        { event: { key: 'test' } }as unknown as FormattedEvent
      )
      expect(val).toBeFalsy()
    })

    it('should return false for false visible', () => {
      const val = getSelectedEvent(
        false,
        { key: 'test' } as DisplayEvent,
        { event: { key: 'test' } }as unknown as FormattedEvent
      )
      expect(val).toBeFalsy()
    })
  })

  describe('onPanelClick', () => {
    it('should return a valid panel click handle', () => {
      const setEventState = jest.fn()
      const setVisible = jest.fn()
      const rect = {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
        width: 10,
        y: 10,
        x: 10
      }
      const popoverRef = {
        current: {
          getBoundingClientRect: () => rect
        }
      } as RefObject<HTMLDivElement>
      const chartsRefs = { current: [
        {
          isDisposed: () => false,
          getOption: () => ({
            series: [{ data: [[1234, 'all', { key: 'test' }]] }]
          }),
          getDom: () => ({
            querySelectorAll: () => [{
              getBoundingClientRect: () => rect
            }]
          })
        }
      ] } as unknown as RefObject<EChartsType[]>
      const item = {
        start: 124, date: '21-02-2022', description: 'test', event: { key: 'test' }
      } as unknown as FormattedEvent
      const onClick = onPanelClick(item, chartsRefs, popoverRef, setEventState, setVisible)
      expect(onClick).toBeInstanceOf(Function)
      onClick()
      expect(setVisible).toBeCalledWith(true)
      expect(setEventState).toBeCalledWith({ ...item.event, x: 5, y: -0 })
    })
    it('should not trigger on null popover callback', () => {
      const setEventState = jest.fn()
      const setVisible = jest.fn()
      const rect = {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
        width: 10,
        y: 10,
        x: 10
      }
      const popoverRef = {
        current: null
      } as RefObject<HTMLDivElement>
      const chartsRefs = { current: [
        {
          isDisposed: () => false,
          getOption: () => ({
            series: [{ data: [[1234, 'all', { key: 'test' }]] }]
          }),
          getDom: () => ({
            querySelectorAll: () => [{
              getBoundingClientRect: () => rect
            }]
          })
        }
      ] } as unknown as RefObject<EChartsType[]>
      const item = {
        start: 124, date: '21-02-2022', description: 'test', event: { key: 'test' }
      } as unknown as FormattedEvent
      const onClick = onPanelClick(item, chartsRefs, popoverRef, setEventState, setVisible)
      expect(onClick).toBeInstanceOf(Function)
      onClick()
      expect(setVisible).toBeCalledTimes(0)
      expect(setEventState).toBeCalledTimes(0)
    })
    it('should return callback', () => {
      const setEventState = jest.fn()
      const setVisible = jest.fn()
      const popoverRef = {} as RefObject<HTMLDivElement>
      const chartsRefs = { current: [] } as RefObject<EChartsType[]>
      const item = {
        start: 124, date: '21-02-2022', description: 'test', event: { key: 'test' }
      } as unknown as FormattedEvent
      const onClick = onPanelClick(item, chartsRefs, popoverRef, setEventState, setVisible)
      expect(onClick).toBeInstanceOf(Function)
    })
  })
})