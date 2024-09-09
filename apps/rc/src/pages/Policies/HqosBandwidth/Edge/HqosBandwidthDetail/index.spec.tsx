import { rest } from 'msw'

import {
  EdgeGeneralFixtures,
  EdgeHqosProfileFixtures,
  EdgeHqosProfilesUrls,
  EdgeUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import EdgeHqosBandwidthDetail from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockEdgeHqosProfileStatusList } = EdgeHqosProfileFixtures

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edge QoS Bandwidth Detail', () => {
  let params: { tenantId: string, policyId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      policyId: 'testPolicyId'
    }

    mockServer.use(
      rest.post(
        EdgeHqosProfilesUrls.getEdgeHqosProfileViewDataList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeHqosProfileStatusList))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      )
    )
  })

  it('should render Detail successfully', async () => {
    render(
      <Provider>
        <EdgeHqosBandwidthDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/policies/hqosBandwidth/:policyId/detail' }
      }
    )

    await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Instances (1)')).toBeVisible()
    await screen.findByRole('img', { name: 'loader' })
    await screen.findByText(/Test-QoS/i)
    const row = await screen.findAllByRole('row', { name: /Edge Cluster/i })
    expect(row.length).toBe(mockEdgeClusterList.data.length)
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <EdgeHqosBandwidthDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/policies/hqosBandwidth/:policyId/detail' }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'QoS Bandwidth'
    })).toBeVisible()
  })
})
