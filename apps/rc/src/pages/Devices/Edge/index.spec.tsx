import { rest } from 'msw'

import { Features }                                          from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                             from '@acx-ui/rc/components'
import { CommonUrlsInfo, EdgeGeneralFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                          from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'


import EdgeList from './index'

const { mockEdgeList } = EdgeGeneralFixtures
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('./EdgeClusterTable', () => ({
  EdgeClusterTable: () => <div data-testid='edge-cluster-table' />
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useIsEdgeFeatureReady: jest.fn()
}))

describe('EdgeList', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    jest.clearAllMocks()
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (req, res, ctx) => res(ctx.json([]))
      )
    )
  })

  it('should create EdgeList successfully', async () => {
    jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff !== Features.EDGE_HA_TOGGLE)
    render(
      <Provider>
        <EdgeList />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })
    const row = await screen.findAllByRole('row', { name: /Smart Edge/i })
    expect(row.length).toBe(5)
  })

  it('should show edge cluster table when HA FF is on', async () => {
    jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_HA_TOGGLE)
    render(
      <Provider>
        <EdgeList />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })
    expect(screen.getByTestId('edge-cluster-table')).toBeVisible()
  })
})
