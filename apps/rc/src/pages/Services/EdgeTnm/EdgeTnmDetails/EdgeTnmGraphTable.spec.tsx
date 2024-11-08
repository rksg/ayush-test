import { rest } from 'msw'

import {
  EdgeTnmServiceFixtures,
  EdgeTnmServiceUrls
} from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { EdgeTnmHostGraphTable } from './EdgeTnmGraphTable'

const { mockTnmHostGraphsConfig, mockTnmServiceDataList } = EdgeTnmServiceFixtures
const mockPath = '/:tenantId/services/edgeTnmServices/:serviceId'

const mockTnm = mockTnmServiceDataList[0]
describe('Edge TNM Service Host Graphs', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    serviceId: mockTnm.id
  }

  beforeEach(() => {
    mockServer.use(
      rest.get(
        EdgeTnmServiceUrls.edgeTnmHostGraphsConfig.url,
        (_, res, ctx) => res(ctx.json(mockTnmHostGraphsConfig))
      )
    )
  })

  it('should create table successfully', async () => {
    render(
      <Provider>
        <EdgeTnmHostGraphTable serviceId={mockTnm.id} hostId='mock-host' />
      </Provider>, {
        route: { path: mockPath, params }
      }
    )
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    const rows = screen.getAllByRole('row', { name: /Interface ethernet /i })
    expect(rows.length).toBe(1)
    expect(rows[0]).toHaveTextContent('Normal')
  })
})