import '@testing-library/jest-dom'

import { get }          from '@acx-ui/config'
import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { Provider }     from '@acx-ui/store'
import {
  fireEvent,
  render,
  screen
} from '@acx-ui/test-utils'
import { DateRange, type AnalyticsFilter } from '@acx-ui/utils'


import { WiredTab } from '.'

const mockedUseNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate
}))
jest.mock('./SummaryBoxes', () => ({
  SummaryBoxes: () => <div>Mocked SummaryBoxes</div>
}))
jest.mock('./Kpi', () => () => <div>Kpi Section</div>)

const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

beforeEach(() => mockGet.mockReturnValue(''))

const params = { activeTab: 'wired', tenantId: 'tenant-id' }
describe('WiredTab', () => {
  it('should render correctly', async () => {
    const { asFragment }=render(<Provider><WiredTab /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render correctly when 10010e FF is enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValueOnce(true)
    const { asFragment }=render(<Provider><WiredTab /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render correctly when IS_MLISA_SA', async () => {
    mockGet.mockReturnValue('true')
    const { asFragment }=render(<Provider><WiredTab /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render correctly when IS_MLISA_SA and 10010e FF enabled', async () => {
    mockGet.mockReturnValue('true')
    jest.mocked(useIsSplitOn).mockReturnValueOnce(true)
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
  it('should render default tab when activeTab param is not set', async () => {
    const params = { tenantId: 'tenant-id' }
    render(<Provider><WiredTab /></Provider>, { route: { params } })
    expect(await screen.findByText('Overview')).toBeVisible()
  })
  it('should render other tab', async () => {
    const params = { activeTab: 'connection', tenantId: 'tenant-id' }
    render(<Provider><WiredTab /></Provider>, { route: { params } })
    expect(await screen.findByText('Connection')).toBeVisible()
  })
  it('should handle tab changes', async () => {
    render(<Provider><WiredTab /></Provider>, { route: { params } })
    fireEvent.click(await screen.findByText('Connection'))
    expect(mockedUseNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/analytics/health/wired/tab/connection`,
      hash: '',
      search: ''
    })
  })

  describe('Infrastructure tab persistence', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear()
      mockedUseNavigate.mockClear()
    })

    it('should clear localStorage when clicking on infrastructure tab', async () => {
      // Set some value in localStorage to simulate previous selection
      localStorage.setItem('health-infrastructure-kpi-content-switcher', 'Table')

      render(<Provider><WiredTab /></Provider>, { route: { params } })

      // Click on Infrastructure tab
      fireEvent.click(await screen.findByText('Infrastructure'))

      // Verify localStorage is cleared
      expect(localStorage.getItem('health-infrastructure-kpi-content-switcher')).toBeFalsy()

      // Verify navigation happens
      expect(mockedUseNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/t/analytics/health/wired/tab/infrastructure`,
        hash: '',
        search: ''
      })
    })

    it('should not clear localStorage when clicking on other tabs', async () => {
      // Set some value in localStorage
      localStorage.setItem('health-infrastructure-kpi-content-switcher', 'Table')

      render(<Provider><WiredTab /></Provider>, { route: { params } })

      // Click on Overview tab (not infrastructure)
      fireEvent.click(await screen.findByText('Overview'))

      // Verify localStorage is NOT cleared
      expect(localStorage.getItem('health-infrastructure-kpi-content-switcher')).toBe('Table')
    })

    it('should preserve localStorage value if infrastructure tab is not clicked', async () => {
      // Set some value in localStorage
      localStorage.setItem('health-infrastructure-kpi-content-switcher', 'Table')

      render(<Provider><WiredTab /></Provider>, { route: { params } })

      // Click on Performance tab
      fireEvent.click(await screen.findByText('Performance'))

      // Verify localStorage is preserved
      expect(localStorage.getItem('health-infrastructure-kpi-content-switcher')).toBe('Table')
    })
  })
})
