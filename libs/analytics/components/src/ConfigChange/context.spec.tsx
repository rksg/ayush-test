import userEvent from '@testing-library/user-event'
import moment    from 'moment-timezone'

import { CONFIG_CHANGE_DEFAULT_PAGINATION } from '@acx-ui/components'
import { get }                              from '@acx-ui/config'
import { useIsSplitOn }                     from '@acx-ui/feature-toggle'
import { render, screen }                   from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import { configChanges }                             from './__tests__/fixtures'
import { ConfigChangeProvider, ConfigChangeContext } from './context'
import { SORTER_ABBR }                               from './services'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getIntl: () => ({ $t: jest.fn((message) => message.defaultMessage[0].value) })
}))

const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('ConfigChangeProvider', () => {
  const timezone = 'UTC'
  beforeEach(() => {
    moment.tz.setDefault(timezone)
    Date.now = jest.fn(() => new Date('2022-10-15T00:00:00.000Z').getTime())
    mockGet.mockReturnValue(false)
    jest.mocked(useIsSplitOn).mockReturnValue(false)
  })
  afterEach(() => { moment.tz.setDefault(moment.tz.guess()) })

  it('should handle pagination context', async () => {
    render(
      <ConfigChangeProvider dateRange={DateRange.last30Days}>
        <ConfigChangeContext.Consumer>
          {({ pagination, setPagination, applyPagination }) =>
            <>
              <div data-testid='pagination'>{JSON.stringify(pagination)}</div>
              <div
                data-testid='setPagination'
                onClick={() =>
                  setPagination({ ...CONFIG_CHANGE_DEFAULT_PAGINATION, current: 2 })}/>
              <div data-testid='applyPagination' onClick={() => applyPagination({ current: 3 })}/>
            </>}
        </ConfigChangeContext.Consumer>
      </ConfigChangeProvider>
    )
    expect(await screen.findByTestId('pagination'))
      .toHaveTextContent(JSON.stringify(CONFIG_CHANGE_DEFAULT_PAGINATION))

    await userEvent.click(await screen.findByTestId('setPagination'))
    expect(await screen.findByTestId('pagination'))
      .toHaveTextContent(JSON.stringify({ ...CONFIG_CHANGE_DEFAULT_PAGINATION, current: 2 }))

    await userEvent.click(await screen.findByTestId('applyPagination'))
    expect(await screen.findByTestId('pagination'))
      .toHaveTextContent(JSON.stringify({ ...CONFIG_CHANGE_DEFAULT_PAGINATION, current: 3 }))
  })
  it('should handle filterBy context', async () => {
    mockGet.mockReturnValue('true')
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const filter ={
      'AP': false, 'AP Group': true, 'Zone': true,
      'WLAN': false, 'WLAN Group': true, 'IntentAI': true
    }
    render(
      <ConfigChangeProvider dateRange={DateRange.last30Days}>
        <ConfigChangeContext.Consumer>
          {({ legendFilter, applyLegendFilter,
            entityNameSearch, setEntityNameSearch,
            entityTypeFilter, setEntityTypeFilter,
            resetFilter
          }) =>
            <>
              <div data-testid='legendFilter'>{JSON.stringify(legendFilter)}</div>
              <div data-testid='applyLegendFilter' onClick={() => applyLegendFilter(filter)}/>
              <div data-testid='entityNameSearch'>{entityNameSearch}</div>
              <div data-testid='setEntityNameSearch' onClick={() =>setEntityNameSearch('search')}/>
              <div data-testid='entityTypeFilter'>{JSON.stringify(entityTypeFilter)}</div>
              <div data-testid='setEntityTypeFilter' onClick={() =>setEntityTypeFilter(['ap'])}/>
              <div data-testid='resetFilter' onClick={resetFilter}/>
            </>}
        </ConfigChangeContext.Consumer>
      </ConfigChangeProvider>
    )
    expect(await screen.findByTestId('legendFilter'))
      .toHaveTextContent(JSON.stringify(['intentAI', 'ap', 'apGroup', 'wlan', 'wlanGroup', 'zone']))
    await userEvent.click(await screen.findByTestId('applyLegendFilter'))
    expect(await screen.findByTestId('legendFilter'))
      .toHaveTextContent(JSON.stringify(['apGroup', 'zone', 'wlanGroup', 'intentAI']))

    expect(await screen.findByTestId('entityNameSearch')).toHaveTextContent('')
    await userEvent.click(await screen.findByTestId('setEntityNameSearch'))
    expect(await screen.findByTestId('entityNameSearch')).toHaveTextContent('search')

    expect(await screen.findByTestId('entityTypeFilter')).toHaveTextContent(JSON.stringify([]))
    await userEvent.click(await screen.findByTestId('setEntityTypeFilter'))
    expect(await screen.findByTestId('entityTypeFilter')).toHaveTextContent(JSON.stringify(['ap']))

    await userEvent.click(await screen.findByTestId('resetFilter'))
    expect(await screen.findByTestId('entityNameSearch')).toHaveTextContent('')
    expect(await screen.findByTestId('entityTypeFilter')).toHaveTextContent(JSON.stringify([]))
  })
  it('should handle kpiFilter context', async () => {
    render(
      <ConfigChangeProvider dateRange={DateRange.last30Days}>
        <ConfigChangeContext.Consumer>
          {({ kpiFilter, setKpiFilter, applyKpiFilter, resetFilter }) =>
            <>
              <div data-testid='kpiFilter'>{JSON.stringify(kpiFilter)}</div>
              <div data-testid='setKpiFilter' onClick={() => setKpiFilter('kpikey1')}/>
              <div
                data-testid='applyKpiFilter'
                onClick={() => applyKpiFilter(['kpikey2', 'kpikey3'])}/>
              <div data-testid='resetFilter' onClick={resetFilter}/>
            </>}
        </ConfigChangeContext.Consumer>
      </ConfigChangeProvider>
    )
    expect(await screen.findByTestId('kpiFilter')).toHaveTextContent(JSON.stringify([]))

    await userEvent.click(await screen.findByTestId('applyKpiFilter'))
    expect(await screen.findByTestId('kpiFilter'))
      .toHaveTextContent(JSON.stringify(['kpikey2', 'kpikey3']))

    await userEvent.click(await screen.findByTestId('setKpiFilter'))
    expect(await screen.findByTestId('kpiFilter'))
      .toHaveTextContent(JSON.stringify(['kpikey2', 'kpikey3', 'kpikey1']))

    await userEvent.click(await screen.findByTestId('setKpiFilter'))
    expect(await screen.findByTestId('kpiFilter'))
      .toHaveTextContent(JSON.stringify(['kpikey2', 'kpikey3']))

    await userEvent.click(await screen.findByTestId('resetFilter'))
    expect(await screen.findByTestId('kpiFilter')).toHaveTextContent(JSON.stringify([]))
  })
  it('should handle timeRange context', async () => {
    render(
      <ConfigChangeProvider dateRange={DateRange.last30Days}>
        <ConfigChangeContext.Consumer>
          {({ dateRange, timeRanges, kpiTimeRanges, setKpiTimeRanges }) => <>
            <div data-testid='dateRange'>{dateRange}</div>
            <div data-testid='timeRanges'>{timeRanges.flatMap(t => t.format()).join(', ')}</div>
            <div data-testid='kpiTimeRanges'>
              {kpiTimeRanges.flat().map(t => moment(t).format()).join(', ')}
            </div>
            <div data-testid='setKpiTimeRanges'
              onClick={() => setKpiTimeRanges([
                [ new Date('2023-09-15T00:01:00Z').valueOf(),
                  new Date('2023-09-16T00:01:00Z').valueOf() ],
                [ new Date('2023-10-14T00:01:00Z').valueOf(),
                  new Date('2023-10-15T00:01:00Z').valueOf() ]
              ])}/>
          </>}
        </ConfigChangeContext.Consumer>
      </ConfigChangeProvider>
    )
    expect(await screen.findByTestId('dateRange'))
      .toHaveTextContent('Last 30 Days')
    expect(await screen.findByTestId('timeRanges'))
      .toHaveTextContent('2022-09-15T00:01:00Z, 2022-10-15T00:01:00Z')
    expect(await screen.findByTestId('kpiTimeRanges')).toHaveTextContent(
      '2022-09-15T00:01:00Z, 2022-09-16T00:01:00Z, 2022-10-14T00:01:00Z, 2022-10-15T00:01:00Z')

    await userEvent.click(await screen.findByTestId('setKpiTimeRanges'))
    expect(await screen.findByTestId('kpiTimeRanges')).toHaveTextContent(
      '2023-09-15T00:01:00Z, 2023-09-16T00:01:00Z, 2023-10-14T00:01:00Z, 2023-10-15T00:01:00Z')
  })
  describe('should handle action context', () => {
    const data = configChanges
      .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
      .map((value, id)=>({ ...value, id, filterId: id }))
    const TestComp = () => <ConfigChangeProvider dateRange={DateRange.last30Days}>
      <ConfigChangeContext.Consumer>
        {({ selected, setSelected, dotSelect, setDotSelect,
          onDotClick, onRowClick, chartZoom, setChartZoom,
          initialZoom, setInitialZoom, sorter, setSorter,
          pagination, applyPagination
        }) => <>
          <div data-testid='chartZoom'>{chartZoom && JSON.stringify(chartZoom)}</div>
          <div data-testid='setChartZoom' onClick={() => setChartZoom({ start: 10, end: 20 })}/>
          <div data-testid='initialZoom'>{initialZoom && JSON.stringify(initialZoom)}</div>
          <div data-testid='setInitialZoom'
            onClick={() => setInitialZoom({ start: 30, end: 40 })}/>
          <div data-testid='sorter'>{sorter}</div>
          <div data-testid='setSorter' onClick={() => setSorter(SORTER_ABBR.ASC)}/>

          <div data-testid='selected'>{selected && JSON.stringify(selected)}</div>
          <div data-testid='setSelected' onClick={() => setSelected(data[5])}/>
          <div data-testid='dotSelect'>{dotSelect}</div>
          <div data-testid='setDotSelect' onClick={() => setDotSelect(data[5].id)}/>

          <div data-testid='onDotClick' onClick={() => onDotClick(data[10])}/>
          <div data-testid='onRowClick' onClick={() => onRowClick(data[3])}/>

          <div data-testid='pagination'>{JSON.stringify(pagination)}</div>
          <div
            data-testid='setTotal'
            onClick={() => applyPagination({ total: 100 })}/>
          <div
            data-testid='setPageSize'
            onClick={() => applyPagination({ pageSize: 5 })}/>
          <div
            data-testid='changeTotal'
            onClick={() => applyPagination({ total: 50 })}/>
        </>}
      </ConfigChangeContext.Consumer>
    </ConfigChangeProvider>

    it('should handle action context', async () => {
      render(<TestComp/>)

      //init
      expect(await screen.findByTestId('pagination'))
        .toHaveTextContent(JSON.stringify(CONFIG_CHANGE_DEFAULT_PAGINATION))
      await userEvent.click(await screen.findByTestId('setTotal'))
      expect(await screen.findByTestId('pagination'))
        .toHaveTextContent(JSON.stringify({
          ...CONFIG_CHANGE_DEFAULT_PAGINATION, total: 100 }))
      await userEvent.click(await screen.findByTestId('setPageSize'))
      expect(await screen.findByTestId('pagination'))
        .toHaveTextContent(JSON.stringify({
          ...CONFIG_CHANGE_DEFAULT_PAGINATION, total: 100, pageSize: 5 }))

      await userEvent.click(await screen.findByTestId('setChartZoom'))
      expect(await screen.findByTestId('chartZoom'))
        .toHaveTextContent(JSON.stringify({ start: 10, end: 20 }))

      await userEvent.click(await screen.findByTestId('setInitialZoom'))
      expect(await screen.findByTestId('initialZoom'))
        .toHaveTextContent(JSON.stringify({ start: 30, end: 40 }))

      expect(await screen.findByTestId('sorter')).toHaveTextContent(SORTER_ABBR.DESC)
      await userEvent.click(await screen.findByTestId('setSorter'))
      expect(await screen.findByTestId('sorter')).toHaveTextContent(SORTER_ABBR.ASC)

      await userEvent.click(await screen.findByTestId('setSelected'))
      expect(await screen.findByTestId('selected')).toHaveTextContent(JSON.stringify(data[5]))

      await userEvent.click(await screen.findByTestId('setDotSelect'))
      expect(await screen.findByTestId('dotSelect')).toHaveTextContent(data[5].id.toString())

      await userEvent.click(await screen.findByTestId('onDotClick'))
      expect(await screen.findByTestId('selected')).toHaveTextContent(JSON.stringify(data[10]))
      expect(await screen.findByTestId('dotSelect')).toHaveTextContent(data[10].id.toString())
      expect(await screen.findByTestId('pagination'))
        .toHaveTextContent(JSON.stringify({
          ...CONFIG_CHANGE_DEFAULT_PAGINATION, current: 3, total: 100, pageSize: 5 }))

      expect(await screen.findByTestId('selected')).toHaveTextContent(JSON.stringify(data[10]))
      await userEvent.click(await screen.findByTestId('onRowClick'))
      expect(await screen.findByTestId('selected')).toHaveTextContent(JSON.stringify(data[3]))
    })
    it('should handle table pagination', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      render(<TestComp/>)

      expect(await screen.findByTestId('pagination'))
        .toHaveTextContent(JSON.stringify(CONFIG_CHANGE_DEFAULT_PAGINATION))
      await userEvent.click(await screen.findByTestId('setTotal'))
      expect(await screen.findByTestId('pagination'))
        .toHaveTextContent(JSON.stringify({
          ...CONFIG_CHANGE_DEFAULT_PAGINATION, total: 100 }))
      await userEvent.click(await screen.findByTestId('setPageSize'))
      expect(await screen.findByTestId('pagination'))
        .toHaveTextContent(JSON.stringify({
          ...CONFIG_CHANGE_DEFAULT_PAGINATION, total: 100, pageSize: 5 }))

      await userEvent.click(await screen.findByTestId('onDotClick'))
      expect(await screen.findByTestId('selected')).toHaveTextContent(JSON.stringify(data[10]))
      expect(await screen.findByTestId('dotSelect')).toHaveTextContent(data[10].id.toString())
      expect(await screen.findByTestId('pagination'))
        .toHaveTextContent(JSON.stringify({
          ...CONFIG_CHANGE_DEFAULT_PAGINATION, current: 3, total: 100, pageSize: 5 }))

      await userEvent.click(await screen.findByTestId('setSorter'))
      await userEvent.click(await screen.findByTestId('setSelected'))
      await userEvent.click(await screen.findByTestId('onDotClick'))
      expect(await screen.findByTestId('selected')).toHaveTextContent(JSON.stringify(data[10]))
      expect(await screen.findByTestId('dotSelect')).toHaveTextContent(data[10].id.toString())
      expect(await screen.findByTestId('pagination'))
        .toHaveTextContent(JSON.stringify({
          ...CONFIG_CHANGE_DEFAULT_PAGINATION, current: 18, total: 100, pageSize: 5 }))

      await userEvent.click(await screen.findByTestId('changeTotal'))
      expect(await screen.findByTestId('pagination'))
        .toHaveTextContent(JSON.stringify({
          ...CONFIG_CHANGE_DEFAULT_PAGINATION, total: 50 }))
      expect(await screen.findByTestId('selected')).not.toHaveTextContent(JSON.stringify(data[10]))
      expect(await screen.findByTestId('dotSelect')).not.toHaveTextContent(data[10].id.toString())
    })
    it('should handle onDotClick has no id', async () => {
      const { id, ...rest } = data[10]
      render(<ConfigChangeProvider dateRange={DateRange.last30Days}>
        <ConfigChangeContext.Consumer>
          {({ dotSelect, setDotSelect, onDotClick }) => <>
            <div data-testid='dotSelect'>{dotSelect}</div>
            <div data-testid='setDotSelect' onClick={() => setDotSelect(data[5].id)}/>
            <div data-testid='onDotClick' onClick={() => onDotClick(rest)}/>
          </>}
        </ConfigChangeContext.Consumer>
      </ConfigChangeProvider>)
      await userEvent.click(await screen.findByTestId('setDotSelect'))
      expect(await screen.findByTestId('dotSelect')).toHaveTextContent(data[5].id.toString())

      await userEvent.click(await screen.findByTestId('onDotClick'))
      expect(await screen.findByTestId('dotSelect')).not.toHaveTextContent(data[5].id.toString())
    })
  })
})
