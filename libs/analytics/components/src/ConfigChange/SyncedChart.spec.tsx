import { useContext } from 'react'

import userEvent from '@testing-library/user-event'
import _         from 'lodash'

import type { ConfigChange, ConfigChangePaginationParams }             from '@acx-ui/components'
import { useIsSplitOn }                                                from '@acx-ui/feature-toggle'
import { dataApiURL, Provider }                                        from '@acx-ui/store'
import { mockGraphqlQuery, render, waitForElementToBeRemoved, screen } from '@acx-ui/test-utils'
import { DateRange }                                                   from '@acx-ui/utils'

import { configChangeSeries }                        from './__tests__/fixtures'
import { ConfigChangeContext, ConfigChangeProvider } from './context'
import { SyncedChart }                               from './SyncedChart'

jest.mock('@acx-ui/components', () => {
  const configChange = (require('./__tests__/fixtures')
    .configChangeSeries as ConfigChange[])
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .map((value, id)=>({ ...value, id }))
    .at(-1)!
  return {
    ...jest.requireActual('@acx-ui/components'),
    ConfigChangeChart: ({ data, selectedData, pagination, onDotClick }: {
      data: ConfigChange[],
      selectedData?: ConfigChange,
      pagination?: ConfigChangePaginationParams
      onDotClick: (params: ConfigChange) => void
    }) => {
      return <>
        <div>{data.at(-1)?.type}</div>
        <div>{selectedData?.type}</div>
        <div>{JSON.stringify(pagination)}</div>
        <div data-testid='dot' onClick={() => onDotClick(configChange)} />
        <div data-testid='ConfigChangeChart' />
      </>
    }
  }
})

describe('SyncedChart', () => {
  const data = configChangeSeries
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .map((value, id)=>({ ...value, id }))
  beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(true))
  it('should render page correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChangeSeries',
      { data: { network: { hierarchyNode: { configChangeSeries: data } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <SyncedChart/>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByTestId('ConfigChangeChart')).toBeVisible()
    expect(await screen.findAllByText('intentAI')).toHaveLength(1)
  })
  it('should show empty chart', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChangeSeries',
      { data: { network: { hierarchyNode: { configChangeSeries: [] } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <SyncedChart/>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('ConfigChangeChart')).toBeVisible()
  })
  it('should render page correctly with selected data', async () => {
    const TestComponent = () => {
      const { setSelected } = useContext(ConfigChangeContext)
      return <div data-testid='setSelected'
        onClick={() => { setSelected(data[0] as ConfigChange) }}/>
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChangeSeries',
      { data: { network: { hierarchyNode: { configChangeSeries: data } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <div><SyncedChart/><TestComponent/></div>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('ConfigChangeChart')).toBeVisible()
    expect(await screen.findByText('intentAI')).toBeVisible()

    await userEvent.click(await screen.findByTestId('setSelected'))
    expect(await screen.findByText('ap')).toBeVisible()
  })
  it('should handle click on dot', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChangeSeries',
      { data: { network: { hierarchyNode: { configChangeSeries: data } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <SyncedChart/>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(await screen.findAllByText('intentAI')).toHaveLength(1)
    expect(await screen.findByTestId('ConfigChangeChart')).toBeVisible()
    expect(await screen.findByText(
      '{"current":1,"pageSize":10,"defaultPageSize":10,"total":11}')).toBeVisible()

    await userEvent.click(screen.getByTestId('dot'))
    expect(await screen.findAllByText('intentAI')).toHaveLength(2)
    expect(await screen.findByText(
      '{"current":2,"pageSize":10,"defaultPageSize":10,"total":11}')).toBeVisible()
  })
  it('should query with non-empty filter', async () => {
    const TestComp = () => {
      const {
        legendFilter, entityTypeFilter, setEntityTypeFilter
      } = useContext(ConfigChangeContext)
      return <>
        <div data-testid='test' onClick={() => { setEntityTypeFilter(['ap']) }} />
        <div data-testid='filter'>
          {legendFilter.filter(
            t => (_.isEmpty(entityTypeFilter) || entityTypeFilter.includes(t))
          ).join(',')}
        </div>
      </>
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChangeSeries',
      { data: { network: { hierarchyNode: { configChangeSeries: data } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <><TestComp/><SyncedChart/></>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })

    await userEvent.click(await screen.findByTestId('test'))
    expect(await screen.findByTestId('ConfigChangeChart')).toBeVisible()
    expect(await screen.findByTestId('filter')).toHaveTextContent('ap')
  })
})
