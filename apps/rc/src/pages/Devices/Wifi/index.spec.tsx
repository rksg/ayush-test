import userEvent from '@testing-library/user-event'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { ReportType }   from '@acx-ui/reports/components'
import { Provider }     from '@acx-ui/store'
import {
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { WifiTabsEnum }    from '.'
import { AccessPointList } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./ApsTable', () => ({
  ...jest.requireActual('./ApsTable'),
  __esModule: true,
  default: () => ({
    title: 'ApsTable',
    headerExtra: [],
    component: <div data-testid='ApsTable' />
  })
}))

jest.mock('./ApGroupsTable', () => ({
  ...jest.requireActual('./ApGroupsTable'),
  __esModule: true,
  default: () => ({
    title: 'ApGroupsTable',
    headerExtra: [],
    component: <div data-testid='ApGroupsTable' />
  })
}))

jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  NetworkFilter: () => <div data-testid='NetworkFilter' />
}))

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: (props: { reportName: ReportType }) => <div data-testid={props.reportName} />
}))

describe('AccessPointList with feature toggle', () => {
  beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(true))
  it('should render aps table tab', async () => {
    render(<AccessPointList tab={WifiTabsEnum.LIST}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('ApsTable')).toBeVisible()
  })
  it('should render ap groups table tab', async () => {
    render(<AccessPointList tab={WifiTabsEnum.AP_GROUP}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('ApGroupsTable')).toBeVisible()
  })
  it('should render ap report tab', async () => {
    render(<AccessPointList tab={WifiTabsEnum.AP_REPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId(ReportType.ACCESS_POINT)).toBeVisible()
  })
  it('should render airtime reports tab', async () => {
    render(<AccessPointList tab={WifiTabsEnum.AIRTIME_REPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId(ReportType.AIRTIME_UTILIZATION)).toBeVisible()
  })
  it('should handle tab click', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<AccessPointList tab={WifiTabsEnum.AP_REPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByRole('tab', { name: 'Airtime Utilization Report' }))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/devices/wifi/reports/airtime', hash: '', search: ''
    }))
  })
})

