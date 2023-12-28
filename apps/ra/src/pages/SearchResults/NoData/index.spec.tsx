import { getUserProfile }          from '@acx-ui/analytics/utils'
import { useIsSplitOn }            from '@acx-ui/feature-toggle'
import { cleanup, render, screen } from '@acx-ui/test-utils'

import NoData from '.'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: jest.fn()
}))

const userProfile = getUserProfile as jest.Mock

describe('SearchResults - NoData', () => {

  afterEach(() => {
    cleanup()
    userProfile.mockClear()
  })

  const allLinks = [
    'Dashboard',
    'Incidents',
    'Clients',
    'APs',
    'Switches',
    'Wi-Fi Networks'
  ]

  const allLinksReport = [
    'Data Studio',
    'Reports'
  ]

  it('should render correctly for snapshot test with toggles on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    userProfile.mockReturnValueOnce({ selectedTenant: { role: 'admin' } })
    render(<NoData />, { route: { params: { tenantId: '1234' } } })
    await Promise.all(allLinks.map(async (val) => {
      expect(await screen.findByText(val)).toBeInTheDocument()
    }))
  })

  it('should render correctly for report-only user', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    userProfile.mockReturnValueOnce({ selectedTenant: { role: 'report-only' } })
    render(<NoData />, { route: { params: { tenantId: '1234' } } })
    await Promise.all(allLinksReport.map(async (val) => {
      expect(await screen.findByText(val)).toBeInTheDocument()
    }))
  })
})
