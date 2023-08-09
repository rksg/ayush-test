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
  it('should render page correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days} setDateRange={jest.fn()}>
      <Chart />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('ConfigChangeChart')).toBeVisible()
  })
  it('should show empty chart', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: [] } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days} setDateRange={jest.fn()}>
      <Chart />
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('ConfigChangeChart')).toBeVisible()
  })
})