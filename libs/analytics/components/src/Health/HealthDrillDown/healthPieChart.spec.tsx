import _ from 'lodash'

import { pathToFilter }                                                                                     from '@acx-ui/analytics/utils'
import { EventParams }                                                                                      from '@acx-ui/components'
import { get }                                                                                              from '@acx-ui/config'
import { formatter }                                                                                        from '@acx-ui/formatter'
import { dataApiURL, Provider, store }                                                                      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved, fireEvent, cleanup, renderHook, act } from '@acx-ui/test-utils'
import { DateRange }                                                                                        from '@acx-ui/utils'
import type { AnalyticsFilter }                                                                             from '@acx-ui/utils'

import {
  mockConnectionFailureResponse,
  mockTtcResponse,
  mockPathWithAp,
  mockOnlyWlansResponse,
  noDataResponse,
  mockConnectionFailureResponseWithOthers
} from './__tests__/fixtures'
import { HealthPieChart, PieChartData, pieNodeMap, tooltipFormatter, transformData, usePieActionHandler } from './healthPieChart'
import { api, ImpactedEntities }                                                                          from './services'

const mockGet = get as jest.Mock

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('HealthPieChart', () => {
  const size = { width: 300, height: 300 }

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  afterEach(() => cleanup())

  const filters: AnalyticsFilter = {
    startDate: '01-03-2023',
    endDate: '02-03-2023',
    range: DateRange.last24Hours,
    filter: {}
  }

  const mockSetChartKey = jest.fn()
  const mockSetPieFilter = jest.fn()
  const mockOnPieClick = jest.fn()
  const mockOnLegendClick = jest.fn()
  const mockSetPieList = jest.fn()
  const mockSetSelectedSlice = jest.fn()

  it('should render correctly for many connectionFailures', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockConnectionFailureResponse })
    const { asFragment } = render(
      <Provider>
        <div style={{ height: 300, width: 300 }}>
          <HealthPieChart
            size={size}
            filters={filters}
            queryType='connectionFailure'
            selectedStage='Authentication'
            valueFormatter={formatter('durationFormat')}
            setPieFilter={mockSetPieFilter}
            chartKey='nodes'
            pieFilter={null}
            setChartKey={mockSetChartKey}
            onPieClick={mockOnPieClick}
            onLegendClick={mockOnLegendClick}
            setPieList={mockSetPieList}
            selectedSlice={null}
            setSelectedSlice={mockSetSelectedSlice}
          />,
        </div>
      </Provider>,
      {
        route: {
          params: { tenantId: 'test' }
        }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_]')
      .forEach((node: Element) => {
        node.setAttribute('_echarts_instance_', 'ec_mock')
        node.setAttribute('size-sensor-id', 'sensor-mock')
      })
    expect(await screen.findByText('5 Impacted Venues')).toBeVisible()
    expect(await screen.findByText('WLANs')).toBeVisible()
    expect(await screen.findByText('Manufacturers')).toBeVisible()
    expect(await screen.findByText('Events')).toBeVisible()
    expect(screen.queryByText('Others')).not.toBeInTheDocument()
    expect(screen.queryByText('Detailed breakup of all items beyond Top 5')).not.toBeInTheDocument()
  })

  it('should render correctly for single ttc failures', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockTtcResponse })
    const { asFragment } = render(
      <Provider>
        <div style={{ height: 300, width: 300 }}>
          <HealthPieChart
            size={size}
            filters={filters}
            queryType='ttc'
            selectedStage='Authentication'
            valueFormatter={formatter('countFormat')}
            setPieFilter={mockSetPieFilter}
            chartKey='nodes'
            pieFilter={null}
            setChartKey={mockSetChartKey}
            onPieClick={mockOnPieClick}
            onLegendClick={mockOnLegendClick}
            setPieList={mockSetPieList}
            selectedSlice={null}
            setSelectedSlice={mockSetSelectedSlice}
          />,
        </div>
      </Provider>,
      {
        route: {
          params: { tenantId: 'test' }
        }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_]')
      .forEach((node: Element) => {
        node.setAttribute('_echarts_instance_', 'ec_mock')
        node.setAttribute('size-sensor-id', 'sensor-mock')
      })
    expect(await screen.findByText('1 Impacted Venue')).toBeVisible()
    expect(await screen.findByText('WLAN')).toBeVisible()
    expect(await screen.findByText('Manufacturers')).toBeVisible()
    expect(screen.queryByText('Events')).toBeNull()
  })

  it('should render correctly for missing nodes data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockOnlyWlansResponse })
    const apFilters = { ...filters, path: mockPathWithAp }
    const { asFragment } = render(
      <Provider>
        <div style={{ height: 300, width: 300 }}>
          <HealthPieChart
            size={size}
            filters={apFilters}
            queryType='ttc'
            selectedStage='Authentication'
            valueFormatter={formatter('countFormat')}
            setPieFilter={mockSetPieFilter}
            chartKey='wlans'
            pieFilter={null}
            setChartKey={mockSetChartKey}
            onPieClick={mockOnPieClick}
            onLegendClick={mockOnLegendClick}
            setPieList={mockSetPieList}
            selectedSlice={null}
            setSelectedSlice={mockSetSelectedSlice}
          />,
        </div>
      </Provider>,
      {
        route: {
          params: { tenantId: 'test' }
        }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_]')
      .forEach((node: Element) => {
        node.setAttribute('_echarts_instance_', 'ec_mock')
        node.setAttribute('size-sensor-id', 'sensor-mock')
      })
    expect(await screen.findByText('1 Impacted WLAN')).toBeVisible()
  })

  it('should show correctly for nodes with no data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: noDataResponse })
    const apFilters = { ...filters, path: mockPathWithAp }
    const { asFragment } = render(
      <Provider>
        <div style={{ height: 300, width: 300 }}>
          <HealthPieChart
            size={size}
            filters={apFilters}
            queryType='ttc'
            selectedStage='Authentication'
            valueFormatter={formatter('countFormat')}
            setPieFilter={mockSetPieFilter}
            chartKey='wlans'
            pieFilter={null}
            setChartKey={mockSetChartKey}
            onPieClick={mockOnPieClick}
            onLegendClick={mockOnLegendClick}
            setPieList={mockSetPieList}
            selectedSlice={null}
            setSelectedSlice={mockSetSelectedSlice}
          />,
        </div>
      </Provider>,
      {
        route: {
          params: { tenantId: 'test' }
        }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_]')
      .forEach((node: Element) => {
        node.setAttribute('_echarts_instance_', 'ec_mock')
        node.setAttribute('size-sensor-id', 'sensor-mock')
      })
    expect( await screen.findByText('No data to display')).toBeVisible()
  })

  it('should show others', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockConnectionFailureResponseWithOthers })
    const { asFragment } = render(
      <Provider>
        <div style={{ height: 300, width: 300 }}>
          <HealthPieChart
            size={size}
            filters={filters}
            queryType='connectionFailure'
            selectedStage='Authentication'
            valueFormatter={formatter('durationFormat')}
            setPieFilter={mockSetPieFilter}
            chartKey='nodes'
            pieFilter={null}
            setChartKey={mockSetChartKey}
            onPieClick={mockOnPieClick}
            onLegendClick={mockOnLegendClick}
            setPieList={mockSetPieList}
            selectedSlice={null}
            setSelectedSlice={mockSetSelectedSlice}
          />,
        </div>
      </Provider>,
      {
        route: {
          params: { tenantId: 'test' }
        }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_]')
      .forEach((node: Element) => {
        node.setAttribute('_echarts_instance_', 'ec_mock')
        node.setAttribute('size-sensor-id', 'sensor-mock')
      })
    expect(await screen.findByText('Top 5 Impacted Venues')).toBeVisible()
    expect(await screen.findByText('WLANs')).toBeVisible()
    expect(await screen.findByText('Manufacturers')).toBeVisible()
    expect(await screen.findByText('Events')).toBeVisible()
    expect(await screen.findByText('Others')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Detailed breakup of all items beyond Top 5 can be explored using Data Studio custom charts.')).toBeInTheDocument()
  })

  it('should handle chart switching', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockConnectionFailureResponse })
    render(
      <Provider>
        <div style={{ height: 300, width: 300 }}>
          <HealthPieChart
            size={size}
            filters={filters}
            queryType='connectionFailure'
            selectedStage='Authentication'
            valueFormatter={formatter('countFormat')}
            setPieFilter={mockSetPieFilter}
            chartKey='events'
            pieFilter={null}
            setChartKey={mockSetChartKey}
            onPieClick={mockOnPieClick}
            onLegendClick={mockOnLegendClick}
            setPieList={mockSetPieList}
            selectedSlice={null}
            setSelectedSlice={mockSetSelectedSlice}
          />,
        </div>
      </Provider>,
      {
        route: {
          params: { tenantId: 'test' }
        }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Authentication')).toBeVisible()
    expect(await screen.findByText('Top 5 Events')).toBeVisible()
    fireEvent.click(await screen.findByText('WLANs'))
    expect(mockSetChartKey).toHaveBeenCalledWith('wlans')
    fireEvent.click(await screen.findByText('Manufacturers'))
    expect(mockSetChartKey).toHaveBeenCalledWith('osManufacturers')
    fireEvent.click(await screen.findByText('Venues'))
    expect(mockSetChartKey).toHaveBeenCalledWith('nodes')
  })

  it('should handle chart with pieFilter', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockConnectionFailureResponse })
    const mockPieFilter = {
      key: 'CCD_REASON_PREV_AUTH_NOT_VALID',
      value: 100,
      name: 'Previous Auth Invalid'
    } as PieChartData
    render(
      <Provider>
        <div style={{ height: 300, width: 300 }}>
          <HealthPieChart
            size={size}
            filters={filters}
            queryType='connectionFailure'
            selectedStage='Authentication'
            valueFormatter={formatter('countFormat')}
            setPieFilter={mockSetPieFilter}
            chartKey='events'
            pieFilter={mockPieFilter}
            setChartKey={mockSetChartKey}
            onPieClick={mockOnPieClick}
            onLegendClick={mockOnLegendClick}
            setPieList={mockSetPieList}
            selectedSlice={null}
            setSelectedSlice={mockSetSelectedSlice}
          />,
        </div>
      </Provider>,
      {
        route: {
          params: { tenantId: 'test' }
        }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Authentication')).toBeVisible()
    expect(await screen.findByText('Top 5 Events')).toBeVisible()
    expect(await screen.findByText(mockPieFilter.name)).toBeVisible()
  })

  describe('tooltipFormatter', () => {
    it('returns formatted values and percentage', () => {
      expect(tooltipFormatter(50, formatter('durationFormat'))(25)).toEqual('50%(25 ms)')
    })
  })
  describe('pieNodeMap', () => {
    it('should return correct venue title', () => {
      const zone = pieNodeMap(pathToFilter([
        { type: 'zone', name: 'Zone' }
      ]))
      expect(_.get(zone, 'defaultMessage.[0].options.one.value[0].value'))
        .toEqual('AP Group')
      const apGroup = pieNodeMap(pathToFilter([
        { type: 'zone', name: 'Zone' },
        { type: 'apGroup', name: 'AP Group' }
      ]))
      expect(_.get(apGroup, 'defaultMessage.[0].options.one.value[0].value'))
        .toEqual('AP')
    })

    it('should return correct title for ACX', () => {
      mockGet.mockReturnValue(undefined)
      const venue = pieNodeMap(pathToFilter([]))
      expect(_.get(venue, 'defaultMessage.[0].options.one.value[0].value'))
        .toEqual('VenueSingular')
    })
    it('should return correct title for RA', () => {
      mockGet.mockReturnValue('true')
      const venue = pieNodeMap(pathToFilter([]))
      expect(_.get(venue, 'defaultMessage.[0].options.one.value[0].value'))
        .toEqual('Zone')
    })
  })
})

describe('transformData', () => {
  it('should transform Data correctly', () => {
    expect(
      transformData(mockConnectionFailureResponse as ImpactedEntities)
        .osManufacturers[0]
    ).toEqual(
      {
        rawKey: 'Apple, Inc.',
        color: '#66B1E8',
        key: 'Apple, Inc.',
        name: 'Apple, Inc.',
        value: 1028,
        selected: false
      }
    )
    expect(
      transformData(mockConnectionFailureResponse as ImpactedEntities).events[0]
    ).toEqual({
      rawKey: 'CCD_REASON_PREV_AUTH_NOT_VALID',
      color: '#66B1E8',
      key: 'Previous Auth Invalid',
      name: 'Previous Auth Invalid',
      value: 3243,
      selected: false
    })
  })
})

describe('usePieActionHandler', () => {
  const mockOnPieClick = jest.fn()
  const mockOnLegendClick = jest.fn()
  const mockSetSelectedSlice = jest.fn()
  const mockData = [
    { name: 'Slice 1', dataIndex: 0 },
    { name: 'Slice 2', dataIndex: 1 },
    { name: 'Slice 3', dataIndex: 2 }
  ] as EventParams & { name: string, dataIndex: number }[]

  it('should handle chart switching', async () => {
    const [onChartClick] = usePieActionHandler(
      mockOnPieClick, mockOnLegendClick, null, mockSetSelectedSlice)
    onChartClick(mockData[0] as EventParams & { name: string, dataIndex: number }[])
    expect(mockOnPieClick).toHaveBeenCalledWith(mockData[0])
  })
  it('should handle legend switching', async () => {
    const [, createOnClickLegend] = usePieActionHandler(
      mockOnPieClick, mockOnLegendClick, null, mockSetSelectedSlice)
    const onLegendClick = createOnClickLegend(mockData)
    onLegendClick?.(mockData[0] as EventParams & { name: string, dataIndex: number })
    expect(mockOnLegendClick).toHaveBeenCalledWith(mockData[0])
    expect(mockSetSelectedSlice).toHaveBeenCalledWith(0)
  })
  it('should handle legend click on already selected slice', () => {
    const [, createOnClickLegend] = usePieActionHandler(
      mockOnPieClick, mockOnLegendClick, 0, mockSetSelectedSlice)
    const onLegendClick = createOnClickLegend(mockData)
    onLegendClick?.(mockData[0] as EventParams & { name: string, dataIndex: number })
    expect(mockSetSelectedSlice).toHaveBeenCalledWith(null)
  })

  it('should toggle selectedSlice correctly based on params.dataIndex', () => {
    const { result } = renderHook(() =>
      usePieActionHandler(mockOnPieClick, mockOnLegendClick, 2, mockSetSelectedSlice)
    )

    const onChartClick = result.current[0]

    const mockEventParams: Partial<EventParams> & { name: string } = {
      dataIndex: 2,
      name: 'Slice 3'
    }
    act(() => {
      onChartClick(mockEventParams as unknown as EventParams & { name: string }[])
    })

    expect(mockSetSelectedSlice).toHaveBeenCalledWith(null)
    expect(mockOnPieClick).toHaveBeenCalledWith(mockEventParams)

    mockSetSelectedSlice.mockClear()
    mockOnPieClick.mockClear()

    const newMockEventParams = { dataIndex: 1 }
    act(() => {
      onChartClick(newMockEventParams as unknown as EventParams & { name: string }[])
    })

    expect(mockSetSelectedSlice).toHaveBeenCalledWith(1)
    expect(mockOnPieClick).toHaveBeenCalledWith(newMockEventParams)
  })

  it('should handle legend clicks and toggle selectedSlice correctly', () => {
    const { result } = renderHook(() =>
      usePieActionHandler(mockOnPieClick, mockOnLegendClick, 2, mockSetSelectedSlice)
    )

    const createOnClickLegend = result.current[1]

    const mockData: Partial<EventParams> & { name: string }[]= [
      { name: 'Slice A' },
      { name: 'Slice B' },
      { name: 'Slice C' }
    ]

    const onClickLegend = createOnClickLegend(mockData as EventParams & { name: string }[])
    const mockEventParams = { name: 'Slice C' }
    act(() => {
      onClickLegend?.(mockEventParams as unknown as EventParams & { name: string })
    })
    expect(mockSetSelectedSlice).toHaveBeenCalledWith(null)
    expect(mockOnLegendClick).toHaveBeenCalledWith(mockEventParams)

    mockSetSelectedSlice.mockClear()
    mockOnLegendClick.mockClear()

    const newMockEventParams = { name: 'Slice A' }
    act(() => {
      onClickLegend?.(newMockEventParams as unknown as EventParams & { name: string })
    })
    expect(mockSetSelectedSlice).toHaveBeenCalledWith(0)
    expect(mockOnLegendClick).toHaveBeenCalledWith(newMockEventParams)

    mockSetSelectedSlice.mockClear()
    mockOnLegendClick.mockClear()

    const invalidMockEventParams = { name: 'Invalid Slice' }
    act(() => {
      onClickLegend?.(invalidMockEventParams as unknown as EventParams & { name: string })
    })
    expect(mockSetSelectedSlice).not.toHaveBeenCalled()
    expect(mockOnLegendClick).toHaveBeenCalledWith(undefined)
  })
})
