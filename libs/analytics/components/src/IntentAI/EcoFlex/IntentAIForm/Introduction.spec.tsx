
import { render, screen } from '@acx-ui/test-utils'

import { mockedKpiData }           from '../__tests__/mockedEcoFlex'
import { MetricsGrid }             from '../MetricsGrid'
import { useIntentAIEcoFlexQuery } from '../services'

const mockedQueryResult = {
  isFetching: false,
  isLoading: false,
  data: mockedKpiData
} as ReturnType<typeof useIntentAIEcoFlexQuery>

const mockedEmptyQueryResult = {
  isFetching: false,
  isLoading: false,
  data: { data: { timestamp: '' }, compareData: { timestamp: '' } }
} as ReturnType<typeof useIntentAIEcoFlexQuery>


describe('introduction', () => {
  it('should render MetricsGrid when it has data', async () => {
    render(<MetricsGrid kpiQuery={mockedQueryResult} />)
    expect(screen.queryByTestId(/Metrics/)).toBeVisible()
  })

  it('should not render MetricsGrid when it has empty data', async () => {
    render(<MetricsGrid kpiQuery={mockedEmptyQueryResult} />)
    expect(screen.queryByTestId(/Metrics/)).toBeNull()
  })
})
