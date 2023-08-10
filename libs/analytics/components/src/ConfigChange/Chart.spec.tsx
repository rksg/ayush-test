import { Provider, dataApiURL }             from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import { configChanges }        from './__tests__/fixtures'
import { Chart }                from './Chart'
import { ConfigChangeProvider } from './context'

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  ConfigChangeChart: () => <div data-testid='ConfigChangeChart' />
}))

describe('Chart', () => {
  const handleClick = jest.fn()
  it('should render page correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days} setDateRange={jest.fn()}>
      <Chart
        selected={null}
        onClick={handleClick}
      />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('ConfigChangeChart')).toBeVisible()
  })
  it('should show empty chart', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: [] } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days} setDateRange={jest.fn()}>
      <Chart
        selected={null}
        onClick={handleClick}
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
    render(<ConfigChangeProvider dateRange={DateRange.last7Days} setDateRange={jest.fn()}>
      <Chart
        selected={selected}
        onClick={handleClick}
      />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('ConfigChangeChart')).toBeVisible()
  })
})