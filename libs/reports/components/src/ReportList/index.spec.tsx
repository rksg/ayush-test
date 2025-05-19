import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { useIsEdgeFeatureReady }              from '@acx-ui/rc/components'
import { render, screen, within }             from '@acx-ui/test-utils'
import { getUserProfile as getUserProfileR1 } from '@acx-ui/user'
import { AccountTier }                        from '@acx-ui/utils'

import { getDataStudioReportName, ReportType } from '../mapping/reportsMapping'

import { ReportList } from '.'

const mockedUseNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false) }))

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  getUserProfile: jest.fn()
}))
const userProfileR1 = getUserProfileR1 as jest.Mock


describe('ReportList', () => {
  const path = '/:tenantId/t'
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742'
  }
  afterEach(() => {
    jest.clearAllMocks()
    userProfileR1.mockReset()
  })

  it('should render correctly', () => {
    render(<ReportList />, { route: { path, params } })
    expect(screen.getByText('Reports')).toBeVisible()
    expect(screen.getByText('Overview')).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(<ReportList />, { route: { path, params } })
    expect(await screen.findByText('Business Insights')).toBeVisible()
  })

  it('should render breadcrumb correctly for Core tier', async () => {
    userProfileR1.mockReturnValue({
      profile: {
        support: false
      },
      accountTier: 'Silver'
    })
    render(<ReportList />, { route: { path, params } })
    expect(await screen.findByText('Business Insights')).toBeVisible()
    expect(screen.queryByText('Reports')).toBeNull()

  })

  it('should route to report when card is clicked', async () => {
    render(<ReportList />, { route: { path, params } })
    // eslint-disable-next-line testing-library/no-node-access
    const card = screen.getByText('Overview').parentElement?.parentElement?.parentElement
    await userEvent.click(within(card!).getByRole('button'))
    expect(mockedUseNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/reports/overview`,
      hash: '',
      search: ''
    })
  })

  it('should render report cards with feature ready', async () => {
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(true)

    render(<ReportList />, { route: { path, params } })

    expect(await screen.findByText('RUCKUS Edge Applications')).toBeVisible()
    expect(screen.getByText('RUCKUS Edge Applications')).toBeVisible()
  })

  it('should not render report cards without feature ready', async () => {
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)

    render(<ReportList />, { route: { path, params } })

    expect(screen.queryByText('RUCKUS Edge Applications')).toBeNull()
  })

  it('should render Core tier-specific reports and exclude non-Core reports', () => {
    userProfileR1.mockReturnValue({
      profile: {
        support: false
      },
      accountTier: 'Silver'
    })
    render(<ReportList />, { route: { path, params } })

    // Verify Core tier-specific reports are visible
    expect(screen.getByText('Overview')).toBeVisible()
    expect(screen.getByText('Access Points')).toBeVisible()
    expect(screen.getByText('Airtime Utilization')).toBeVisible()
    expect(screen.getByText('Switches')).toBeVisible()
    expect(screen.getByText('Wired')).toBeVisible()
    expect(screen.getByText('Wireless')).toBeVisible()
    expect(screen.getByText('Wireless Clients')).toBeVisible()
    expect(screen.getByText('WLANs')).toBeVisible()

    // Verify Core tier-specific adhoc reports are visible
    expect(screen.getByText('Wireless : RSS and Traffic by Access Points')).toBeVisible()
    expect(screen.getByText('Wireless : RSS and Session by Access Points')).toBeVisible()
    expect(screen.getByText('Wireless : Airtime by Access Points')).toBeVisible()

    // Verify non-Core tier reports are not rendered
    expect(screen.queryByText('Applications')).toBeNull()
    expect(screen.queryByText('Wireless : Traffic by Applications and Access Points')).toBeNull()
  })

  it('should return correct embedDashboardName for Core tier', () => {
    expect(getDataStudioReportName(ReportType.AP_DETAIL, AccountTier.CORE, true))
      .toBe('Silver_AP Details')
    expect(getDataStudioReportName(ReportType.ACCESS_POINT, AccountTier.CORE, true))
      .toBe('Access Points')
  })
  it('should return correct embedDashboardName for non-Core tier', () => {
    expect(getDataStudioReportName(ReportType.AP_DETAIL, AccountTier.GOLD, true)).toBe('AP Details')
    expect(getDataStudioReportName(ReportType.ACCESS_POINT, AccountTier.GOLD,true))
      .toBe('Access Points')

  })
  it('should return correct embedDashboardName where FF toggle is disabled', () => {
    expect(getDataStudioReportName(ReportType.AP_DETAIL, AccountTier.CORE, false))
      .toBe('AP Details')
  })
})
