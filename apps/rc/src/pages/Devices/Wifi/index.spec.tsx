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
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
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

jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
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
    userEvent.click(await screen.findByText('Airtime Utilization Report'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/devices/wifi/reports/airtime', hash: '', search: ''
    }))
  })
})
