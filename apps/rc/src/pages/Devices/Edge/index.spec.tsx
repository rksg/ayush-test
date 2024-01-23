import { rest } from 'msw'

import { useIsSplitOn, useIsTierAllowed }                                  from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, EdgeGeneralFixtures, EdgeUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                        from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { r650Cap } from '../__tests__/fixtures'

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

describe('EdgeList', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
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
      ),
      rest.get(WifiUrlsInfo.getApCapabilities.url,
        (req, res, ctx) => res(ctx.json(r650Cap))
      )
    )
  })

  it('feature flag off', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(false)
    render(
      <Provider>
        <EdgeList />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })
    await screen.findByText('SmartEdge is not enabled')
  })

  it('should create EdgeList successfully', async () => {
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
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <EdgeList />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })
    expect(screen.getByTestId('edge-cluster-table')).toBeVisible()
  })
})
