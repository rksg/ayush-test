import { rest } from 'msw'

import {
  EdgeTnmServiceFixtures,
  EdgeTnmServiceUrls
} from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { EdgeTnmHostTable } from './EdgeTnmHostTable'

const { mockTnmHostList, mockTnmServiceDataList, mockTnmHostGroups } = EdgeTnmServiceFixtures
const mockPath = '/:tenantId/services/edgeTnmServices/:serviceId'

const mockTnm = mockTnmServiceDataList[0]
describe('Edge TNM Service Hosts', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    serviceId: mockTnm.id
  }

  beforeEach(() => {
    mockServer.use(
      rest.get(
        EdgeTnmServiceUrls.getEdgeTnmHostList.url,
        (_, res, ctx) => res(ctx.json(mockTnmHostList))
      ),
      rest.get(
        EdgeTnmServiceUrls.getEdgeTnmHostGroupList.url,
        (_, res, ctx) => res(ctx.json(mockTnmHostGroups))
      )
    )
  })

  it('should create table successfully', async () => {
    render(
      <Provider>
        <EdgeTnmHostTable serviceId={mockTnm.id}/>
      </Provider>, {
        route: { path: mockPath, params }
      }
    )
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    const rows = screen.getAllByRole('row', { name: /example-host/i })
    expect(rows.length).toBe(1)
    expect(rows[0]).toHaveTextContent('Zabbix server')
  })
})