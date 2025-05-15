import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  EdgeCompatibilityFixtures,
  EdgeGeneralFixtures,
  EdgeHqosProfileFixtures,
  EdgeHqosProfilesUrls,
  EdgeUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                                                      from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import EdgeHqosBandwidthDetail from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockEdgeHqosProfileStatusList } = EdgeHqosProfileFixtures
const { mockEdgeHqosCompatibilities } = EdgeCompatibilityFixtures

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edge HQoS Bandwidth Detail', () => {
  let params: { tenantId: string, policyId: string }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    // eslint-disable-next-line max-len
    jest.mocked(useIsTierAllowed).mockImplementation(ff => ff !== TierFeatures.SERVICE_CATALOG_UPDATED)

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
      ),
      rest.post(
        EdgeUrlsInfo.getHqosEdgeCompatibilities.url,
        (req, res, ctx) => res(ctx.json(mockEdgeHqosCompatibilities))
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
      name: 'HQoS Bandwidth'
    })).toBeVisible()
  })

  it('should have compatible warning', async () => {
    render(
      <Provider>
        <EdgeHqosBandwidthDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/policies/hqosBandwidth/:policyId/detail' }
      }
    )

    const hqosWarning = await screen.findByText(/HQoS is not able to be brought up on/)
    // eslint-disable-next-line testing-library/no-node-access
    const detailBtn = within(hqosWarning.closest('.ant-space') as HTMLElement)
      .getByRole('button', { name: 'See details' })

    await userEvent.click(detailBtn)
    const compatibleInfoDrawer = await screen.findByRole('dialog')

    // eslint-disable-next-line max-len
    expect(await within(compatibleInfoDrawer).findByText(/RUCKUS Edge Firmware/)).toBeInTheDocument()
    expect(within(compatibleInfoDrawer).getByText('2.1.0.200')).toBeValid()
    expect(within(compatibleInfoDrawer).getByText('1 / 6')).toBeValid()
  })
})
