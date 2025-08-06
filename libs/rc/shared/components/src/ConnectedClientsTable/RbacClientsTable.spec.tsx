import { rest } from 'msw'

import { useIsSplitOn  }                                                                       from '@acx-ui/feature-toggle'
import { ClientUrlsInfo, CommonRbacUrlsInfo, CommonUrlsInfo, PersonaUrls, SwitchRbacUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                            from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { mockPersonaTableResult } from '../users/__tests__/fixtures'

import { rbacClientList  }  from './__tests__/fixtures'
import { RbacClientsTable } from './RbacClientsTable'

const params = { tenantId: 'tenant-id' }

const mockedVenuesResult = {
  totalCount: 1,
  page: 1,
  data: [{
    id: 'v1',
    name: 'My Venue'
  }]
}

describe('Connected Clients Table - with RBAC API', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (_, res, ctx) => res(ctx.json(mockedVenuesResult))
      ),
      rest.post(
        ClientUrlsInfo.getClients.url,
        (_, res, ctx) => res(ctx.json(rbacClientList))
      ),
      rest.post(
        CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ totalCount: 0, data: [] }))
      ),
      rest.post(
        CommonRbacUrlsInfo.getWifiNetworksList.url,
        (_, res, ctx) => res(ctx.json({ totalCount: 0, data: [] }))
      ),
      rest.post(
        SwitchRbacUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json({ totalCount: 0, data: [] }))
      ),
      rest.post(
        PersonaUrls.searchPersonaList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(mockPersonaTableResult))
      )
    )
  })

  it('should render table: all columns', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <RbacClientsTable
          showAllColumns={true}
          setConnectedClientCount={jest.fn()}
          searchString={''}/>
      </Provider>, {
        route: { params, path: '/:tenantId/users/aps/clients' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    await screen.findByText('MBP')
    await screen.findByText('iphone')
    expect((await screen.findAllByText('Network Type')).length).toBeGreaterThan(1)
  })

})