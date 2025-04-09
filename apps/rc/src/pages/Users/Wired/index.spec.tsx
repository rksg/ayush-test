import { rest } from 'msw'

import { useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { clientApi, switchApi }               from '@acx-ui/rc/services'
import { ClientUrlsInfo, SwitchRbacUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                    from '@acx-ui/store'
import { mockServer, render, screen }         from '@acx-ui/test-utils'

import { WiredClientList, WiredTabsEnum } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  SwitchClientsTable: () => <div data-testid='SwitchClientsTable' />
}))

jest.mock('./ApWiredClientTable', () => ({
  //...jest.requireActual('./ApWiredClientTable'),
  ApWiredClientTable: () => <div data-testid='ApWiredClientTable' />
}))

describe('WiredClientList', () => {
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  beforeEach(() => {
    store.dispatch(clientApi.util.resetApiState())
    store.dispatch(switchApi.util.resetApiState())

    mockServer.use(
      rest.post(SwitchRbacUrlsInfo.getSwitchList.url,
        (_, res, ctx) => res(ctx.json({ data: [], page: 1, totalCount: 0 }))
      ),
      rest.post(SwitchRbacUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json({ data: [], page: 1, totalCount: 0 }))
      ),
      rest.post(ClientUrlsInfo.getApWiredClients.url,
        (_, res, ctx) => res(ctx.json({ data: [], page: 1, totalCount: 0 }))
      )
    )
  })

  it('should render switch wired client tab', async () => {
    render(<WiredClientList tab={WiredTabsEnum.SWITCH_CLIENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })

    expect(await screen.findByTestId('SwitchClientsTable')).toBeVisible()
    expect(await screen.findByRole('tab', {
      name: /Switch Clients \(0\)/i
    })).toBeVisible()

  })
  it('should render ap wired client tab', async () => {
    render(<WiredClientList tab={WiredTabsEnum.AP_CLIENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })

    expect(await screen.findByTestId('ApWiredClientTable')).toBeVisible()
    expect(await screen.findByRole('tab', {
      name: /AP Clients \(0\)/i
    })).toBeVisible()
  })
})