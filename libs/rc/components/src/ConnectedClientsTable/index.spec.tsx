import { rest } from 'msw'

import { ClientUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { clientList, clientMeta } from './__tests__/fixtures'

import { ConnectedClientsTable } from '.'

const params = { tenantId: 'tenant-id' }

describe('Connected Clients Table', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        ClientUrlsInfo.getClientList.url,
        (req, res, ctx) => res(ctx.json(clientList))
      ),
      rest.post(
        ClientUrlsInfo.getClientMeta.url,
        (req, res, ctx) => res(ctx.json(clientMeta))
      )
    )
  })

  it('should render table: all columns', async () => {
    render(
      <Provider>
        <ConnectedClientsTable
          showAllColumns={true}
          setConnectedClientCount={jest.fn()}
          searchString={''}/>
      </Provider>, {
        route: { params, path: '/:tenantId/users/aps/clients' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    await screen.findByText('MBP')
    await screen.findByText('iphone')
  })

})
