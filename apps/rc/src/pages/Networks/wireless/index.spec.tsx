import userEvent from '@testing-library/user-event'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { ReportType }   from '@acx-ui/reports/components'
import { Provider }     from '@acx-ui/store'
import {
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { NetworkTabsEnum } from '.'
import { NetworksList }    from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./NetworksTable', () => ({
  ...jest.requireActual('./NetworksTable'),
  __esModule: true,
  default: () => ({
    title: 'NetworksTable',
    headerExtra: [],
    component: <div data-testid='NetworksTable' />
  })
}))

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: (props: { reportName: ReportType }) => <div data-testid={props.reportName} />
}))

describe('NetworksList with feature toggle', () => {
  beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(true))
  it('should render networks table tab', async () => {
    render(<NetworksList tab={NetworkTabsEnum.LIST}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('NetworksTable')).toBeVisible()
  })
  it('should render wlan report tab', async () => {
    render(<NetworksList tab={NetworkTabsEnum.WLAN_REPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId(ReportType.WLAN)).toBeVisible()
  })
  it('should render applications report tab', async () => {
    render(<NetworksList tab={NetworkTabsEnum.APPLICATIONS_REPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId(ReportType.APPLICATION)).toBeVisible()
  })
  it('should render wireless report tab', async () => {
    render(<NetworksList tab={NetworkTabsEnum.WIRELESS_REPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId(ReportType.WIRELESS)).toBeVisible()
  })
  it('should handle tab click', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<NetworksList tab={NetworkTabsEnum.WIRELESS_REPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    userEvent.click(await screen.findByText('WLAN Report'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/networks/wireless/reports/wlans', hash: '', search: ''
    }))
    userEvent.click(await screen.findByText('Applications Report'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/networks/wireless/reports/applications', hash: '', search: ''
    }))
  })
})

describe('NetworksList without feature toggle', () => {
  beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(false))
  it('should render networks table tab', async () => {
    render(<NetworksList tab={NetworkTabsEnum.LIST}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('NetworksTable')).toBeVisible()
  })
  it('should not render wlan report tab', () => {
    render(<NetworksList tab={NetworkTabsEnum.WLAN_REPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(screen.queryByTestId(ReportType.WLAN)).toBeNull()
  })
  it('should not render applications report tab', () => {
    render(<NetworksList tab={NetworkTabsEnum.APPLICATIONS_REPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(screen.queryByTestId(ReportType.APPLICATION)).toBeNull()
  })
  it('should not render wireless report tab', () => {
    render(<NetworksList tab={NetworkTabsEnum.WIRELESS_REPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(screen.queryByTestId(ReportType.WIRELESS)).toBeNull()
  })
})
