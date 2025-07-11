import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { clientApi }       from '@acx-ui/rc/services'
import { ClientUrlsInfo }  from '@acx-ui/rc/utils'
import { ReportType }      from '@acx-ui/reports/components'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { GuestList, GuestClients } from '../__tests__/fixtures'

import { WifiClientList, WirelessTabsEnum } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const mockGuestData = { data: GuestList, isLoading: false }

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetGuestsListQuery: () => mockGuestData
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  ClientDualTable: () => <div data-testid='ClientDualTable' />
}))

jest.mock('./GuestsTab', () => ({
  GuestsTab: () => <div data-testid='GuestsTab' />
}))

jest.mock('./ClientTab', () => ({
  ClientTab: () => <div data-testid='ClientTab' />
}))

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: (props: { reportName: ReportType }) => <div data-testid={props.reportName} />
}))

jest.mock('@acx-ui/analytics/components', () => ({
  NetworkFilter: () => <div data-testid='NetworkFilter' />
}))

describe('WifiClientList', () => {
  const mockedReqClientMeta = jest.fn()
  beforeEach(() => {
    store.dispatch(clientApi.util.resetApiState())
    mockedReqClientMeta.mockClear()
    mockServer.use(
      rest.post(ClientUrlsInfo.getClients.url,
        (_, res, ctx) => res(ctx.json({ data: [], page: 1, totalCount: 0 }))
      ),
      rest.post(ClientUrlsInfo.getGuests.url,
        (_, res, ctx) => res(ctx.json(GuestClients))
      )
    )
  })
  it('should render wifi client tab', async () => {
    render(<WifiClientList tab={WirelessTabsEnum.CLIENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('ClientTab')).toBeVisible()
    expect(await screen.findByRole('tab', {
      name: /clients list \(0\)/i
    })).toBeVisible()

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
    render(<WifiClientList tab={WirelessTabsEnum.GUESTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('Wireless Clients Report'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/users/wifi/reports/clients', hash: '', search: ''
    }))
  })
})

