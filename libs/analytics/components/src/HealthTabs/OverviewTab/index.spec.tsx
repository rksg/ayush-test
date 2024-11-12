import '@testing-library/jest-dom'

import { get }                             from '@acx-ui/config'
import { useIsSplitOn }                    from '@acx-ui/feature-toggle'
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

const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

beforeEach(() => mockGet.mockReturnValue(''))

const params = { activeTab: 'overview', tenantId: 'tenant-id' }
describe('OverviewTab', () => {
  it('should render correctly', async () => {
    const { asFragment }=render(<Provider><OverviewTab /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly when 10010e FF is enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValueOnce(true)
    const { asFragment }=render(<Provider><OverviewTab /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly when IS_MLISA_SA', async () => {
    mockGet.mockReturnValue('true')
    const { asFragment }=render(<Provider><OverviewTab /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render correctly when IS_MLISA_SA and 10010e FF enabled', async () => {
    mockGet.mockReturnValue('true')
    jest.mocked(useIsSplitOn).mockReturnValueOnce(true)
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
