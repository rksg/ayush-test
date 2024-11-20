import _ from 'lodash'

import { pathToFilter }                                                                    from '@acx-ui/analytics/utils'
import { EventParams }                                                                     from '@acx-ui/components'
import { get }                                                                             from '@acx-ui/config'
import { formatter }                                                                       from '@acx-ui/formatter'
import { dataApiURL, Provider, store }                                                     from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved, fireEvent, cleanup } from '@acx-ui/test-utils'
import { DateRange }                                                                       from '@acx-ui/utils'
import type { AnalyticsFilter }                                                            from '@acx-ui/utils'

import {
  mockConnectionFailureResponse,
  mockTtcResponse,
  mockPathWithAp,
  mockOnlyWlansResponse,
  noDataResponse,
  mockConnectionFailureResponseWithOthers
} from './__tests__/fixtures'
import { HealthPieChart, onChartClick, onClickLegend, pieNodeMap, toggleSelection, tooltipFormatter, transformData } from './healthPieChart'
import { api, ImpactedEntities }                                                                                     from './services'

const mockGet = get as jest.Mock

jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  defineMessage: jest.fn(message => message)
}))
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
            chartKey='nodes'
            pieFilter={null}
            setChartKey={mockSetChartKey}
            onPieClick={mockOnPieClick}
            onLegendClick={mockOnLegendClick}
            setPieList={mockSetPieList}
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
    expect(await screen.findByText('5 Impacted Venues')).toBeVisible()
    fireEvent.click(await screen.findByText('WLANs'))
    expect(mockSetChartKey).toHaveBeenCalledWith('wlans')
    fireEvent.click(await screen.findByText('Manufacturers'))
    expect(mockSetChartKey).toHaveBeenCalledWith('osManufacturers')
    fireEvent.click(await screen.findByText('Events'))
    expect(mockSetChartKey).toHaveBeenCalledWith('events')
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

describe('toggleSelection', () => {
  it('selects a slice if no slice is currently selected', () => {
    const setSelectedSlice = jest.fn()
    toggleSelection(1, null, setSelectedSlice)
    expect(setSelectedSlice).toHaveBeenCalledWith(1)
  })

  it('deselects a slice if it is currently selected', () => {
    const setSelectedSlice = jest.fn()
    toggleSelection(1, 1, setSelectedSlice)
    expect(setSelectedSlice).toHaveBeenCalledWith(null)
  })

  it('selects a new slice if a different slice is currently selected', () => {
    const setSelectedSlice = jest.fn()
    toggleSelection(2, 1, setSelectedSlice)
    expect(setSelectedSlice).toHaveBeenCalledWith(2)
  })
})

describe('onChartClick', () => {
  it('toggles the selection of the clicked slice and calls onPieClick', () => {
    const setSelectedSlice = jest.fn()
    const onPieClick = jest.fn()
    const params = { dataIndex: 1 } as EventParams

    onChartClick(params, null, setSelectedSlice, onPieClick)

    expect(setSelectedSlice).toHaveBeenCalledWith(1)
    expect(onPieClick).toHaveBeenCalledWith(params)
  })

  it('deselects the clicked slice if it is already selected', () => {
    const setSelectedSlice = jest.fn()
    const onPieClick = jest.fn()
    const params = { dataIndex: 1 } as EventParams

    onChartClick(params, 1, setSelectedSlice, onPieClick)

    expect(setSelectedSlice).toHaveBeenCalledWith(null)
    expect(onPieClick).toHaveBeenCalledWith(params)
  })
})

describe('onClickLegend', () => {
  const mockData = [
    { name: 'Slice 1' },
    { name: 'Slice 2' },
    { name: 'Slice 3' }
  ]

  it('toggles the selection of the legend slice and calls onLegendClick', () => {
    const setSelectedSlice = jest.fn()
    const onLegendClick = jest.fn()
    const params = { name: 'Slice 2' } as EventParams

    onClickLegend(params, mockData, null, setSelectedSlice, onLegendClick)

    expect(setSelectedSlice).toHaveBeenCalledWith(1)
    expect(onLegendClick).toHaveBeenCalledWith(mockData[1])
  })
  it('deselects the legend slice if it is already selected', () => {
    const setSelectedSlice = jest.fn()
    const onLegendClick = jest.fn()
    const params = { name: 'Slice 2' } as EventParams

    onClickLegend(params, mockData, 1, setSelectedSlice, onLegendClick)

    expect(setSelectedSlice).toHaveBeenCalledWith(null)
    expect(onLegendClick).toHaveBeenCalledWith(mockData[1])
  })

  it('does nothing if the clicked slice is not found in data', () => {
    const setSelectedSlice = jest.fn()
    const onLegendClick = jest.fn()
    const params = { name: 'Unknown Slice' } as EventParams

    onClickLegend(params, mockData, null, setSelectedSlice, onLegendClick)

    expect(setSelectedSlice).not.toHaveBeenCalled()
  })
})
