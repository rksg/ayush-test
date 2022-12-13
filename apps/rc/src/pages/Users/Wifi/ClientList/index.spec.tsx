import { rest } from 'msw'

import { ClientUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'


import { clientList, clientMeta } from '../__tests__/fixtures'

import ClientList from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('ClientList', () => {
  const params = { tenantId: 'tenant-id', activeTab: 'clients' }

  beforeEach(() => {
    mockServer.use(
      rest.post(ClientUrlsInfo.getClientList.url,
        (_, res, ctx) => res(ctx.json({ data: clientList }))
      ),
      rest.post(ClientUrlsInfo.getClientMeta.url,
        (_, res, ctx) => res(ctx.json(clientMeta))
      )
    )
  })

  it('should render list correctly', async () => {
    render(
      <Provider>
        <ClientList />
      </Provider>, {
        route: { params, path: '/:tenantId/users/wifi/:activeTab' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    fireEvent.click(await screen.findByRole('tab', { name: 'Guest Pass Credentials' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/users/wifi/guests`,
      hash: '',
      search: ''
    })
  })
})
