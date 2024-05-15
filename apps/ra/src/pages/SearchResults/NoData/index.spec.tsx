import { useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { cleanup, render, screen }           from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions } from '@acx-ui/user'

import NoData from '.'

describe('SearchResults - NoData', () => {

  afterEach(() => {
    cleanup()
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
    setRaiPermissions({
      READ_DATA_STUDIO: true,
      READ_REPORTS: true,
      READ_DASHBOARD: true,
      READ_INCIDENTS: true,
      READ_WIRELESS_CLIENTS_LIST: true,
      READ_ACCESS_POINTS_LIST: true,
      READ_SWITCH_LIST: true,
      READ_WIFI_NETWORKS_LIST: true
    } as RaiPermissions)
    render(<NoData />, { route: { params: { tenantId: '1234' } } })
    await Promise.all(allLinks.map(async (val) => {
      expect(await screen.findByText(val)).toBeInTheDocument()
    }))
  })

  it('should render correctly for report-only user', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    setRaiPermissions({
      READ_DATA_STUDIO: true,
      READ_REPORTS: true
    } as RaiPermissions)
    render(<NoData />, { route: { params: { tenantId: '1234' } } })
    await Promise.all(allLinksReport.map(async (val) => {
      expect(await screen.findByText(val)).toBeInTheDocument()
    }))
  })
})
