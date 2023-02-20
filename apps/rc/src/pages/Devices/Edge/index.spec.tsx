import { rest } from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockEdgeList } from './__tests__/fixtures'

import EdgeList from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('EdgeList', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      )
    )
  })

  it('feature flag off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <EdgeList />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/list' }
      })
    await screen.findByText('SmartEdge is not enabled')
  })

  it('should create EdgeList successfully', async () => {
    render(
      <Provider>
        <EdgeList />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/list' }
      })
    const row = await screen.findAllByRole('row', { name: /Smart Edge/i })
    expect(row.length).toBe(5)
  })
})
