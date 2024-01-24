import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                   from '@acx-ui/feature-toggle'
import { ClientUrlsInfo, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { ReportType }                     from '@acx-ui/reports/components'
import { Provider }                       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { GuestClient } from '../__tests__/fixtures'

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

jest.mock('./ClientTab', () => ({
  ...jest.requireActual('./ClientTab'),
  ClientTab: () => <div data-testid='ClientTab' />
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
    await userEvent.click(await screen.findByText('Wireless Clients Report'))
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

describe('WifiClientList render', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        ClientUrlsInfo.getClientList.url,
        (_, res, ctx) => res(ctx.json({ data: [], page: 1, totalCount: 0 }))
      ),
      rest.post(
        ClientUrlsInfo.getClientMeta.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(CommonUrlsInfo.getGuestsList.url, (req, res, ctx) =>
        res(ctx.json(GuestClient))
      )
    )
  })
  it('render clientList', async () => {
    render(<WifiClientList tab={WirelessTabsEnum.CLIENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })

    expect(await screen.findByRole('tab', {
      name: /clients list \(0\)/i
    })).toBeVisible()
    expect(await screen.findByTestId('ClientTab')).toBeVisible()
  })
})
