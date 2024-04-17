import '@testing-library/jest-dom'

import { Provider }                        from '@acx-ui/store'
import { render }                          from '@acx-ui/test-utils'
import { DateRange, type AnalyticsFilter } from '@acx-ui/utils'

import { OverviewTab } from '.'

jest.mock('./SummaryBoxes', () => ({
  SummaryBoxes: () => <div>Mocked SummaryBoxes</div>
}))

jest.mock('./ConnectedClientsOverTime', () => ({
  ConnectedClientsOverTime: () => <div>Mocked ConnectedClientsOverTime</div>
}))

const params = { activeTab: 'overview', tenantId: 'tenant-id' }
describe('OverviewTab', () => {
  it('should render correctly', async () => {
    const { asFragment }=render(<Provider><OverviewTab /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render correctly with filter passed as props', async () => {
    const filters: AnalyticsFilter = {
      startDate: '2022-01-01T00:00:00+08:00',
      endDate: '2022-01-02T00:00:00+08:00',
      range: DateRange.last24Hours,
      filter: {}
    }
    const { asFragment }=render(<Provider>
      <OverviewTab filters={filters} /></Provider>,
    { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })
})
