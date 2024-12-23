import userEvent from '@testing-library/user-event'

import type { ConfigChange }                                           from '@acx-ui/components'
import { get }                                                         from '@acx-ui/config'
import { useIsSplitOn }                                                from '@acx-ui/feature-toggle'
import { Provider, dataApiURL }                                        from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { DateRange, defaultRanges }                                    from '@acx-ui/utils'

import { configChanges } from './__tests__/fixtures'
import { Chart }         from './Chart'
import {
  ConfigChangeProvider,
  ConfigChangeContext,
  KPIFilterContext
} from './context'

jest.mock('@acx-ui/components', () => {
  const configChange = require('./__tests__/fixtures').configChanges[0]
  return {
    ...jest.requireActual('@acx-ui/components'),
    ConfigChangeChart: ({ data, onDotClick }: {
      data: ConfigChange[],
      onDotClick: (params: ConfigChange) => void }) => {
      return <>
        <div>{data.at(-1)?.type}</div>
        <div data-testid='dot' onClick={() => onDotClick(configChange)} />
        <div data-testid='ConfigChangeChart' />
      </>
    }
  }
})

const mockGet = jest.mocked(get)
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('Chart', () => {
  const handleClick = jest.fn()
  const legend = { 'AP': true, 'AP Group': true, 'Zone': true, 'WLAN': true, 'WLAN Group': true }
  beforeEach(() => {
    mockGet.mockReturnValue('true')
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })
  it('should render page correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <Chart
        selected={null}
        onClick={handleClick}
        legend={legend}
        setLegend={jest.fn()}
      />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByTestId('ConfigChangeChart')).toBeVisible()
    expect(await screen.findByText('zone')).toBeVisible()
  })
  it('should render page correctly for R1 with feature toggle', async () => {
    mockGet.mockReturnValue('')
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const legendWithIntentAI = { ...legend, IntentAI: true }
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <Chart
        selected={null}
        onClick={handleClick}
        legend={legendWithIntentAI}
        setLegend={jest.fn()}
      />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByTestId('ConfigChangeChart')).toBeVisible()
    expect(await screen.findByText('intentAI')).toBeVisible()
  })
  it('should show empty chart', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: [] } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <Chart
        selected={null}
        onClick={handleClick}
        legend={legend}
        setLegend={jest.fn()}
      />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('ConfigChangeChart')).toBeVisible()
  })
  it('should render page correctly with selected data', async () => {
    const selected = {
      id: 0,
      timestamp: '1685427082100',
      type: 'ap',
      name: '94:B3:4F:3D:21:80',
      key: 'initialState.ccmAp.radio24g.radio.channel_fly_mtbc',
      oldValues: [],
      newValues: ['480']
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <Chart
        selected={selected}
        onClick={handleClick}
        legend={legend}
        setLegend={jest.fn()}
      />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('ConfigChangeChart')).toBeVisible()
  })
  it('should handle click on dot', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges } } } })
    const configChangeContextValue = {
      dateRange: DateRange.last7Days,
      timeRanges: defaultRanges()[DateRange.last7Days]!,
      setDateRange: jest.fn(),
      kpiTimeRanges: [[0, 0], [0, 0]],
      setKpiTimeRanges: jest.fn()
    }
    const mockedApplyKpiFilter = jest.fn()
    const kpiFilterContextValue = {
      kpiFilter: [],
      setKpiFilter: jest.fn(),
      applyKpiFilter: mockedApplyKpiFilter
    }
    render(<ConfigChangeContext.Provider value={configChangeContextValue}>
      <KPIFilterContext.Provider value={kpiFilterContextValue}>
        <Chart
          selected={null}
          onClick={handleClick}
          legend={legend}
          setLegend={jest.fn()}
        />
      </KPIFilterContext.Provider>
    </ConfigChangeContext.Provider>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('ConfigChangeChart')).toBeVisible()
    await userEvent.click(screen.getByTestId('dot'))
    expect(handleClick).toBeCalledWith(configChanges[0])
    expect(mockedApplyKpiFilter).toBeCalledWith([])
  })
})
