import '@testing-library/jest-dom'

import { Provider }                        from '@acx-ui/store'
import { render }                          from '@acx-ui/test-utils'
import { DateRange, type AnalyticsFilter } from '@acx-ui/utils'

import { WiredTab } from '.'

jest.mock('./SummaryBoxes', () => ({
  SummaryBoxes: () => <div>Mocked SummaryBoxes</div>
}))


const params = { activeTab: 'wired', tenantId: 'tenant-id' }
describe('WiredTab', () => {
  it('should render correctly', async () => {
    const { asFragment }=render(<Provider><WiredTab /></Provider>, { route: { params } })
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
      <WiredTab filters={filters} /></Provider>,
    { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })
})
