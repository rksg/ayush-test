import '@testing-library/jest-dom'
import { rest } from 'msw'

import { MspRbacUrlsInfo }            from '@acx-ui/msp/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import SolutionTokenSettingsTabContent from './SolutionTokenSettingsTabContent'

const list = [
  {
    featureType: 'SLTN_PI_NET',
    featureName: 'Personal Identity Network',
    maxQuantity: 0,
    enabled: false,
    capped: false,
    licenseToken: 1,
    featureCostUnit: 'per Tunnel',
    featureUnit: 'Tunnels'
  },
  {
    featureType: 'SLTN_ADAPT_POLICY',
    featureName: 'Adaptive Policy',
    maxQuantity: 0,
    enabled: false,
    capped: false,
    licenseToken: 5,
    featureCostUnit: 'per Policy',
    featureUnit: 'Policies'
  }
]

describe('SolutionTokenLicenses', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        MspRbacUrlsInfo.getSolutionTokenSettings.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render settings content', async () => {
    render(
      <Provider>
        <SolutionTokenSettingsTabContent isTabSelected={true} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/administration/subscriptions/compliance' }
      })

    expect(await screen.findByText('Personal Identity Network')).toBeVisible()
  })
})
