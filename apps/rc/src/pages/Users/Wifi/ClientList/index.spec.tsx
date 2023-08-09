import userEvent from '@testing-library/user-event'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { ReportType }   from '@acx-ui/reports/components'
import { Provider }     from '@acx-ui/store'
import {
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { WifiClientList, WirelessTabsEnum } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  ClientDualTable: () => <div data-testid='ClientDualTable' />
}))

jest.mock('./GuestsTab', () => ({
  ...jest.requireActual('./GuestsTab'),
  GuestsTab: () => <div data-testid='GuestsTab' />
}))

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: (props: { reportName: ReportType }) => <div data-testid={props.reportName} />
}))

describe.skip('WifiClientList with feature toggle', () => {
  beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(true))
  it('should render wifi client tab', async () => {
    render(<WifiClientList tab={WirelessTabsEnum.CLIENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('ClientDualTable')).toBeVisible()
  })
  it('should render guest tab', async () => {
    render(<WifiClientList tab={WirelessTabsEnum.GUESTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('GuestsTab')).toBeVisible()
  })
  it('should render wifi reports tab', async () => {
    render(<WifiClientList tab={WirelessTabsEnum.CLIENT_REPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId(ReportType.CLIENT)).toBeVisible()
  })
  it('should handle tab click', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<WifiClientList tab={WirelessTabsEnum.GUESTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    userEvent.click(await screen.findByText('Wireless Clients Report'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/users/wifi/reports/clients', hash: '', search: ''
    }))
  })
})

describe.skip('WifiClientList without feature toggle', () => {
  beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(false))
  it('should render wifi client tab', async () => {
    render(<WifiClientList tab={WirelessTabsEnum.CLIENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('ClientDualTable')).toBeVisible()
  })
  it('should render guest tab', async () => {
    render(<WifiClientList tab={WirelessTabsEnum.GUESTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('GuestsTab')).toBeVisible()
  })
})
