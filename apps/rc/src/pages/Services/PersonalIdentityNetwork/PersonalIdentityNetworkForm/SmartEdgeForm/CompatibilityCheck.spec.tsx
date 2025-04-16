import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeCompatibilityFixtures, EdgeGeneralFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                     from '@acx-ui/store'
import { mockServer, render, screen }                                   from '@acx-ui/test-utils'

import { CompatibilityCheck } from './CompatibilityCheck'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockEdgeFeatureCompatibilities } = EdgeCompatibilityFixtures

describe('PersonalIdentityNetworkForm - SmartEdgeForm > CompatibilityCheck', () => {
  const params = { tenantId: 'test-tenant' }
  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeFeatureSets.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeFeatureCompatibilities))
      )
    )
  })

  // eslint-disable-next-line max-len
  it('should show compatibility warning when the FW of edge is lower than the requirement', async () => {
    render(
      <Provider>
        <CompatibilityCheck clusterData={mockEdgeClusterList.data[2]} />
      </Provider>, {
        route: {
          params, path: '/:tenantId/services/personalIdentityNetwork/create'
        }
      }
    )

    const warningIcon = await screen.findByTestId('WarningTriangleSolid')
    await userEvent.hover(warningIcon)

    expect(await screen.findByText(/Firmware Version:/i)).toBeInTheDocument()
    expect(screen.getByText('2.1.0.1031')).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getByText(/PIN feature requires your RUCKUS Edge cluster running firmware version/i)).toBeInTheDocument()
    expect(screen.getByText('2.2.0.1')).toBeInTheDocument()
  })
})