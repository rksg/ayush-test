import { rest } from 'msw'

import {
  EdgeTnmServiceFixtures,
  EdgeTnmServiceUrls
} from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { EdgeTnmDetails } from '.'

const { mockTnmServiceDataList, mockTnmHostList } = EdgeTnmServiceFixtures
const mockPath = '/:tenantId/services/edgeTnmServices/:serviceId'

const mockTnm1 = mockTnmServiceDataList[0]

jest.mock('./EdgeTnmGraphTable', () => ({
  ...jest.requireActual('./EdgeTnmGraphTable'),
  EdgeTnmHostGraphTable: () => <div dataa-testid='rc-EdgeTnmHostGraphTable' />
}))

describe('Edge TNM Service Details', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: mockTnm1.id
    }

    mockServer.use(
      rest.get(
        EdgeTnmServiceUrls.getEdgeTnmServiceList.url,
        (_, res, ctx) => res(ctx.json(mockTnmServiceDataList))
      ),
      rest.get(
        EdgeTnmServiceUrls.getEdgeTnmHostList.url,
        (_, res, ctx) => res(ctx.json(mockTnmHostList))
      )
    )
  })

  it('should create table successfully', async () => {
    render(
      <Provider>
        <EdgeTnmDetails />
      </Provider>, {
        route: { params, path: mockPath }
      }
    )
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Mocked_TNMService_1')).toBeVisible()
    const rows = screen.getAllByRole('row', { name: /example-host8/i })
    expect(rows.length).toBe(1)
  })
})