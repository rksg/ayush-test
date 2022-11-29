import { rest } from 'msw'

import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
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
        CommonUrlsInfo.getClientList.url,
        (req, res, ctx) => res(ctx.json(clientList))
      ),
      rest.post(
        CommonUrlsInfo.getClientMeta.url,
        (req, res, ctx) => res(ctx.json(clientMeta))
      )
    )
  })

  it('should render table: all columns', async () => {
    render(
      <Provider>
        <ConnectedClientsTable showAllColumns={true}/>
      </Provider>, {
        route: { params, path: '/:tenantId/users/aps/clients' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    // expect(asFragment()).toMatchSnapshot()

    await screen.findByText('MBP')
    await screen.findByText('iphone')
  })

})
